import {BaseApi} from "../../shared/infrastructure/base-api.js";
import {BaseEndpoint} from "../../shared/infrastructure/base-endpoint.js";

const satelliteObservationsEndpointPath   = import.meta.env.VITE_SATELLITE_OBSERVATIONS_ENDPOINT_PATH;
const agroclimaticAlertsEndpointPath      = import.meta.env.VITE_AGROCLIMATIC_ALERTS_ENDPOINT_PATH;
const pestReportsEndpointPath             = import.meta.env.VITE_PEST_REPORTS_ENDPOINT_PATH;
const fieldInspectionsEndpointPath        = import.meta.env.VITE_FIELD_INSPECTIONS_ENDPOINT_PATH;
const technicalPrescriptionsEndpointPath  = import.meta.env.VITE_TECHNICAL_PRESCRIPTIONS_ENDPOINT_PATH;

/**
 * Infrastructure gateway for Crop Health bounded-context endpoints.
 *
 * @class CropHealthApi
 * @extends BaseApi
 */
export class CropHealthApi extends BaseApi {
    #observationsEndpoint;
    #alertsEndpoint;
    #reportsEndpoint;
    #inspectionsEndpoint;
    #prescriptionsEndpoint;

    /** Creates endpoint clients for every Crop Health resource. */
    constructor() {
        super();
        this.#observationsEndpoint = new BaseEndpoint(this, satelliteObservationsEndpointPath);
        this.#alertsEndpoint = new BaseEndpoint(this, agroclimaticAlertsEndpointPath);
        this.#reportsEndpoint = new BaseEndpoint(this, pestReportsEndpointPath);
        this.#inspectionsEndpoint = new BaseEndpoint(this, fieldInspectionsEndpointPath);
        this.#prescriptionsEndpoint = new BaseEndpoint(this, technicalPrescriptionsEndpointPath);
    }

    /** @param {number} plotId - Plot. @returns {Promise<import('axios').AxiosResponse>} Observations of the plot. */
    getObservationsByPlot(plotId) {
        return this.#observationsEndpoint.getAllBy({ plotId });
    }

    /** @param {string} region - Region. @returns {Promise<import('axios').AxiosResponse>} Alerts of the region. */
    getAlertsByRegion(region) {
        return this.#alertsEndpoint.getAllBy({ region });
    }

    /** @param {Object} resource - Alert with its action-plan state. */
    updateAlert(resource) {
        return this.#alertsEndpoint.update(resource.id, resource);
    }

    /** @param {number} plotId - Plot. @returns {Promise<import('axios').AxiosResponse>} Pest reports of the plot. */
    getPestReportsByPlot(plotId) {
        return this.#reportsEndpoint.getAllBy({ plotId });
    }

    /** @param {Object} resource - Report payload. @returns {Promise<import('axios').AxiosResponse>} Created report. */
    createPestReport(resource) {
        return this.#reportsEndpoint.create(resource);
    }

    /** @param {Object} resource - Report payload. @returns {Promise<import('axios').AxiosResponse>} Updated report. */
    updatePestReport(resource) {
        return this.#reportsEndpoint.update(resource.id, resource);
    }

    /** @param {number} id - Report. @returns {Promise<import('axios').AxiosResponse>} Delete response. */
    deletePestReport(id) {
        return this.#reportsEndpoint.delete(id);
    }

    /** @returns {Promise<import('axios').AxiosResponse>} All field inspections. */
    getInspections() {
        return this.#inspectionsEndpoint.getAll();
    }

    /** @param {Object} resource - Inspection payload. @returns {Promise<import('axios').AxiosResponse>} Created inspection. */
    createInspection(resource) {
        return this.#inspectionsEndpoint.create(resource);
    }

    /** @param {Object} resource - Inspection payload. @returns {Promise<import('axios').AxiosResponse>} Updated inspection. */
    updateInspection(resource) {
        return this.#inspectionsEndpoint.update(resource.id, resource);
    }

    /** @returns {Promise<import('axios').AxiosResponse>} All technical prescriptions. */
    getPrescriptions() {
        return this.#prescriptionsEndpoint.getAll();
    }

    /** @param {Object} resource - Prescription payload. @returns {Promise<import('axios').AxiosResponse>} Created prescription. */
    createPrescription(resource) {
        return this.#prescriptionsEndpoint.create(resource);
    }
}
