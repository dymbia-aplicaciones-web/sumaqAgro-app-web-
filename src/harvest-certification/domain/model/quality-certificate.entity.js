import {CertificateStatus} from "./harvest-certification.enums.js";

/**
 * Quality certificate of a harvest batch, verifiable through its QR token.
 *
 * @class QualityCertificate
 */
export class QualityCertificate {
    /**
     * @param {Object} params - Entity attributes (same fields as `/quality-certificates`).
     */
    constructor({ id = null, harvestBatchId = null, certificateNumber = '', sha256Hash = '', verificationToken = '',
                    issuedByUserId = null, issuedByName = '', issuedAt = '', status = CertificateStatus.ACTIVE,
                    revokedReason = null }) {
        this.id = id;
        this.harvestBatchId = harvestBatchId;
        this.certificateNumber = certificateNumber;
        this.sha256Hash = sha256Hash;
        this.verificationToken = verificationToken;
        this.issuedByUserId = issuedByUserId;
        this.issuedByName = issuedByName;
        this.issuedAt = issuedAt;
        this.status = status;
        this.revokedReason = revokedReason;
    }

    /** @returns {boolean} `true` while the certificate is valid. */
    isActive() {
        return this.status === CertificateStatus.ACTIVE;
    }

    /** @returns {boolean} Demo certificates use `demo-` tokens and do not show their hash. */
    isDemo() {
        return this.verificationToken.startsWith('demo-');
    }
}
