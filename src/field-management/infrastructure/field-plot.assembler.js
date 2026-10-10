import {FieldPlot} from "../domain/model/field-plot.entity.js";
import {GeoCoordinate} from "../domain/model/geo-coordinate.js";
import {resourcesFromResponse} from "../../shared/infrastructure/base-assembler.js";

/**
 * Maps field plot resources into domain entities and back.
 *
 * @class FieldPlotAssembler
 */
export class FieldPlotAssembler {
    /**
     * @param {Object} resource - Plot resource (`boundary` as `[latitude, longitude]` pairs).
     * @returns {FieldPlot} Plot entity.
     */
    static toEntityFromResource(resource) {
        return new FieldPlot({
            ...resource,
            id: Number(resource.id),
            boundary: (resource.boundary ?? []).map(([latitude, longitude]) => new GeoCoordinate(latitude, longitude)),
            agroMonitoringPolygonId: resource.agroMonitoringPolygonId || null
        });
    }

    /**
     * @param {import('axios').AxiosResponse<Array<Object>|Object>} response - HTTP response with plot resources.
     * @returns {FieldPlot[]} Plot entities.
     */
    static toEntitiesFromResponse(response) {
        return resourcesFromResponse(response, 'plots').map(resource => this.toEntityFromResource(resource));
    }

    /**
     * @param {FieldPlot} entity - Plot entity.
     * @returns {Object} Plot resource.
     */
    static toResourceFromEntity(entity) {
        return {
            id: entity.id,
            ownerUserId: entity.ownerUserId,
            name: entity.name,
            region: entity.region,
            status: entity.status,
            boundary: entity.boundary.map(vertex => [vertex.latitude, vertex.longitude]),
            areaHectares: entity.areaHectares,
            agroMonitoringPolygonId: entity.agroMonitoringPolygonId ?? ''
        };
    }
}
