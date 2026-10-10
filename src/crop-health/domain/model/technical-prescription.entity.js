import {requireDate, requireId, requireText} from "./validation.js";

/**
 * Digital prescription issued by the agronomist for an inspected pest report.
 *
 * @class TechnicalPrescription
 */
export class TechnicalPrescription {
    /**
     * @param {Object} params - Entity attributes.
     * @param {number} [params.id=0] - Prescription identifier.
     * @param {number} params.reportId - Treated pest report.
     * @param {number} params.agronomistId - Agronomist who prescribes.
     * @param {string} params.recommendedProducts - Agrochemical.
     * @param {string} params.dosageInstructions - Dosage and instructions.
     * @param {string} params.applicationDate - `YYYY-MM-DD`.
     */
    constructor({ id = 0, reportId, agronomistId, recommendedProducts, dosageInstructions, applicationDate }) {
        requireId(reportId);
        requireId(agronomistId);
        requireText(recommendedProducts);
        requireText(dosageInstructions);
        requireDate(applicationDate);
        this.id = id;
        this.reportId = reportId;
        this.agronomistId = agronomistId;
        this.recommendedProducts = recommendedProducts;
        this.dosageInstructions = dosageInstructions;
        this.applicationDate = applicationDate;
    }
}
