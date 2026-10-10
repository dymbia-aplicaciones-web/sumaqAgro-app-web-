/**
 * Application service store for the Harvest Certification bounded context
 * (Angular `HarvestCertificationStore`): batches, certificates and members of
 * the cooperative, the certificate preview and the public QR verification.
 *
 * @module useHarvestCertificationStore
 */
import {defineStore} from "pinia";
import {computed, ref} from "vue";
import {HarvestCertificationApi} from "../infrastructure/harvest-certification-api.js";
import {HarvestBatchAssembler} from "../infrastructure/harvest-batch.assembler.js";
import {QualityCertificateAssembler} from "../infrastructure/quality-certificate.assembler.js";
import {HarvestBatch} from "../domain/model/harvest-batch.entity.js";
import {BatchStatus, CertificateStatus, HarvestCropType} from "../domain/model/harvest-certification.enums.js";
import {classifyQuality, validateEvaluation} from "../domain/model/quality-grading.js";
import {resourcesFromResponse} from "../../shared/infrastructure/base-assembler.js";

const harvestCertificationApi = new HarvestCertificationApi();

/** Cooperative of the demo (Angular `load(cooperativeId = 1)`). */
const DEMO_COOPERATIVE_ID = 1;

/** Issuer of the demo certificates: the cooperative director (user 3). */
const DEMO_ISSUER = { userId: 3, name: 'Cristian Santana' };

/**
 * Reactive store that exposes Harvest Certification commands and queries.
 *
 * @returns {Object} Store state and actions.
 */
