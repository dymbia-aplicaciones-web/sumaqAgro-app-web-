import {BatchStatus, HarvestCropType} from "./harvest-certification.enums.js";

/**
 * Harvest batch delivered by a cooperative member, with its weights and grading.
 *
 * @class HarvestBatch
 */
export class HarvestBatch {
    /**
     * @param {Object} params - Entity attributes (same fields as `/harvest-batches`).
     */
    constructor({ id = null, code = '', cooperativeId = null, memberId = null, memberName = '', plotId = null,
                    plotName = '', plotRegion = '', coordinates = '', campaignId = null,
                    cropType = HarvestCropType.ANDEAN_POTATO, variety = '', collectedAt = '', grossKg = 0, tareKg = 0,
                    sampleKg = 0, potatoGrading = null, coffeeCupping = null, qualityCategory = null,
                    status = BatchStatus.PENDING_GRADING }) {
        this.id = id;
        this.code = code;
        this.cooperativeId = cooperativeId;
        this.memberId = memberId;
        this.memberName = memberName;
        this.plotId = plotId;
        this.plotName = plotName;
        this.plotRegion = plotRegion;
        this.coordinates = coordinates;
        this.campaignId = campaignId;
        this.cropType = cropType;
        this.variety = variety;
        this.collectedAt = collectedAt;
        this.grossKg = grossKg;
        this.tareKg = tareKg;
        this.sampleKg = sampleKg;
        /** @type {?{firstPercentage: number, secondPercentage: number, thirdPercentage: number, weevilDamagePercentage: number}} */
        this.potatoGrading = potatoGrading;
        /** @type {?{aroma: number, flavor: number, acidity: number, body: number, totalScore: number}} */
        this.coffeeCupping = coffeeCupping;
        this.qualityCategory = qualityCategory;
        this.status = status;
    }

    /** @returns {number} Net weight: gross minus tare, never negative. */
    get netKg() {
        return Math.max(0, this.grossKg - this.tareKg);
    }

    /** @returns {boolean} A batch can be certified once graded and with a quality category. */
    get canIssueCertificate() {
        return this.status === BatchStatus.GRADED && this.qualityCategory !== null;
    }
}
