/**
 * GPS vertex of a plot polygon. It is a value that belongs to the field plot;
 * it has no identity of its own.
 *
 * @class GeoCoordinate
 */
export class GeoCoordinate {
    /**
     * @param {number} latitude - Latitude in degrees, between -90 and 90.
     * @param {number} longitude - Longitude in degrees, between -180 and 180.
     */
    constructor(latitude, longitude) {
        if (latitude < -90 || latitude > 90) throw new Error('The latitude must be between -90 and 90.');
        if (longitude < -180 || longitude > 180) throw new Error('The longitude must be between -180 and 180.');
        this.latitude = latitude;
        this.longitude = longitude;
        Object.freeze(this);
    }
}
