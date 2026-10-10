<script setup>
import LeftSidebar from "./left-sidebar.vue";
import Toolbar from "./toolbar.vue";
import useLayoutStore from "../../application/layout.store.js";

/**
 * Shell of the private pages: side menu, top bar and the routed content
 * (Angular `Layout`). On wide screens the side menu is always visible;
 * below 960px it opens over the content from the top bar.
 */
const layoutStore = useLayoutStore();
</script>

<template>
  <div class="layout">
    <aside v-if="!layoutStore.isHandset" class="sidebar">
      <left-sidebar/>
    </aside>
    <pv-drawer v-else v-model:visible="layoutStore.sidebarOpened" class="sidebar-drawer">
      <template #container>
        <div class="sidebar" role="dialog">
          <left-sidebar/>
        </div>
      </template>
    </pv-drawer>

    <div class="main-area">
      <toolbar/>
      <main class="content">
        <router-view/>
      </main>
    </div>
  </div>
</template>

<style scoped>
.layout {
  display: flex;
  height: 100vh;
  background: var(--sa-surface-container-low);
}

.sidebar {
  flex: none;
  width: var(--sa-sidebar-width);
  height: 100%;
  overflow-y: auto;
  scrollbar-width: thin;
  border-right: 1px solid var(--sa-outline-variant);
  background: var(--sa-surface);
}

/* The content never scrolls sideways. */
.main-area {
  flex: 1;
  min-width: 0;
  overflow-x: hidden;
  overflow-y: auto;
}

.content {
  padding: 8px 32px 32px;
}

@media (max-width: 959.98px) {
  .content {
    padding: 8px 16px 24px;
  }
}
</style>

<style>
.sidebar-drawer.p-drawer {
  width: var(--sa-sidebar-width);
  max-width: 85vw;
  border: none;
}
</style>
