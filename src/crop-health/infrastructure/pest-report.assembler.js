import {PestReport} from "../domain/model/pest-report.entity.js";
import {resourcesFromResponse} from "../../shared/infrastructure/base-assembler.js";

/**
 * Maps Pest report resources into domain entities and back.
 *
 * @class PestReportAssembler
 */
export class PestReportAssembler {
    /**
     * @param {Object} resource - Pest report resource payload.
     * @returns {PestReport} Pest report entity.
     */
    static toEntityFromResource(resource) {
        return new PestReport({...resource, id: Number(resource.id)});
    }

    /**
     * Parses Pest report resources from a response and maps them into entities.
     *
     * @param {import('axios').AxiosResponse<Array<Object>|Object>} response - HTTP response with Pest report resources.
     * @returns {PestReport[]} Pest report entities.
     */
    static toEntitiesFromResponse(response) {
        return resourcesFromResponse(response, 'reports').map(resource => this.toEntityFromResource(resource));
    }

    /**
     * @param {PestReport} entity - Pest report entity.
     * @returns {Object} Pest report resource.
     */
    static toResourceFromEntity(entity) {
        return {...entity};
    }
}
