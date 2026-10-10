/**
 * Reads the resources of a list response.
 * The Fake API (json-server) returns plain arrays; the RESTful API may wrap
 * the list in a property (for example `{ plots: [...] }`).
 *
 * @param {import('axios').AxiosResponse<Array<Object>|Object>} response - HTTP response.
 * @param {string} key - Property that holds the list in a wrapped response.
 * @returns {Array<Object>} Resources of the response.
 */
export function resourcesFromResponse(response, key) {
    if (response.status !== 200) {
        console.error(`${response.status}, ${response.statusText}`);
        return [];
    }
    return response.data instanceof Array ? response.data : (response.data[key] ?? []);
}

/**
 * Reads an API date (`YYYY-MM-DD`) as a local date, so it never moves one day
 * back because of the time zone.
 * @param {string} value - API date.
 * @returns {Date} Local date.
 */
export function fromApiDate(value) {
    const [year, month, day] = value.slice(0, 10).split('-').map(Number);
    return new Date(year, month - 1, day);
}

/**
 * Writes a local date as `YYYY-MM-DD`.
 * @param {Date} date - Local date.
 * @returns {string} API date.
 */
export function toApiDate(date) {
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${date.getFullYear()}-${month}-${day}`;
}
