import {Cooperative} from "../domain/model/cooperative.entity.js";
import {resourcesFromResponse} from "../../shared/infrastructure/base-assembler.js";

/**
 * Maps Cooperative resources into domain entities and back.
 *
 * @class CooperativeAssembler
 */
export class CooperativeAssembler {
    /**
     * @param {Object} resource - Cooperative resource payload.
     * @returns {Cooperative} Cooperative entity.
     */
    static toEntityFromResource(resource) {
        return new Cooperative({...resource, id: Number(resource.id)});
    }

    /**
     * Parses Cooperative resources from a response and maps them into entities.
     *
     * @param {import('axios').AxiosResponse<Array<Object>|Object>} response - HTTP response with Cooperative resources.
     * @returns {Cooperative[]} Cooperative entities.
     */
    static toEntitiesFromResponse(response) {
        return resourcesFromResponse(response, 'cooperatives').map(resource => this.toEntityFromResource(resource));
    }

    /**
     * @param {Cooperative} entity - Cooperative entity.
     * @returns {Object} Cooperative resource.
     */
    static toResourceFromEntity(entity) {
        return {...entity};
    }
}
