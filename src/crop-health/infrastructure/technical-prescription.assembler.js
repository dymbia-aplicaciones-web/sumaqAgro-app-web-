import {TechnicalPrescription} from "../domain/model/technical-prescription.entity.js";
import {resourcesFromResponse} from "../../shared/infrastructure/base-assembler.js";

/**
 * Maps Technical prescription resources into domain entities and back.
 *
 * @class TechnicalPrescriptionAssembler
 */
export class TechnicalPrescriptionAssembler {
    /**
     * @param {Object} resource - Technical prescription resource payload.
     * @returns {TechnicalPrescription} Technical prescription entity.
     */
    static toEntityFromResource(resource) {
        return new TechnicalPrescription({...resource, id: Number(resource.id)});
    }

    /**
     * Parses Technical prescription resources from a response and maps them into entities.
     *
     * @param {import('axios').AxiosResponse<Array<Object>|Object>} response - HTTP response with Technical prescription resources.
     * @returns {TechnicalPrescription[]} Technical prescription entities.
     */
    static toEntitiesFromResponse(response) {
        return resourcesFromResponse(response, 'prescriptions').map(resource => this.toEntityFromResource(resource));
    }

    /**
     * @param {TechnicalPrescription} entity - Technical prescription entity.
     * @returns {Object} Technical prescription resource.
     */
    static toResourceFromEntity(entity) {
        return {...entity};
    }
}
