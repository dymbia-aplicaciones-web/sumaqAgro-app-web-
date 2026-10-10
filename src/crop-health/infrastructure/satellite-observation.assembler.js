import {SatelliteObservation} from "../domain/model/satellite-observation.entity.js";
import {resourcesFromResponse} from "../../shared/infrastructure/base-assembler.js";

/**
 * Maps Satellite observation resources into domain entities and back.
 *
 * @class SatelliteObservationAssembler
 */
export class SatelliteObservationAssembler {
    /**
     * @param {Object} resource - Satellite observation resource payload.
     * @returns {SatelliteObservation} Satellite observation entity.
     */
    static toEntityFromResource(resource) {
        return new SatelliteObservation({...resource, id: Number(resource.id)});
    }

    /**
     * Parses Satellite observation resources from a response and maps them into entities.
     *
     * @param {import('axios').AxiosResponse<Array<Object>|Object>} response - HTTP response with Satellite observation resources.
     * @returns {SatelliteObservation[]} Satellite observation entities.
     */
    static toEntitiesFromResponse(response) {
        return resourcesFromResponse(response, 'observations').map(resource => this.toEntityFromResource(resource));
    }

    /**
     * @param {SatelliteObservation} entity - Satellite observation entity.
     * @returns {Object} Satellite observation resource.
     */
    static toResourceFromEntity(entity) {
        return {...entity};
    }
}
