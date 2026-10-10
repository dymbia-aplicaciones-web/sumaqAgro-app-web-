import {defineStore} from "pinia";
import {computed, ref} from "vue";
import useIamStore from "../../iam/application/iam.store.js";

/**
 * Shares the plot selection between Field Management and Crop Health for each
 * demo user (Angular `PlotSelectionService`).
 *
 * @returns {Object} Store state and actions.
 */
const usePlotSelectionStore = defineStore('plot-selection', () => {
    const iamStore = useIamStore();
    /** @type {import('vue').Ref<Object<number, number|null>>} Selected plot by user id. */
    const selections = ref({});

    /** @type {import('vue').ComputedRef<number|null>} Plot selected by the active user. */
    const selectedPlotId = computed(() => {
        const userId = iamStore.currentUserId;
        return userId === null ? null : (selections.value[userId] ?? null);
    });

    /**
     * Selects a plot for the active user.
     * @param {number|null} plotId - Plot identifier.
     */
    function select(plotId) {
        const userId = iamStore.currentUserId;
        if (userId !== null) selections.value = {...selections.value, [userId]: plotId};
    }

    return {selectedPlotId, select};
});

export default usePlotSelectionStore;