const useHarvestCertificationStore = defineStore('harvest-certification', () => {
    /** @type {import('vue').Ref<HarvestBatch[]>} */
    const batches = ref([]);
    /** @type {import('vue').Ref<import('../domain/model/quality-certificate.entity.js').QualityCertificate[]>} */
    const certificates = ref([]);
    /** @type {import('vue').Ref<Array<{id: number, name: string, plots: Array<Object>}>>} Members with their plots. */
    const members = ref([]);
    const loading = ref(false);
    /** @type {import('vue').Ref<string|null>} i18n key or message of the last error. */
    const error = ref(null);
    /** Certificates that are still valid. */
    const activeCertificates = computed(() => certificates.value.filter(item => item.isActive()));

    function fail(cause) {
        console.error(cause);
        error.value = cause.message;
        loading.value = false;
    }

    /**
     * Loads batches, certificates and members of the cooperative.
     * @param {number} [cooperativeId=1] - Cooperative.
     */
    function load(cooperativeId = DEMO_COOPERATIVE_ID) {
        loading.value = true;
        error.value = null;
        Promise.all([
            harvestCertificationApi.getBatchesByCooperative(cooperativeId),
            harvestCertificationApi.getCertificates(),
            harvestCertificationApi.getMembersByCooperative(cooperativeId)
        ]).then(([batchesResponse, certificatesResponse, membersResponse]) => {
            batches.value = HarvestBatchAssembler.toEntitiesFromResponse(batchesResponse);
            certificates.value = QualityCertificateAssembler.toEntitiesFromResponse(certificatesResponse);
            members.value = resourcesFromResponse(membersResponse, 'members')
                .map(member => ({ id: Number(member.id), name: member.name ?? member.fullName, plots: member.plots ?? [] }));
            loading.value = false;
        }).catch(fail);
    }

    /**
     * Validates the intake and grading sheet and builds the certificate preview:
     * quality category, SHA-256 fingerprint and QR token.
     * @param {Object} form - memberId, plotId, weights and grading of the dialog.
     * @returns {Promise<{batch: HarvestBatch, verificationToken: string, sha256Hash: string, issuedAt: string}|{key: string, params?: Object}>}
     * The draft, or the validation error.
     */
    async function prepareDraft(form) {
        const member = members.value.find(item => item.id === form.memberId);
        const plot = member?.plots.find(item => item.id === form.plotId);
        if (!member || !plot) return { key: 'harvest-certification.errors.select-member-plot' };
        const evaluation = { ...form, cropType: plot.cropType };
        const invalid = validateEvaluation(evaluation);
        if (invalid) return invalid;
        const isPotato = plot.cropType === HarvestCropType.ANDEAN_POTATO;
        const batch = new HarvestBatch({
            id: 0,
            code: `BATCH-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`,
            cooperativeId: DEMO_COOPERATIVE_ID,
            memberId: member.id,
            memberName: member.name,
            plotId: plot.id,
            plotName: plot.name,
            plotRegion: plot.region,
            coordinates: plot.coordinates,
            campaignId: plot.campaignId,
            cropType: plot.cropType,
            variety: plot.variety,
            collectedAt: new Date().toISOString().slice(0, 10),
            grossKg: form.grossKg,
            tareKg: form.tareKg,
            sampleKg: form.sampleKg,
            potatoGrading: isPotato ? {
                firstPercentage: form.firstPercentage, secondPercentage: form.secondPercentage,
                thirdPercentage: form.thirdPercentage, weevilDamagePercentage: form.weevilDamagePercentage
            } : null,
            coffeeCupping: isPotato ? null : { aroma: 0, flavor: 0, acidity: 0, body: 0, totalScore: form.scaScore },
            qualityCategory: classifyQuality(evaluation),
            status: BatchStatus.GRADED
        });
        const { id, ...newBatch } = HarvestBatchAssembler.toResourceFromEntity(batch);
        const issuedAt = new Date().toISOString();
        const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(JSON.stringify({ batch: newBatch, issuedAt })));
        return {
            batch,
            verificationToken: crypto.randomUUID(),
            sha256Hash: Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2, '0')).join(''),
            issuedAt
        };
    }

    /**
     * Registers the graded batch, issues its certificate and marks the batch as
     * certified (the Fake API needs a second request to update the batch status).
     * @param {Object} draft - Draft built by `prepareDraft`.
     * @returns {Promise<{certificate: Object|null, batch: HarvestBatch}|null>} Issued certificate and batch.
     */
    function issue(draft) {
        loading.value = true;
        error.value = null;
        let saved;
        return harvestCertificationApi.createBatch(HarvestBatchAssembler.toResourceFromEntity(draft.batch))
            .then(response => {
                saved = HarvestBatchAssembler.toEntityFromResource(response.data);
                batches.value = [saved, ...batches.value];
                if (!saved.canIssueCertificate) throw new Error('harvest-certification.errors.batch-not-graded');
                if (certificates.value.some(item => item.harvestBatchId === saved.id)) throw new Error('harvest-certification.errors.already-certified');
                return harvestCertificationApi.createCertificate({
                    harvestBatchId: saved.id,
                    certificateNumber: `CERT-${saved.code}`,
                    sha256Hash: draft.sha256Hash,
                    verificationToken: draft.verificationToken,
                    issuedByUserId: DEMO_ISSUER.userId,
                    issuedByName: DEMO_ISSUER.name,
                    issuedAt: draft.issuedAt,
                    status: CertificateStatus.ACTIVE,
                    revokedReason: null
                });
            })
            .then(response => {
                const certificate = QualityCertificateAssembler.toEntityFromResource(response.data);
                certificates.value = [certificate, ...certificates.value];
                return harvestCertificationApi.updateBatch({ ...HarvestBatchAssembler.toResourceFromEntity(saved), status: BatchStatus.CERTIFIED })
                    .then(batchResponse => {
                        const updated = HarvestBatchAssembler.toEntityFromResource(batchResponse.data);
                        batches.value = batches.value.map(item => item.id === updated.id ? updated : item);
                        loading.value = false;
                        return { certificate, batch: updated };
                    });
            })
            .catch(cause => {
                fail(cause);
                return saved ? { certificate: null, batch: saved } : null;
            });
    }

    /**
     * Public verification of a certificate from its QR token: the token finds
     * the certificate and its `harvestBatchId` finds the batch.
     * @param {string} token - QR token.
     * @returns {Promise<{certificate: Object, batch: HarvestBatch|null}|null>} `null` when the token is unknown.
     */
    function verifyCertificate(token) {
        return harvestCertificationApi.getCertificatesByToken(token.trim())
            .then(response => {
                const [certificate] = QualityCertificateAssembler.toEntitiesFromResponse(response);
                if (!certificate) return null;
                if (!certificate.isActive()) return { certificate, batch: null };
                return harvestCertificationApi.getBatchById(certificate.harvestBatchId)
                    .then(batchResponse => ({ certificate, batch: HarvestBatchAssembler.toEntityFromResource(batchResponse.data) }));
            });
    }

    return {
        batches,
        certificates,
        members,
        loading,
        error,
        activeCertificates,
        load,
        prepareDraft,
        issue,
        verifyCertificate
    };
});

export default useHarvestCertificationStore;
