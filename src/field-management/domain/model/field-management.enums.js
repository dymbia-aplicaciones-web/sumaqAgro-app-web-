/**
 * Value types of the Field Management bounded context.
 */

/**
 * Monitoring status of a field plot.
 * @readonly
 * @enum {string}
 */
export const PlotStatus = Object.freeze({
    /** The plot was registered but its GPS polygon is not drawn yet. */
    WITHOUT_POLYGON: 'WITHOUT_POLYGON',
    /** The polygon is linked to AgroMonitoring and the plot is monitored by satellite. */
    ACTIVE_MONITORING: 'ACTIVE_MONITORING'
});

/**
 * Crops supported by SumaqAgro.
 * @readonly
 * @enum {string}
 */
export const CropType = Object.freeze({
    ANDEAN_POTATO: 'ANDEAN_POTATO',
    SPECIALTY_COFFEE: 'SPECIALTY_COFFEE'
});

/**
 * Status of a crop campaign.
 * @readonly
 * @enum {string}
 */
export const CampaignStatus = Object.freeze({
    IN_PROGRESS: 'IN_PROGRESS',
    FINISHED: 'FINISHED'
});

/**
 * Categories of the field expenses recorded in the cost ledger.
 * @readonly
 * @enum {string}
 */
export const ExpenseCategory = Object.freeze({
    /** Seeds, fertilizers and other inputs. */
    INPUTS: 'INPUTS',
    /** Daily wages of the field workers. */
    LABOR: 'LABOR',
    /** Transport of inputs or harvest. */
    FREIGHT: 'FREIGHT'
});

/**
 * Unit of the harvest: sacks of potato or quintals of coffee.
 * @readonly
 * @enum {string}
 */
export const YieldUnit = Object.freeze({
    SACK: 'SACK',
    QUINTAL: 'QUINTAL'
});

/** Plots included in the free Seed plan (the quota belongs to Subscriptions). */
export const FREE_PLAN_PLOT_QUOTA = 3;
