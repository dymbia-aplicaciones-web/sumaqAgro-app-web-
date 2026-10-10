/**
 * Quality category assigned to a graded batch.
 * @readonly
 * @enum {string}
 */
export const QualityCategory = Object.freeze({
    PREMIUM_GOLD: 'PREMIUM_GOLD',
    STANDARD: 'STANDARD',
    B_GRADE_REQUIRES_SORTING: 'B_GRADE_REQUIRES_SORTING',
    SPECIALTY_COFFEE: 'SPECIALTY_COFFEE',
    COMMERCIAL_COFFEE: 'COMMERCIAL_COFFEE'
});

/**
 * An issued certificate is either active or revoked.
 * @readonly
 * @enum {string}
 */
export const CertificateStatus = Object.freeze({ ACTIVE: 'ACTIVE', REVOKED: 'REVOKED' });

/**
 * Batch workflow: delivered → graded → certified.
 * @readonly
 * @enum {string}
 */
export const BatchStatus = Object.freeze({ PENDING_GRADING: 'PENDING_GRADING', GRADED: 'GRADED', CERTIFIED: 'CERTIFIED' });

/**
 * Crops that can be certified.
 * @readonly
 * @enum {string}
 */
export const HarvestCropType = Object.freeze({ ANDEAN_POTATO: 'ANDEAN_POTATO', SPECIALTY_COFFEE: 'SPECIALTY_COFFEE' });

/** Specialty coffee threshold of the SCA protocol. */
export const SPECIALTY_COFFEE_SCORE = 80;
