<script setup>
/**
 * Root component.
 * The private pages are shown inside the shell (`layout.vue`, nested route),
 * the demo access and the public QR verification without it.
 */
</script>

<template>
  <pv-toast/>
  <pv-confirm-dialog/>
  <router-view/>
</template>
