/**
 * Application service store for the Field Management bounded context.
 * It keeps the producer's plots with their campaigns, the selected plot, the
 * cost ledger of its active campaign and its NDVI observations
 * (Angular `FieldManagementStore`).
 *
 * @module useFieldManagementStore
 */
import {defineStore} from "pinia";
import {computed, ref, watch} from "vue";
import {FieldManagementApi} from "../infrastructure/field-management-api.js";
import {FieldPlotAssembler} from "../infrastructure/field-plot.assembler.js";
import {CropCampaignAssembler} from "../infrastructure/crop-campaign.assembler.js";
import {CampaignLedgerAssembler} from "../infrastructure/campaign-ledger.assembler.js";
import {FieldPlot} from "../domain/model/field-plot.entity.js";
import {CropCampaign} from "../domain/model/crop-campaign.entity.js";
import {CampaignLedger} from "../domain/model/campaign-ledger.entity.js";
import {ExpenseCategory, FREE_PLAN_PLOT_QUOTA} from "../domain/model/field-management.enums.js";
import {CropHealthApi} from "../../crop-health/infrastructure/crop-health-api.js";
import {SatelliteObservationAssembler} from "../../crop-health/infrastructure/satellite-observation.assembler.js";
import useIamStore from "../../iam/application/iam.store.js";
import usePlotSelectionStore from "../../shared/application/plot-selection.store.js";

const fieldManagementApi = new FieldManagementApi();
const cropHealthApi = new CropHealthApi();

/**
 * Reactive store that exposes Field Management commands and queries.
 *
 * @returns {Object} Store state and actions.
 */
