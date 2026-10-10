/**
 * Reusable endpoint client with CRUD operations over a resource collection.
 *
 * @class BaseEndpoint
 */
export class BaseEndpoint {
    /**
     * @param {import('./base-api.js').BaseApi} baseApi - Configured API client owner.
     * @param {string} endpointPath - Relative resource path.
     */
    constructor(baseApi, endpointPath) {
        this.http = baseApi.http;
        this.endpointPath = endpointPath;
    }

    /** @returns {Promise<import('axios').AxiosResponse>} HTTP response with resource collection. */
    getAll() {
        return this.http.get(this.endpointPath);
    }

    /**
     * Gets the resources that match some filters, sent as query parameters
     * (for example, `{ plotId: 1 }` becomes `?plotId=1`).
     * @param {Object} params - Field names and the values they must have.
     * @returns {Promise<import('axios').AxiosResponse>} HTTP response with resource collection.
     */
    getAllBy(params) {
        return this.http.get(this.endpointPath, { params });
    }

    /**
     * @param {string|number} id - Resource identifier.
     * @returns {Promise<import('axios').AxiosResponse>} HTTP response with one resource.
     */
    getById(id) {
        return this.http.get(`${this.endpointPath}/${id}`);
    }

    /**
     * @param {Object} resource - Resource payload to create. The `id` is removed so json-server assigns one.
     * @returns {Promise<import('axios').AxiosResponse>} HTTP response with created resource.
     */
    create(resource) {
        const { id, ...payload } = resource;
        return this.http.post(this.endpointPath, payload);
    }

    /**
     * @param {string|number} id - Resource identifier.
     * @param {Object} resource - Resource payload to update.
     * @returns {Promise<import('axios').AxiosResponse>} HTTP response with updated resource.
     */
    update(id, resource) {
        return this.http.put(`${this.endpointPath}/${id}`, resource);
    }

    /**
     * @param {string|number} id - Resource identifier.
     * @returns {Promise<import('axios').AxiosResponse>} HTTP response for delete operation.
     */
    delete(id) {
        return this.http.delete(`${this.endpointPath}/${id}`);
    }
}
