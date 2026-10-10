import {CampaignStatus, CropType} from "./field-management.enums.js";

/**
 * Crop campaign of a plot: season, crop, seed variety and sowing date (US-32 to US-34).
 *
 * @class CropCampaign
 */
export class CropCampaign {
    /**
     * @param {Object} params - Entity attributes.
     * @param {?number} [params.id=null] - Campaign identifier.
     * @param {?number} [params.plotId=null] - Plot of the campaign.
     * @param {string} [params.season=''] - Agricultural season (for example, `2026-I`).
     * @param {string} [params.cropType=CropType.ANDEAN_POTATO] - Crop.
     * @param {string} [params.seedVariety=''] - Seed variety sown.
     * @param {?Date} [params.sowingDate=null] - Sowing date.
     * @param {string} [params.status=CampaignStatus.IN_PROGRESS] - Status.
     */
    constructor({ id = null, plotId = null, season = '', cropType = CropType.ANDEAN_POTATO, seedVariety = '',
                    sowingDate = null, status = CampaignStatus.IN_PROGRESS }) {
        this.id = id;
        this.plotId = plotId;
        this.season = season;
        this.cropType = cropType;
        this.seedVariety = seedVariety;
        this.sowingDate = sowingDate;
        this.status = status;
    }

    /** @returns {boolean} `true` while the campaign is in progress. */
    isActive() {
        return this.status === CampaignStatus.IN_PROGRESS;
    }

    /** @param {string} cropType - Crop to grow. */
    selectCropType(cropType) {
        this.#ensureActive();
        this.cropType = cropType;
    }

    /**
     * @param {string} varietyName - Seed variety.
     * @throws {Error} When the variety is empty.
     */
    specifySeedVariety(varietyName) {
        this.#ensureActive();
        const name = varietyName.trim();
        if (!name) throw new Error('The seed variety is required.');
        this.seedVariety = name;
    }

    /** @param {Date} sowingDate - Sowing date. */
    recordSowingDate(sowingDate) {
        this.#ensureActive();
        this.sowingDate = sowingDate;
    }

    /**
     * Season of a date: `2026-I` (January–June) or `2026-II` (July–December).
     * @param {Date} date - Date.
     * @returns {string} Season.
     */
    static seasonOf(date) {
        return `${date.getFullYear()}-${date.getMonth() < 6 ? 'I' : 'II'}`;
    }

    /**
     * Campaign in progress, or the most recent one.
     * @param {CropCampaign[]} campaigns - Campaigns of a plot.
     * @returns {CropCampaign|undefined} Current campaign.
     */
    static currentOf(campaigns) {
        return campaigns.find(campaign => campaign.isActive()) ?? campaigns.at(-1);
    }

    #ensureActive() {
        if (!this.isActive()) throw new Error('A finished campaign cannot be changed.');
    }
}
