import {requireChoice, requireDate, requireText} from "./validation.js";

/**
 * Frost, drought or rain alert for a region (SENAMHI by default).
 *
 * @class AgroclimaticAlert
 */
export class AgroclimaticAlert {
    /**
     * @param {Object} params - Entity attributes.
     * @param {number} [params.id=0] - Alert identifier.
     * @param {string} params.title - Title.
     * @param {string} params.description - Description.
     * @param {string} [params.severity='LOW'] - `LOW`, `MEDIUM`, `HIGH` or `CRITICAL`.
     * @param {string} params.region - Affected region.
     * @param {string} [params.issuedAt] - Date-time of the alert.
     * @param {string} [params.source='SENAMHI'] - Source.
     * @param {string} [params.category='WEATHER'] - `WEATHER` or `PHYTOSANITARY`.
     * @param {boolean} [params.read=false] - Whether the farmer acknowledged the notification.
     * @param {string} [params.attentionStatus='NOT_STARTED'] - Action-plan status.
     * @param {string} [params.updatedAt] - Last information update.
     * @param {Array<Object>} [params.tasks=[]] - Ordered action-plan measures.
     * @param {Array<Object>} [params.timeline=[]] - Operational milestones linked to measures.
     */
    constructor({ id = 0, title, description, severity = 'LOW', region, issuedAt, source = 'SENAMHI',
                    category = 'WEATHER', read = false, attentionStatus = 'NOT_STARTED', updatedAt, tasks = [], timeline = [] }) {
        requireText(title);
        requireText(description);
        requireText(region);
        requireChoice(severity, ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']);
        requireChoice(category, ['WEATHER', 'PHYTOSANITARY']);
        requireChoice(attentionStatus, ['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED']);
        if (issuedAt !== undefined) requireDate(issuedAt);
        this.id = id;
        this.title = title;
        this.description = description;
        this.severity = severity;
        this.region = region;
        this.issuedAt = issuedAt ?? new Date().toISOString();
        this.source = source;
        this.category = category;
        this.read = Boolean(read);
        this.attentionStatus = attentionStatus;
        this.updatedAt = updatedAt ?? this.issuedAt;
        this.tasks = tasks.map((task, index) => ({
            id: Number(task.id ?? index + 1),
            title: String(task.title ?? ''),
            description: String(task.description ?? ''),
            scheduledTime: String(task.scheduledTime ?? ''),
            actionLabel: String(task.actionLabel ?? ''),
            kind: String(task.kind ?? 'ACTION'),
            status: task.status === 'COMPLETED' ? 'COMPLETED' : 'PENDING',
            completedAt: task.completedAt ?? null
        }));
        this.timeline = timeline.map((entry, index) => ({
            id: Number(entry.id ?? index + 1),
            taskId: Number(entry.taskId),
            time: String(entry.time ?? ''),
            title: String(entry.title ?? '')
        }));
    }

    /** Percentage completed from the required tasks. */
    get progress() {
        if (!this.tasks.length) return 0;
        return Math.round(this.tasks.filter(task => task.status === 'COMPLETED').length / this.tasks.length * 100);
    }

    /** `true` when every task can be included in the implementation report. */
    get canFinalize() {
        return this.tasks.length > 0 && this.tasks.every(task => task.status === 'COMPLETED');
    }

    markRead() {
        this.read = true;
    }

    /** Completes the next pending task, enforcing the plan order. */
    completeTask(taskId) {
        if (this.attentionStatus === 'COMPLETED') throw new Error('crop-health.errors.alert-completed');
        const task = this.tasks.find(item => item.id === Number(taskId));
        if (!task) throw new Error('crop-health.errors.alert-task-not-found');
        if (task.status === 'COMPLETED') return;
        const firstPending = this.tasks.find(item => item.status !== 'COMPLETED');
        if (firstPending?.id !== task.id) throw new Error('crop-health.errors.alert-task-order');
        task.status = 'COMPLETED';
        task.completedAt = new Date().toISOString();
        this.read = true;
        this.attentionStatus = 'IN_PROGRESS';
        this.updatedAt = task.completedAt;
    }

    finalize() {
        if (!this.canFinalize) throw new Error('crop-health.errors.alert-tasks-pending');
        this.read = true;
        this.attentionStatus = 'COMPLETED';
        this.updatedAt = new Date().toISOString();
    }

    clone() {
        return new AgroclimaticAlert({
            ...this,
            tasks: this.tasks.map(task => ({...task})),
            timeline: this.timeline.map(entry => ({...entry}))
        });
    }
}
