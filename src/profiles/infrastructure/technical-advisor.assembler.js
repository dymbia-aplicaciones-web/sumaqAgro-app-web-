import {TechnicalAdvisor} from "../domain/model/technical-advisor.entity.js";
import {resourcesFromResponse} from "../../shared/infrastructure/base-assembler.js";

/**
 * Maps Technical advisor resources into domain entities and back.
 *
 * @class TechnicalAdvisorAssembler
 */
export class TechnicalAdvisorAssembler {
    /**
     * @param {Object} resource - Technical advisor resource payload.
     * @returns {TechnicalAdvisor} Technical advisor entity.
     */
    static toEntityFromResource(resource) {
        return new TechnicalAdvisor({...resource, id: Number(resource.id), assignedPlotsCount: resource.assignedPlotsCount ?? 0});
    }

    /**
     * Parses Technical advisor resources from a response and maps them into entities.
     *
     * @param {import('axios').AxiosResponse<Array<Object>|Object>} response - HTTP response with Technical advisor resources.
     * @returns {TechnicalAdvisor[]} Technical advisor entities.
     */
    static toEntitiesFromResponse(response) {
        return resourcesFromResponse(response, 'agronomists').map(resource => this.toEntityFromResource(resource));
    }

    /**
     * @param {TechnicalAdvisor} entity - Technical advisor entity.
     * @returns {Object} Technical advisor resource.
     */
    static toResourceFromEntity(entity) {
        return {...entity};
    }
}
