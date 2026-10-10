import {INVALID_DATA, requireChoice, requireDate, requireId, requireText} from "./validation.js";

/**
 * Field visit scheduled for a pest report and completed by the agronomist.
 *
 * @class FieldInspection
 */
export class FieldInspection {
    /**
     * @param {Object} params - Entity attributes.
     * @param {number} [params.id=0] - Inspection identifier.
     * @param {number} params.reportId - Inspected pest report.
     * @param {string} params.scheduledAt - Visit date-time (ISO 8601).
     * @param {string} [params.notes=''] - Notes.
     * @param {string} [params.status='SCHEDULED'] - `SCHEDULED` or `COMPLETED`.
     * @param {?string} [params.completedAt=null] - Date-time of the visit.
     * @param {?number} [params.inspectorUserId=null] - Agronomist who visited.
     */
    constructor({ id = 0, reportId, scheduledAt, notes = '', status = 'SCHEDULED', completedAt = null,
                    inspectorUserId = null }) {
        requireId(reportId);
        requireDate(scheduledAt);
        requireChoice(status, ['SCHEDULED', 'COMPLETED']);
        if (status === 'COMPLETED') {
            requireDate(completedAt ?? '');
            requireId(inspectorUserId ?? 0);
            requireText(notes, 10);
            if (Date.parse(completedAt) < Date.parse(scheduledAt)) throw new Error(INVALID_DATA);
        }
        this.id = id;
        this.reportId = reportId;
        this.scheduledAt = scheduledAt;
        this.notes = notes;
        this.status = status;
        this.completedAt = completedAt;
        this.inspectorUserId = inspectorUserId;
    }

    /**
     * Records the visit: notes of at least 10 characters, never before the scheduled date.
     * @param {string} notes - Findings.
     * @param {number} inspectorUserId - Agronomist.
     * @param {string} [completedAt] - Date-time of the visit.
     */
    complete(notes, inspectorUserId, completedAt = new Date().toISOString()) {
        if (this.status !== 'SCHEDULED') throw new Error('crop-health.errors.invalid-transition');
        requireText(notes, 10);
        requireId(inspectorUserId);
        requireDate(completedAt);
        if (Date.parse(completedAt) < Date.parse(this.scheduledAt)) throw new Error('crop-health.errors.visit-not-due');
        this.notes = notes.trim();
        this.inspectorUserId = inspectorUserId;
        this.completedAt = completedAt;
        this.status = 'COMPLETED';
    }

    /** @returns {FieldInspection} Copy used to try a change. */
    clone() {
        return new FieldInspection({...this});
    }
}
