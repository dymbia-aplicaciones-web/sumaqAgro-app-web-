import {CropCampaign} from "../domain/model/crop-campaign.entity.js";
import {fromApiDate, resourcesFromResponse, toApiDate} from "../../shared/infrastructure/base-assembler.js";

/**
 * Maps crop campaign resources into domain entities and back.
 *
 * @class CropCampaignAssembler
 */
export class CropCampaignAssembler {
    /**
     * @param {Object} resource - Campaign resource (`sowingDate` as `YYYY-MM-DD`).
     * @returns {CropCampaign} Campaign entity.
     */
    static toEntityFromResource(resource) {
        return new CropCampaign({
            ...resource,
            id: Number(resource.id),
            sowingDate: resource.sowingDate ? fromApiDate(resource.sowingDate) : null
        });
    }

    /**
     * @param {import('axios').AxiosResponse<Array<Object>|Object>} response - HTTP response with campaign resources.
     * @returns {CropCampaign[]} Campaign entities.
     */
    static toEntitiesFromResponse(response) {
        return resourcesFromResponse(response, 'campaigns').map(resource => this.toEntityFromResource(resource));
    }

    /**
     * @param {CropCampaign} entity - Campaign entity.
     * @returns {Object} Campaign resource.
     */
    static toResourceFromEntity(entity) {
        return {
            id: entity.id,
            plotId: entity.plotId,
            season: entity.season,
            cropType: entity.cropType,
            seedVariety: entity.seedVariety,
            sowingDate: entity.sowingDate ? toApiDate(entity.sowingDate) : null,
            status: entity.status
        };
    }
}
