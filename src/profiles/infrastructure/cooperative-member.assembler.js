import {CooperativeMember} from "../domain/model/cooperative-member.entity.js";
import {resourcesFromResponse} from "../../shared/infrastructure/base-assembler.js";

/**
 * Maps Cooperative member resources into domain entities and back.
 *
 * @class CooperativeMemberAssembler
 */
export class CooperativeMemberAssembler {
    /**
     * @param {Object} resource - Cooperative member resource payload.
     * @returns {CooperativeMember} Cooperative member entity.
     */
    static toEntityFromResource(resource) {
        return new CooperativeMember({...resource, id: Number(resource.id), fullName: resource.fullName ?? resource.name ?? '', active: resource.active !== false});
    }

    /**
     * Parses Cooperative member resources from a response and maps them into entities.
     *
     * @param {import('axios').AxiosResponse<Array<Object>|Object>} response - HTTP response with Cooperative member resources.
     * @returns {CooperativeMember[]} Cooperative member entities.
     */
    static toEntitiesFromResponse(response) {
        return resourcesFromResponse(response, 'members').map(resource => this.toEntityFromResource(resource));
    }

    /**
     * @param {CooperativeMember} entity - Cooperative member entity.
     * @returns {Object} Cooperative member resource.
     */
    static toResourceFromEntity(entity) {
        return {...entity};
    }
}
