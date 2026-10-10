import {AgroclimaticAlert} from "../domain/model/agroclimatic-alert.entity.js";
import {resourcesFromResponse} from "../../shared/infrastructure/base-assembler.js";

/**
 * Maps Agroclimatic alert resources into domain entities and back.
 *
 * @class AgroclimaticAlertAssembler
 */
export class AgroclimaticAlertAssembler {
    /**
     * @param {Object} resource - Agroclimatic alert resource payload.
     * @returns {AgroclimaticAlert} Agroclimatic alert entity.
     */
    static toEntityFromResource(resource) {
        return new AgroclimaticAlert({...resource, id: Number(resource.id)});
    }

    /**
     * Parses Agroclimatic alert resources from a response and maps them into entities.
     *
     * @param {import('axios').AxiosResponse<Array<Object>|Object>} response - HTTP response with Agroclimatic alert resources.
     * @returns {AgroclimaticAlert[]} Agroclimatic alert entities.
     */
    static toEntitiesFromResponse(response) {
        return resourcesFromResponse(response, 'alerts').map(resource => this.toEntityFromResource(resource));
    }

    /**
     * @param {AgroclimaticAlert} entity - Agroclimatic alert entity.
     * @returns {Object} Agroclimatic alert resource.
     */
    static toResourceFromEntity(entity) {
        return {...entity};
    }
}
