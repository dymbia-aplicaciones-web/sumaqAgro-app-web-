import {PlotStatus} from "./field-management.enums.js";

/**
 * Field plot of a producer, with its GPS polygon.
 *
 * @class FieldPlot
 */
export class FieldPlot {
    /** Minimum number of vertices of a polygon. */
    static MINIMUM_VERTICES = 3;

    /**
     * @param {Object} params - Entity attributes.
     * @param {?number} [params.id=null] - Plot identifier.
     * @param {?number} [params.ownerUserId=null] - Producer who owns the plot.
     * @param {string} [params.name=''] - Name of the plot.
     * @param {string} [params.region=''] - Region or valley.
     * @param {string} [params.status=PlotStatus.WITHOUT_POLYGON] - Monitoring status.
     * @param {import('./geo-coordinate.js').GeoCoordinate[]} [params.boundary=[]] - Polygon vertices, in order.
     * @param {number} [params.areaHectares=0] - Area of the plot.
     * @param {?string} [params.agroMonitoringPolygonId=null] - Polygon identifier in AgroMonitoring.
     */
    constructor({ id = null, ownerUserId = null, name = '', region = '', status = PlotStatus.WITHOUT_POLYGON,
                    boundary = [], areaHectares = 0, agroMonitoringPolygonId = null }) {
        this.id = id;
        this.ownerUserId = ownerUserId;
        this.name = name;
        this.region = region;
        this.status = status;
        this.boundary = [...boundary];
        this.areaHectares = areaHectares;
        this.agroMonitoringPolygonId = agroMonitoringPolygonId;
    }

    /** @returns {boolean} `true` when the polygon has at least three vertices. */
    hasPolygon() {
        return this.boundary.length >= FieldPlot.MINIMUM_VERTICES;
    }

    /** @returns {boolean} `true` when the plot is linked to AgroMonitoring. */
    isMonitored() {
        return this.status === PlotStatus.ACTIVE_MONITORING;
    }

    /**
     * Updates the descriptive data of the plot without changing its boundary or
     * calculated area.
     * @param {{name: string, region: string}} details - Editable plot data.
     * @throws {Error} When the name or region is empty.
     */
    updateDetails({ name, region }) {
        const normalizedName = name?.trim() ?? '';
        const normalizedRegion = region?.trim() ?? '';
        if (!normalizedName) throw new Error('The plot name is required.');
        if (!normalizedRegion) throw new Error('The plot region is required.');
        this.name = normalizedName;
        this.region = normalizedRegion;
    }

    /**
     * Sets the GPS polygon of the plot and calculates its area (US-29).
     * @param {import('./geo-coordinate.js').GeoCoordinate[]} coordinates - Vertices, in order.
     * @throws {Error} When the polygon has less than three vertices or its sides cross.
     */
    delineateBoundary(coordinates) {
        if (coordinates.length < FieldPlot.MINIMUM_VERTICES) throw new Error('The polygon needs at least three vertices.');
        if (!FieldPlot.isSimplePolygon(coordinates)) throw new Error('The sides of the polygon cannot cross each other.');
        this.boundary = [...coordinates];
        this.areaHectares = FieldPlot.calculateAreaHectares(coordinates);
    }

    /**
     * Links the polygon to the satellite monitoring of AgroMonitoring.
     * With the RESTful API the backend registers the polygon and returns its id.
     * @param {string} agroMonitoringPolygonId - Polygon identifier in AgroMonitoring.
     * @throws {Error} When the plot has no polygon.
     */
    activateMonitoring(agroMonitoringPolygonId) {
        if (!this.hasPolygon()) throw new Error('The plot needs a polygon to be monitored.');
        this.agroMonitoringPolygonId = agroMonitoringPolygonId;
        this.status = PlotStatus.ACTIVE_MONITORING;
    }

    /** @returns {FieldPlot} Copy used to try a change; the list only changes when the API confirms. */
    clone() {
        return new FieldPlot({...this});
    }

    /**
     * Area of a GPS polygon in hectares, with the shoelace formula. The
     * coordinates are projected to meters around the center of the polygon.
     * @param {import('./geo-coordinate.js').GeoCoordinate[]} coordinates - Vertices, in order.
     * @returns {number} Area in hectares.
     */
    static calculateAreaHectares(coordinates) {
        if (coordinates.length < FieldPlot.MINIMUM_VERTICES) return 0;
        const meanLatitude = coordinates.reduce((sum, vertex) => sum + vertex.latitude, 0) / coordinates.length;
        const metersPerDegreeLatitude = 110_540;
        const metersPerDegreeLongitude = 111_320 * Math.cos((meanLatitude * Math.PI) / 180);
        const points = coordinates.map(vertex => ({
            x: vertex.longitude * metersPerDegreeLongitude,
            y: vertex.latitude * metersPerDegreeLatitude
        }));
        const doubleArea = points.reduce((sum, point, index) => {
            const next = points[(index + 1) % points.length];
            return sum + point.x * next.y - next.x * point.y;
        }, 0);
        return Math.abs(doubleArea) / 2 / 10_000;
    }

    /**
     * Tells whether the sides of a polygon do not cross each other (US-29).
     * @param {import('./geo-coordinate.js').GeoCoordinate[]} coordinates - Vertices, in order.
     * @returns {boolean} `true` for a simple polygon.
     */
    static isSimplePolygon(coordinates) {
        const total = coordinates.length;
        for (let i = 0; i < total; i++) {
            for (let j = i + 1; j < total; j++) {
                const adjacent = j === i + 1 || (i === 0 && j === total - 1);
                if (!adjacent && FieldPlot.#segmentsCross(
                    coordinates[i], coordinates[(i + 1) % total], coordinates[j], coordinates[(j + 1) % total])) {
                    return false;
                }
            }
        }
        return true;
    }

    /** `true` when the segment a-b crosses the segment c-d. */
    static #segmentsCross(a, b, c, d) {
        const orientation = (p, q, r) => Math.sign(
            (q.longitude - p.longitude) * (r.latitude - p.latitude) - (q.latitude - p.latitude) * (r.longitude - p.longitude));
        return orientation(a, b, c) * orientation(a, b, d) < 0 && orientation(c, d, a) * orientation(c, d, b) < 0;
    }
}
