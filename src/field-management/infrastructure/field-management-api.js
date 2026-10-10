import {BaseApi} from "../../shared/infrastructure/base-api.js";
import {BaseEndpoint} from "../../shared/infrastructure/base-endpoint.js";

const fieldPlotsEndpointPath        = import.meta.env.VITE_FIELD_PLOTS_ENDPOINT_PATH;
const cropCampaignsEndpointPath     = import.meta.env.VITE_CROP_CAMPAIGNS_ENDPOINT_PATH;
const campaignLedgersEndpointPath   = import.meta.env.VITE_CAMPAIGN_LEDGERS_ENDPOINT_PATH;

/**
 * Infrastructure gateway for Field Management bounded-context endpoints.
 *
 * @class FieldManagementApi
 * @extends BaseApi
 */
export class FieldManagementApi extends BaseApi {
    /** @type {BaseEndpoint} @private */
    #fieldPlotsEndpoint;
    /** @type {BaseEndpoint} @private */
    #cropCampaignsEndpoint;
    /** @type {BaseEndpoint} @private */
    #campaignLedgersEndpoint;

    /** Creates endpoint clients for plots, campaigns and cost ledgers. */
    constructor() {
        super();
        this.#fieldPlotsEndpoint = new BaseEndpoint(this, fieldPlotsEndpointPath);
        this.#cropCampaignsEndpoint = new BaseEndpoint(this, cropCampaignsEndpointPath);
        this.#campaignLedgersEndpoint = new BaseEndpoint(this, campaignLedgersEndpointPath);
    }

    // ---------- Field plots ----------

    /** @returns {Promise<import('axios').AxiosResponse>} All plots. */
    getPlots() {
        return this.#fieldPlotsEndpoint.getAll();
    }

    /**
     * @param {number} ownerUserId - Producer who owns the plots.
     * @returns {Promise<import('axios').AxiosResponse>} Plots of the producer.
     */
    getPlotsByOwner(ownerUserId) {
        return this.#fieldPlotsEndpoint.getAllBy({ ownerUserId });
    }

    /**
     * @param {Object} resource - Plot resource payload.
     * @returns {Promise<import('axios').AxiosResponse>} Created plot.
     */
    createPlot(resource) {
        return this.#fieldPlotsEndpoint.create(resource);
    }

    /**
     * @param {Object} resource - Plot resource payload (must include id).
     * @returns {Promise<import('axios').AxiosResponse>} Updated plot.
     */
    updatePlot(resource) {
        return this.#fieldPlotsEndpoint.update(resource.id, resource);
    }

    /**
     * @param {number} id - Plot identifier.
     * @returns {Promise<import('axios').AxiosResponse>} Delete response.
     */
    deletePlot(id) {
        return this.#fieldPlotsEndpoint.delete(id);
    }

    // ---------- Crop campaigns ----------

    /**
     * @param {number} plotId - Plot identifier.
     * @returns {Promise<import('axios').AxiosResponse>} Campaigns of the plot.
     */
    getCampaignsByPlot(plotId) {
        return this.#cropCampaignsEndpoint.getAllBy({ plotId });
    }

    /**
     * @param {Object} resource - Campaign resource payload.
     * @returns {Promise<import('axios').AxiosResponse>} Created campaign.
     */
    createCampaign(resource) {
        return this.#cropCampaignsEndpoint.create(resource);
    }

    // ---------- Cost ledgers ----------

    /**
     * @param {number} campaignId - Campaign identifier.
     * @returns {Promise<import('axios').AxiosResponse>} Ledgers of the campaign.
     */
    getLedgersByCampaign(campaignId) {
        return this.#campaignLedgersEndpoint.getAllBy({ campaignId });
    }

    /**
     * @param {Object} resource - Ledger resource payload.
     * @returns {Promise<import('axios').AxiosResponse>} Created ledger.
     */
    createLedger(resource) {
        return this.#campaignLedgersEndpoint.create(resource);
    }

    /**
     * @param {Object} resource - Ledger resource payload (must include id).
     * @returns {Promise<import('axios').AxiosResponse>} Updated ledger.
     */
    updateLedger(resource) {
        return this.#campaignLedgersEndpoint.update(resource.id, resource);
    }
}
