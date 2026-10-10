import {FieldInspection} from "../domain/model/field-inspection.entity.js";
import {resourcesFromResponse} from "../../shared/infrastructure/base-assembler.js";

/**
 * Maps Field inspection resources into domain entities and back.
 *
 * @class FieldInspectionAssembler
 */
export class FieldInspectionAssembler {
    /**
     * @param {Object} resource - Field inspection resource payload.
     * @returns {FieldInspection} Field inspection entity.
     */
    static toEntityFromResource(resource) {
        return new FieldInspection({...resource, id: Number(resource.id)});
    }

    /**
     * Parses Field inspection resources from a response and maps them into entities.
     *
     * @param {import('axios').AxiosResponse<Array<Object>|Object>} response - HTTP response with Field inspection resources.
     * @returns {FieldInspection[]} Field inspection entities.
     */
    static toEntitiesFromResponse(response) {
        return resourcesFromResponse(response, 'inspections').map(resource => this.toEntityFromResource(resource));
    }

    /**
     * @param {FieldInspection} entity - Field inspection entity.
     * @returns {Object} Field inspection resource.
     */
    static toResourceFromEntity(entity) {
        return {...entity};
    }
}
