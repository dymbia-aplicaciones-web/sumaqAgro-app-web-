import {BaseApi} from "../../shared/infrastructure/base-api.js";
import {BaseEndpoint} from "../../shared/infrastructure/base-endpoint.js";

const profilesEndpointPath               = import.meta.env.VITE_PROFILES_ENDPOINT_PATH;
const cooperativesEndpointPath           = import.meta.env.VITE_COOPERATIVES_ENDPOINT_PATH;
const cooperativeMembersEndpointPath     = import.meta.env.VITE_COOPERATIVE_MEMBERS_ENDPOINT_PATH;
const cooperativeDashboardsEndpointPath  = import.meta.env.VITE_COOPERATIVE_DASHBOARDS_ENDPOINT_PATH;
const agronomistAssignmentsEndpointPath  = import.meta.env.VITE_AGRONOMIST_ASSIGNMENTS_ENDPOINT_PATH;

/**
 * Infrastructure gateway for Profiles bounded-context endpoints.
 *
 * @class ProfilesApi
 * @extends BaseApi
 */
export class ProfilesApi extends BaseApi {
    #profilesEndpoint;
    #cooperativesEndpoint;
    #membersEndpoint;
    #dashboardsEndpoint;
    #advisorsEndpoint;

    /** Creates endpoint clients for profiles, cooperatives, members, dashboards and advisors. */
    constructor() {
        super();
        this.#profilesEndpoint = new BaseEndpoint(this, profilesEndpointPath);
        this.#cooperativesEndpoint = new BaseEndpoint(this, cooperativesEndpointPath);
        this.#membersEndpoint = new BaseEndpoint(this, cooperativeMembersEndpointPath);
        this.#dashboardsEndpoint = new BaseEndpoint(this, cooperativeDashboardsEndpointPath);
        this.#advisorsEndpoint = new BaseEndpoint(this, agronomistAssignmentsEndpointPath);
    }

    /** @param {number} userId - Farmer. @returns {Promise<import('axios').AxiosResponse>} Profiles of the user. */
    getFarmerProfilesByUser(userId) {
        return this.#profilesEndpoint.getAllBy({ userId });
    }

    /** @param {Object} resource - Profile payload. @returns {Promise<import('axios').AxiosResponse>} Updated profile. */
    updateFarmerProfile(resource) {
        return this.#profilesEndpoint.update(resource.id, resource);
    }

    /** @param {number} directorUserId - Director. @returns {Promise<import('axios').AxiosResponse>} Cooperatives of the director. */
    getCooperativesByDirector(directorUserId) {
        return this.#cooperativesEndpoint.getAllBy({ directorUserId });
    }

    /** @param {Object} resource - Cooperative payload. @returns {Promise<import('axios').AxiosResponse>} Updated cooperative. */
    updateCooperative(resource) {
        return this.#cooperativesEndpoint.update(resource.id, resource);
    }

    /** @param {number} cooperativeId - Cooperative. @returns {Promise<import('axios').AxiosResponse>} Members. */
    getMembersByCooperative(cooperativeId) {
        return this.#membersEndpoint.getAllBy({ cooperativeId });
    }

    /** @param {number} directorUserId - Director. @returns {Promise<import('axios').AxiosResponse>} Dashboards of the director. */
    getDashboardsByDirector(directorUserId) {
        return this.#dashboardsEndpoint.getAllBy({ directorUserId });
    }

    /** @param {number} userId - Agronomist user. @returns {Promise<import('axios').AxiosResponse>} Assignments of the user. */
    getAdvisorsByUser(userId) {
        return this.#advisorsEndpoint.getAllBy({ userId });
    }

    /** @param {number} cooperativeId - Cooperative. @returns {Promise<import('axios').AxiosResponse>} Advisors of the cooperative. */
    getAdvisorsByCooperative(cooperativeId) {
        return this.#advisorsEndpoint.getAllBy({ cooperativeId });
    }

    /** @param {Object} resource - Advisor payload. @returns {Promise<import('axios').AxiosResponse>} Created advisor. */
    createAdvisor(resource) {
        return this.#advisorsEndpoint.create(resource);
    }

    /** @param {Object} resource - Advisor payload. @returns {Promise<import('axios').AxiosResponse>} Updated advisor. */
    updateAdvisor(resource) {
        return this.#advisorsEndpoint.update(resource.id, resource);
    }

    /** @param {number} id - Advisor. @returns {Promise<import('axios').AxiosResponse>} Delete response. */
    deleteAdvisor(id) {
        return this.#advisorsEndpoint.delete(id);
    }
}
