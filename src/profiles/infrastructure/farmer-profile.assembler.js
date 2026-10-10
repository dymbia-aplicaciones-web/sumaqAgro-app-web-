import {FarmerProfile} from "../domain/model/farmer-profile.entity.js";
import {resourcesFromResponse} from "../../shared/infrastructure/base-assembler.js";

/**
 * Maps Farmer profile resources into domain entities and back.
 *
 * @class FarmerProfileAssembler
 */
export class FarmerProfileAssembler {
    /**
     * @param {Object} resource - Farmer profile resource payload.
     * @returns {FarmerProfile} Farmer profile entity.
     */
    static toEntityFromResource(resource) {
        return new FarmerProfile({...resource, id: Number(resource.id)});
    }

    /**
     * Parses Farmer profile resources from a response and maps them into entities.
     *
     * @param {import('axios').AxiosResponse<Array<Object>|Object>} response - HTTP response with Farmer profile resources.
     * @returns {FarmerProfile[]} Farmer profile entities.
     */
    static toEntitiesFromResponse(response) {
        return resourcesFromResponse(response, 'profiles').map(resource => this.toEntityFromResource(resource));
    }

    /**
     * @param {FarmerProfile} entity - Farmer profile entity.
     * @returns {Object} Farmer profile resource.
     */
    static toResourceFromEntity(entity) {
        return {...entity};
    }
}
