import {defineStore} from "pinia";
import {ref, watch} from "vue";

/** Phones and small tablets (Angular `LayoutService` breakpoint). */
const HANDSET_QUERY = '(max-width: 959.98px)';

/**
 * State shared by the parts of the app shell: the side menu and the top bar
 * (Angular `LayoutService`). The menu stays open on wide screens; on phones
 * it opens over the content from the menu button of the top bar.
 *
 * @returns {Object} Store state and actions.
 */
const useLayoutStore = defineStore('layout', () => {
    const media = window.matchMedia(HANDSET_QUERY);
    /** @type {import('vue').Ref<boolean>} `true` on phones and small tablets. */
    const isHandset = ref(media.matches);
    /** @type {import('vue').Ref<boolean>} `true` while the browser has network connection. */
    const isOnline = ref(navigator.onLine);
    /** @type {import('vue').Ref<boolean>} `true` while the drawer of the side menu is open (handset). */
    const sidebarOpened = ref(false);

    media.addEventListener('change', event => isHandset.value = event.matches);
    window.addEventListener('online', () => isOnline.value = true);
    window.addEventListener('offline', () => isOnline.value = false);
    watch(isHandset, handset => { if (!handset) sidebarOpened.value = false; });

    /** Opens or closes the side menu. */
    function toggleSidebar() {
        sidebarOpened.value = !sidebarOpened.value;
    }

    /** Closes the menu after choosing an option, only on phones. */
    function closeSidebarOnHandset() {
        if (isHandset.value) sidebarOpened.value = false;
    }

    return {isHandset, isOnline, sidebarOpened, toggleSidebar, closeSidebarOnHandset};
});

export default useLayoutStore;