const useFieldManagementStore = defineStore('field-management', () => {
    const iamStore = useIamStore();
    const plotSelection = usePlotSelectionStore();

    /** @type {import('vue').Ref<FieldPlot[]>} Plots of the producer. */
    const plots = ref([]);
    /** @type {import('vue').Ref<Map<number, CropCampaign[]>>} Campaigns by plot id. */
    const campaignsByPlot = ref(new Map());
    /** @type {import('vue').Ref<boolean>} `true` while the plots are loading. */
    const plotsLoading = ref(false);
    /** @type {import('vue').Ref<CampaignLedger|null>} Cost ledger of the active campaign of the selected plot. */
    const ledger = ref(null);
    /** @type {import('vue').Ref<boolean>} `true` while data is being loaded from or saved to the API. */
    const loading = ref(false);
    /** @type {import('vue').Ref<string|null>} i18n key of the last error. */
    const error = ref(null);
    /** @type {import('vue').Ref<import('../../crop-health/domain/model/satellite-observation.entity.js').SatelliteObservation[]>} NDVI of the selected plot, oldest first. */
    const observations = ref([]);
    /** @type {import('vue').Ref<boolean>} */
    const observationsLoading = ref(false);
    /** @type {import('vue').Ref<boolean>} */
    const observationsError = ref(false);
    let plotsRequest = 0;
    let ledgerRequest = 0;
    let observationsRequest = 0;

    /** Producer signed in: the owner of the plots, or `null` for other roles. */
    const currentUserId = computed(() => iamStore.currentRole === 'FARMER' ? iamStore.currentUserId : null);
    /** Number of plots of the producer. */
    const plotCount = computed(() => plots.value.length);
    /** Plots allowed by the plan of the producer. */
    const plotQuota = FREE_PLAN_PLOT_QUOTA;
    /** `true` while the producer can register another plot (US-22). */
    const canRegisterPlot = computed(() => plotCount.value < plotQuota);
    /** Numbers of the free slots of the plan. */
    const freeSlots = computed(() => Array.from({ length: Math.max(plotQuota - plotCount.value, 0) }, (_, index) => plotCount.value + index + 1));
    /** Plot shown on the dashboard. */
    const selectedPlot = computed(() => plots.value.find(plot => plot.id === plotSelection.selectedPlotId));
    /** Campaigns of the selected plot. */
    const campaigns = computed(() => campaignsByPlot.value.get(plotSelection.selectedPlotId ?? -1) ?? []);
    /** Campaign in progress of the selected plot, or the most recent one. */
    const activeCampaign = computed(() => CropCampaign.currentOf(campaigns.value));
    /** Latest NDVI observation of the selected plot. */
    const latestObservation = computed(() => observations.value.at(-1));

    /**
     * @param {number|string} id - Plot identifier.
     * @returns {FieldPlot|undefined} Matching plot.
     */
    function getPlotById(id) {
        return plots.value.find(plot => plot.id === Number(id));
    }

    /**
     * @param {number} plotId - Plot identifier.
     * @returns {CropCampaign|undefined} Campaign in progress or the most recent one.
     */
    function getCurrentCampaignOf(plotId) {
        return CropCampaign.currentOf(campaignsByPlot.value.get(plotId) ?? []);
    }

    function startLoading() {
        loading.value = true;
        error.value = null;
    }

    function fail(cause, key) {
        console.error(cause);
        error.value = key;
        loading.value = false;
    }

    /**
     * Loads the plots of the producer with their campaigns, and keeps (or selects) the shown plot.
     * @param {number} ownerUserId - Producer who owns the plots.
     * @returns {Promise<void>}
     */
    function loadMyPlots(ownerUserId) {
        const request = ++plotsRequest;
        ++ledgerRequest;
        plotsLoading.value = true;
        startLoading();
        return fieldManagementApi.getPlotsByOwner(ownerUserId)
            .then(response => {
                const loadedPlots = FieldPlotAssembler.toEntitiesFromResponse(response);
                return Promise.all(loadedPlots.map(plot => fieldManagementApi.getCampaignsByPlot(plot.id)))
                    .then(responses => ({ loadedPlots, responses }));
            })
            .then(({ loadedPlots, responses }) => {
                if (request !== plotsRequest || currentUserId.value !== ownerUserId) return;
                plots.value = loadedPlots;
                campaignsByPlot.value = new Map(loadedPlots.map((plot, index) => [plot.id, CropCampaignAssembler.toEntitiesFromResponse(responses[index])]));
                loading.value = false;
                const keep = loadedPlots.some(plot => plot.id === plotSelection.selectedPlotId);
                const first = loadedPlots[0];
                if (first) return selectPlot(keep ? plotSelection.selectedPlotId : first.id);
                plotSelection.select(null);
                ledger.value = null;
            })
            .catch(cause => { if (request === plotsRequest) fail(cause, 'field-management.errors.load-plots'); })
            .finally(() => { if (request === plotsRequest) plotsLoading.value = false; });
    }

    /**
     * Selects a plot and loads the cost ledger of its active campaign.
     * @param {number} plotId - Plot to show.
     * @returns {Promise<void>}
     */
    function selectPlot(plotId) {
        if (!plots.value.some(plot => plot.id === plotId)) return Promise.resolve();
        const request = ++ledgerRequest;
        plotSelection.select(plotId);
        ledger.value = null;
        const campaign = activeCampaign.value;
        if (!campaign) return Promise.resolve();
        startLoading();
        return fieldManagementApi.getLedgersByCampaign(campaign.id)
            .then(response => {
                if (request !== ledgerRequest) return;
                ledger.value = CampaignLedgerAssembler.toEntitiesFromResponse(response)[0] ?? null;
                loading.value = false;
            })
            .catch(cause => { if (request === ledgerRequest) fail(cause, 'field-management.errors.load-plot'); });
    }

    /**
     * Registers a plot "without polygon" with its first campaign and its cost ledger (US-28, US-32 to US-36).
     * With the RESTful API the backend opens the ledger when the campaign starts; with the Fake API the store creates it.
     * @param {{ownerUserId: number, name: string, region: string, declaredAreaHectares: number}} command - Plot data.
     * @param {{season: string, cropType: string, seedVariety: string, sowingDate: Date, expectedYield?: number, yieldUnit: string}} setup - First campaign.
     * @returns {Promise<FieldPlot|null>} Registered plot, or `null` on error.
     */
    function registerPlot(command, setup) {
        if (!canRegisterPlot.value) {
            error.value = 'field-management.errors.quota-reached';
            return Promise.resolve(null);
        }
        let campaign, newLedger;
        try {
            campaign = new CropCampaign({ season: setup.season, cropType: setup.cropType });
            campaign.selectCropType(setup.cropType);
            campaign.specifySeedVariety(setup.seedVariety);
            campaign.recordSowingDate(setup.sowingDate);
            newLedger = new CampaignLedger({ yieldUnit: CampaignLedger.yieldUnitOf(setup.cropType) });
            if (setup.expectedYield) newLedger.setExpectedYield(setup.expectedYield, setup.yieldUnit);
        } catch (cause) {
            fail(cause, 'field-management.errors.register-plot');
            return Promise.resolve(null);
        }
        startLoading();
        const plot = new FieldPlot({
            ownerUserId: command.ownerUserId,
            name: command.name.trim(),
            region: command.region.trim(),
            areaHectares: command.declaredAreaHectares
        });
        let createdPlot, createdCampaign;
        return fieldManagementApi.createPlot(FieldPlotAssembler.toResourceFromEntity(plot))
            .then(response => {
                createdPlot = FieldPlotAssembler.toEntityFromResource(response.data);
                campaign.plotId = createdPlot.id;
                return fieldManagementApi.createCampaign(CropCampaignAssembler.toResourceFromEntity(campaign));
            })
            .then(response => {
                createdCampaign = CropCampaignAssembler.toEntityFromResource(response.data);
                newLedger.campaignId = createdCampaign.id;
                return fieldManagementApi.createLedger(CampaignLedgerAssembler.toResourceFromEntity(newLedger));
            })
            .then(() => {
                plots.value = [...plots.value, createdPlot];
                campaignsByPlot.value = new Map(campaignsByPlot.value).set(createdPlot.id, [createdCampaign]);
                loading.value = false;
                return selectPlot(createdPlot.id).then(() => createdPlot);
            })
            .catch(cause => {
                fail(cause, 'field-management.errors.register-plot');
                return null;
            });
    }

    /**
     * Saves the GPS polygon of a plot, its area, and activates its satellite monitoring (US-29, US-30).
     * @param {number} plotId - Plot identifier.
     * @param {import('../domain/model/geo-coordinate.js').GeoCoordinate[]} coordinates - Polygon vertices.
     * @returns {Promise<FieldPlot|null>} Saved plot, or `null` on error.
     */
    function delineateBoundary(plotId, coordinates) {
        const current = getPlotById(plotId);
        if (!current) return Promise.resolve(null);
        const plot = current.clone();
        try {
            plot.delineateBoundary(coordinates);
            // With the Fake API there is no AgroMonitoring: the identifier is simulated.
            plot.activateMonitoring(current.agroMonitoringPolygonId ?? crypto.randomUUID().replace(/-/g, '').slice(0, 24));
        } catch (cause) {
            fail(cause, 'field-management.errors.invalid-polygon');
            return Promise.resolve(null);
        }
        startLoading();
        return fieldManagementApi.updatePlot(FieldPlotAssembler.toResourceFromEntity(plot))
            .then(response => {
                const updated = FieldPlotAssembler.toEntityFromResource(response.data);
                plots.value = plots.value.map(item => item.id === updated.id ? updated : item);
                loading.value = false;
                return updated;
            })
            .catch(cause => {
                fail(cause, 'field-management.errors.save-polygon');
                return null;
            });
    }

    /**
     * Saves the editable descriptive data of a plot. The crop belongs to its
     * campaign and the area belongs to its GPS boundary, so neither is changed
     * from the settings screen.
     * @param {number} plotId - Plot identifier.
     * @param {{name: string, region: string}} command - New name and location.
     * @returns {Promise<boolean>} `true` when the API confirms the update.
     */
    function updatePlotDetails(plotId, command) {
        const current = getPlotById(plotId);
        if (!current) return Promise.resolve(false);
        const copy = current.clone();
        try {
            copy.updateDetails(command);
        } catch (cause) {
            fail(cause, 'field-management.errors.save-plot-details');
            return Promise.resolve(false);
        }
        startLoading();
        return fieldManagementApi.updatePlot(FieldPlotAssembler.toResourceFromEntity(copy))
            .then(response => {
                const updated = FieldPlotAssembler.toEntityFromResource(response.data);
                plots.value = plots.value.map(item => item.id === updated.id ? updated : item);
                loading.value = false;
                return true;
            })
            .catch(cause => {
                fail(cause, 'field-management.errors.save-plot-details');
                return false;
            });
    }

    /**
     * Deletes a plot by ID.
     * @param {number} id - The ID of the plot to delete.
     * @returns {Promise<void>}
     */
    function deletePlot(id) {
        startLoading();
        return fieldManagementApi.deletePlot(id)
            .then(() => {
                plots.value = plots.value.filter(plot => plot.id !== id);
                loading.value = false;
                if (plotSelection.selectedPlotId === id) {
                    plotSelection.select(null);
                    ledger.value = null;
                    const first = plots.value[0];
                    if (first) return selectPlot(first.id);
                }
            })
            .catch(cause => fail(cause, 'field-management.errors.delete-plot'));
    }

    /**
     * Applies a change to a copy of the ledger and saves it; the shown ledger
     * only changes when the API confirms.
     * @param {function(CampaignLedger): void} change - Change to apply.
     * @param {string} errorKey - i18n key of the failed operation.
     * @returns {Promise<boolean>} `true` when saved.
     */
    function saveLedger(change, errorKey) {
        const current = ledger.value;
        if (!current) return Promise.resolve(false);
        const copy = current.clone();
        try {
            change(copy);
        } catch (cause) {
            fail(cause, errorKey);
            return Promise.resolve(false);
        }
        startLoading();
        return fieldManagementApi.updateLedger(CampaignLedgerAssembler.toResourceFromEntity(copy))
            .then(response => {
                ledger.value = CampaignLedgerAssembler.toEntityFromResource(response.data);
                loading.value = false;
                return true;
            })
            .catch(cause => {
                fail(cause, errorKey);
                return false;
            });
    }

    /**
     * Adds an expense to the ledger of the active campaign (US-37 to US-39).
     * @param {Object} command - Expense data with its `category`.
     * @returns {Promise<boolean>} `true` when saved.
     */
    function recordExpense(command) {
        return saveLedger(copy => {
            if (command.category === ExpenseCategory.INPUTS) copy.recordInputExpense(command);
            else if (command.category === ExpenseCategory.LABOR) copy.recordDailyLaborExpense(command);
            else copy.recordFieldFreightExpense(command);
        }, 'field-management.errors.record-expense');
    }

    /**
     * Changes the expected yield, which updates the breakeven price (US-40).
     * @param {number} expectedYield - Expected harvest.
     * @returns {Promise<boolean>} `true` when saved.
     */
    function setExpectedYield(expectedYield) {
        return saveLedger(copy => copy.setExpectedYield(expectedYield, copy.yieldUnit), 'field-management.errors.save-yield');
    }

    /**
     * Loads the NDVI of a plot. The observations belong to Crop Health and are
     * read through its API (a plot without polygon has no observations yet).
     * @param {FieldPlot|undefined} plot - Selected plot.
     */
    function loadObservations(plot) {
        const request = ++observationsRequest;
        observations.value = [];
        observationsError.value = false;
        if (!plot?.hasPolygon()) {
            observationsLoading.value = false;
            return;
        }
        observationsLoading.value = true;
        cropHealthApi.getObservationsByPlot(plot.id)
            .then(response => {
                if (request !== observationsRequest) return;
                observations.value = SatelliteObservationAssembler.toEntitiesFromResponse(response)
                    .filter(item => item.plotId === plot.id && item.stressAreaHectares <= plot.areaHectares)
                    .sort((a, b) => Date.parse(a.date) - Date.parse(b.date));
            })
            .catch(() => { if (request === observationsRequest) observationsError.value = true; })
            .finally(() => { if (request === observationsRequest) observationsLoading.value = false; });
    }

    /** Forgets the plots of the previous user (after signing out). */
    function clearState() {
        ++plotsRequest;
        ++ledgerRequest;
        plotsLoading.value = false;
        loading.value = false;
        plots.value = [];
        campaignsByPlot.value = new Map();
        ledger.value = null;
        error.value = null;
    }

    /** Loads the plots again after an error. */
    function retry() {
        if (currentUserId.value !== null) loadMyPlots(currentUserId.value);
    }

    // Load the plots every time the signed-in producer changes.
    watch(currentUserId, userId => userId === null ? clearState() : loadMyPlots(userId), { immediate: true });
    // Reload the NDVI when the selected plot changes.
    watch(selectedPlot, plot => loadObservations(plot), { immediate: true });

    return {
        plots,
        plotsLoading,
        ledger,
        loading,
        error,
        observations,
        observationsLoading,
        observationsError,
        latestObservation,
        currentUserId,
        plotCount,
        plotQuota,
        canRegisterPlot,
        freeSlots,
        selectedPlot,
        campaigns,
        activeCampaign,
        getPlotById,
        getCurrentCampaignOf,
        loadMyPlots,
        retry,
        selectPlot,
        registerPlot,
        delineateBoundary,
        updatePlotDetails,
        deletePlot,
        recordExpense,
        setExpectedYield
    };
});

export default useFieldManagementStore;
