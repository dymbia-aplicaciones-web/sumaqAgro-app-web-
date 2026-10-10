/**
 * Validation rules of Crop Health. Errors carry an i18n key
 * (`crop-health.errors.*`) that the views show as is.
 */
export const INVALID_DATA = 'crop-health.errors.invalid-data';

/** @param {number} value - Identifier that must be a positive integer. */
export function requireId(value) {
    if (!Number.isSafeInteger(value) || value <= 0) throw new Error(INVALID_DATA);
}

/**
 * @param {string} value - Text that must not be empty.
 * @param {number} [minimum=1] - Minimum length without spaces at the ends.
 */
export function requireText(value, minimum = 1) {
    if (typeof value !== 'string' || value.trim().length < minimum) throw new Error(INVALID_DATA);
}

/**
 * @param {number} value - Number to check.
 * @param {number} minimum - Minimum value.
 * @param {number} [maximum=Infinity] - Maximum value.
 */
export function requireRange(value, minimum, maximum = Infinity) {
    if (!Number.isFinite(value) || value < minimum || value > maximum) throw new Error(INVALID_DATA);
}

/** @param {string} value - `YYYY-MM-DD` or ISO 8601 date-time with a real calendar date. */
export function requireDate(value) {
    if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}(?:$|T)/.test(value) || !Number.isFinite(Date.parse(value))) {
        throw new Error(INVALID_DATA);
    }
    if (new Date(value.slice(0, 10)).toISOString().slice(0, 10) !== value.slice(0, 10)) throw new Error(INVALID_DATA);
}

/**
 * @param {string} value - Value to check.
 * @param {string[]} choices - Allowed values.
 */
export function requireChoice(value, choices) {
    if (!choices.includes(value)) throw new Error(INVALID_DATA);
}

/** @returns {string} Today in Lima as `YYYY-MM-DD` (prescriptions cannot be applied in the past). */
export function todayInLima() {
    const parts = new Intl.DateTimeFormat('en', {
        timeZone: 'America/Lima', year: 'numeric', month: '2-digit', day: '2-digit'
    }).formatToParts(new Date());
    const get = type => parts.find(part => part.type === type)?.value;
    return `${get('year')}-${get('month')}-${get('day')}`;
}
