/**
 * Institutional indicators of a cooperative for its director.
 *
 * @class CooperativeDashboard
 */
export class CooperativeDashboard {
    /**
     * @param {Object} params - Entity attributes (indicators of `/cooperative-dashboards`).
     */
    constructor({ id = null, directorUserId = null, cooperativeName = '', campaignName = '', activeMembers = 0,
                    monitoredHectares = 0, collectionTons = 0, collectionGoalTons = 0, optimalPlotsPercentage = 0,
                    stressedPlotsPercentage = 0, averageCostPerHectare = 0, ndviTrend = [], evaluatedLots = 0,
                    specialtyCoffeePercentage = 0, firstGradePotatoPercentage = 0, lossLotsPercentage = 0 }) {
        this.id = id;
        this.directorUserId = directorUserId;
        this.cooperativeName = cooperativeName;
        this.campaignName = campaignName;
        this.activeMembers = activeMembers;
        this.monitoredHectares = monitoredHectares;
        this.collectionTons = collectionTons;
        this.collectionGoalTons = collectionGoalTons;
        this.optimalPlotsPercentage = optimalPlotsPercentage;
        this.stressedPlotsPercentage = stressedPlotsPercentage;
        this.averageCostPerHectare = averageCostPerHectare;
        /** @type {Array<{month: string, value: number}>} */
        this.ndviTrend = ndviTrend;
        this.evaluatedLots = evaluatedLots;
        this.specialtyCoffeePercentage = specialtyCoffeePercentage;
        this.firstGradePotatoPercentage = firstGradePotatoPercentage;
        this.lossLotsPercentage = lossLotsPercentage;
    }

    /** @returns {number} Collection progress against the goal of the campaign. */
    get collectionProgress() {
        return this.collectionGoalTons === 0 ? 0 : (this.collectionTons / this.collectionGoalTons) * 100;
    }
}
