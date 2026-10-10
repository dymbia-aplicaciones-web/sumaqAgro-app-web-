import {INVALID_DATA, requireChoice, requireId, requireText} from "./validation.js";

/** Severities of a pest report (`crop-health.severities.*`). */
export const PEST_SEVERITIES = ['LOW', 'MEDIUM', 'HIGH', 'SEVERE'];

/** Workflow of a pest report (`crop-health.report-statuses.*`). */
export const PEST_REPORT_STATUSES = ['PENDING', 'INSPECTED', 'RESOLVED'];

/**
 * Pest or disease reported by a farmer on one of their plots.
 * Workflow: PENDING → INSPECTED (after the field inspection) → RESOLVED (after the prescription).
 *
 * @class PestReport
 */
export class PestReport {
    /**
     * @param {Object} params - Entity attributes.
     * @param {number} [params.id=0] - Report identifier.
     * @param {number} params.plotId - Affected plot.
     * @param {string} [params.plotName=''] - Name of the plot.
     * @param {number} params.reporterId - Farmer who reported.
     * @param {string} params.description - Symptoms (at least 10 characters).
     * @param {string} [params.severity='MEDIUM'] - Severity.
     * @param {string} [params.status='PENDING'] - Workflow status.
     * @param {string} [params.photo=''] - Photo URL.
     */
    constructor({ id = 0, plotId, plotName = '', reporterId, description, severity = 'MEDIUM', status = 'PENDING',
                    photo = '' }) {
        requireId(plotId);
        requireId(reporterId);
        requireText(description, 10);
        requireChoice(severity, PEST_SEVERITIES);
        requireChoice(status, PEST_REPORT_STATUSES);
        if (photo && !/^https?:\/\/\S+$/.test(photo)) throw new Error(INVALID_DATA);
        this.id = id;
        this.plotId = plotId;
        this.plotName = plotName;
        this.reporterId = reporterId;
        this.description = description;
        this.severity = severity;
        this.status = status;
        this.photo = photo;
    }

    /** Marks the report as inspected after the field visit. */
    markInspected() {
        if (this.status !== 'PENDING') throw new Error('crop-health.errors.invalid-transition');
        this.status = 'INSPECTED';
    }

    /** Closes the report after the technical prescription. */
    resolve() {
        if (this.status !== 'INSPECTED') throw new Error('crop-health.errors.invalid-transition');
        this.status = 'RESOLVED';
    }

    /** @returns {PestReport} Copy used to try a change. */
    clone() {
        return new PestReport({...this});
    }
}
