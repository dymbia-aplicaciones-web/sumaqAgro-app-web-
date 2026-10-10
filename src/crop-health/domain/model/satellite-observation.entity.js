import {requireDate, requireId, requireRange} from "./validation.js";

/**
 * Sentinel-2 observation of a plot: NDVI (vigor), NDWI (moisture) and stress area.
 *
 * @class SatelliteObservation
 */
export class SatelliteObservation {
    /**
     * @param {Object} params - Entity attributes.
     * @param {number} [params.id=0] - Observation identifier.
     * @param {number} params.plotId - Observed plot.
     * @param {string} params.date - Capture date (ISO 8601).
     * @param {number} params.ndviMean - Mean NDVI (-1 to 1).
     * @param {number} params.ndwiMean - Mean NDWI (-1 to 1).
     * @param {number} [params.surfaceTempKelvin=0] - Surface temperature.
     * @param {number} [params.cloudCoveragePercent=0] - Cloud coverage.
     * @param {number} [params.stressAreaHectares=0] - Area with stress.
     * @param {string} [params.recommendation=''] - Agronomic recommendation.
     */
    constructor({ id = 0, plotId, date, ndviMean, ndwiMean, surfaceTempKelvin, cloudCoveragePercent,
                    stressAreaHectares, recommendation = '' }) {
        requireId(plotId);
        requireDate(date);
        requireRange(ndviMean, -1, 1);
        requireRange(ndwiMean, -1, 1);
        if (cloudCoveragePercent !== undefined) requireRange(cloudCoveragePercent, 0, 100);
        if (surfaceTempKelvin !== undefined) requireRange(surfaceTempKelvin, 0);
        if (stressAreaHectares !== undefined) requireRange(stressAreaHectares, 0);
        this.id = id;
        this.plotId = plotId;
        this.date = date;
        this.ndviMean = ndviMean;
        this.ndwiMean = ndwiMean;
        this.surfaceTempKelvin = surfaceTempKelvin ?? 0;
        this.cloudCoveragePercent = cloudCoveragePercent ?? 0;
        this.stressAreaHectares = stressAreaHectares ?? 0;
        this.recommendation = recommendation;
    }
}
