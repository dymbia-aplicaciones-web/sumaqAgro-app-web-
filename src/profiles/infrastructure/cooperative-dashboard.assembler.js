import {CooperativeDashboard} from "../domain/model/cooperative-dashboard.entity.js";
import {resourcesFromResponse} from "../../shared/infrastructure/base-assembler.js";

/**
 * Maps Cooperative dashboard resources into domain entities and back.
 *
 * @class CooperativeDashboardAssembler
 */
export class CooperativeDashboardAssembler {
    /**
     * @param {Object} resource - Cooperative dashboard resource payload.
     * @returns {CooperativeDashboard} Cooperative dashboard entity.
     */
    static toEntityFromResource(resource) {
        return new CooperativeDashboard({...resource, id: Number(resource.id)});
    }

    /**
     * Parses Cooperative dashboard resources from a response and maps them into entities.
     *
     * @param {import('axios').AxiosResponse<Array<Object>|Object>} response - HTTP response with Cooperative dashboard resources.
     * @returns {CooperativeDashboard[]} Cooperative dashboard entities.
     */
    static toEntitiesFromResponse(response) {
        return resourcesFromResponse(response, 'dashboards').map(resource => this.toEntityFromResource(resource));
    }

    /**
     * @param {CooperativeDashboard} entity - Cooperative dashboard entity.
     * @returns {Object} Cooperative dashboard resource.
     */
    static toResourceFromEntity(entity) {
        return {...entity};
    }
}
