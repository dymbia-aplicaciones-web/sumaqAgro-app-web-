import {HarvestBatch} from "../domain/model/harvest-batch.entity.js";
import {resourcesFromResponse} from "../../shared/infrastructure/base-assembler.js";

/**
 * Maps Harvest batch resources into domain entities and back.
 *
 * @class HarvestBatchAssembler
 */
export class HarvestBatchAssembler {
    /**
     * @param {Object} resource - Harvest batch resource payload.
     * @returns {HarvestBatch} Harvest batch entity.
     */
    static toEntityFromResource(resource) {
        return new HarvestBatch({...resource, id: Number(resource.id)});
    }

    /**
     * Parses Harvest batch resources from a response and maps them into entities.
     *
     * @param {import('axios').AxiosResponse<Array<Object>|Object>} response - HTTP response with Harvest batch resources.
     * @returns {HarvestBatch[]} Harvest batch entities.
     */
    static toEntitiesFromResponse(response) {
        return resourcesFromResponse(response, 'batches').map(resource => this.toEntityFromResource(resource));
    }

    /**
     * @param {HarvestBatch} entity - Harvest batch entity.
     * @returns {Object} Harvest batch resource.
     */
    static toResourceFromEntity(entity) {
        return {...entity};
    }
}
