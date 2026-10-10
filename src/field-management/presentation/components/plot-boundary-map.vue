<script setup>
import L from "leaflet";
import {onBeforeUnmount, onMounted, ref, watch} from "vue";
import {useI18n} from "vue-i18n";
import {createBaseLayers, DEFAULT_MAP_CENTER, showBaseLayer} from "../../../shared/presentation/map-layers.js";
import {FieldPlot} from "../../domain/model/field-plot.entity.js";
import {GeoCoordinate} from "../../domain/model/geo-coordinate.js";

/** Satellite map where the farmer marks the vertices of the plot (Angular `PlotBoundaryMap`, US-30). */
const props = defineProps({
  coordinates: { type: Array, required: true },
  /** `OPEN`, `CLOSED` or `CROSSED`. */
  status: { type: String, required: true }
});
const emit = defineEmits(['vertex-added']);
const { t } = useI18n();

const mapElement = ref();
const layer = ref('satellite');
const layerOptions = ['satellite', 'streets'];
const search = ref('');
const searchMessage = ref(null);
const baseLayers = createBaseLayers();
const drawingLayer = L.layerGroup();
let map;

/** Redraws the polygon and the "V1", "V2"... vertex labels. */
const drawPolygon = () => {
  drawingLayer.clearLayers();
  const points = props.coordinates.map(vertex => [vertex.latitude, vertex.longitude]);
  const color = props.status === 'CROSSED' ? '#e53935' : '#4caf50';
  if (points.length >= 2) {
    const shape = points.length >= FieldPlot.MINIMUM_VERTICES
        ? L.polygon(points, { color, weight: 3, fillOpacity: 0.3 })
        : L.polyline(points, { color, weight: 3 });
    shape.addTo(drawingLayer);
  }
  points.forEach((point, index) =>
      L.circleMarker(point, { radius: 7, color: '#1b5e20', weight: 2, fillColor: '#ffffff', fillOpacity: 1 })
          .bindTooltip(`V${index + 1}`, { permanent: true, direction: 'top', offset: [0, -8], className: 'vertex-label' })
          .addTo(drawingLayer));
};

/**
 * Centers the map on a polygon.
 * @param {GeoCoordinate[]} coordinates - Polygon vertices.
 */
const fitTo = (coordinates) => {
  if (!map || coordinates.length === 0) return;
  map.fitBounds(L.latLngBounds(coordinates.map(vertex => [vertex.latitude, vertex.longitude])), { padding: [48, 48], maxZoom: 18 });
};

/** Moves the map to the `latitude, longitude` written in the search box. */
const onSearch = () => {
  const parts = search.value.split(',').map(part => Number(part.trim()));
  const [latitude, longitude] = parts;
  const valid = parts.length === 2 && parts.every(part => Number.isFinite(part)) && Math.abs(latitude) <= 90 && Math.abs(longitude) <= 180;
  if (!valid) {
    searchMessage.value = 'field-management.boundary.search-invalid';
    return;
  }
  searchMessage.value = null;
  map?.setView([latitude, longitude], 17);
};

/** Adds the current GPS position as a vertex. */
const onUseMyLocation = () => {
  searchMessage.value = null;
  if (!navigator.geolocation) {
    searchMessage.value = 'field-management.boundary.location-unavailable';
    return;
  }
  navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        emit('vertex-added', new GeoCoordinate(coords.latitude, coords.longitude));
        map?.setView([coords.latitude, coords.longitude], 18);
      },
      () => searchMessage.value = 'field-management.boundary.location-denied',
      { enableHighAccuracy: true, timeout: 15000 });
};

onMounted(() => {
  map = L.map(mapElement.value, { center: DEFAULT_MAP_CENTER, zoom: 17 });
  drawingLayer.addTo(map);
  showBaseLayer(map, baseLayers, layer.value);
  map.on('click', event => emit('vertex-added', new GeoCoordinate(event.latlng.lat, event.latlng.lng)));
  drawPolygon();
  fitTo(props.coordinates);
  // Leaflet measures the container before the layout settles; measure again.
  setTimeout(() => map?.invalidateSize());
});

onBeforeUnmount(() => map?.remove());

watch(() => [props.coordinates, props.status], drawPolygon);
watch(layer, value => map && showBaseLayer(map, baseLayers, value));

defineExpose({ fitTo });
</script>

<template>
  <pv-card class="map-card sa-card">
    <template #content>
      <div class="flex flex-wrap align-items-center gap-3 p-3">
        <pv-icon-field class="flex-1">
          <pv-input-icon class="pi pi-search"/>
          <pv-input-text v-model="search" fluid :placeholder="t('field-management.boundary.search')" :aria-label="t('field-management.boundary.search')" @keydown.enter.prevent="onSearch"/>
        </pv-icon-field>
        <pv-button outlined icon="pi pi-map-marker" :label="t('field-management.boundary.my-location')" @click="onUseMyLocation"/>
      </div>
      <p v-if="searchMessage" class="sa-error mx-3 mt-0" role="alert">{{ t(searchMessage) }}</p>

      <div ref="mapElement" class="map" role="application" :aria-label="t('field-management.boundary.map')"/>

      <div class="flex flex-wrap align-items-center justify-content-between gap-3 px-3 py-2">
        <p class="flex align-items-center gap-2 m-0 sa-muted text-sm">
          <i class="pi pi-hand-point-up" aria-hidden="true"/>
          {{ t('field-management.boundary.instructions', { minimum: FieldPlot.MINIMUM_VERTICES }) }}
        </p>
        <pv-select-button v-model="layer" :options="layerOptions" :allow-empty="false" :aria-label="t('field-management.boundary.layer')">
          <template #option="{ option }">{{ t(`field-management.boundary.layer-${option}`) }}</template>
        </pv-select-button>
      </div>
    </template>
  </pv-card>
</template>

<style scoped>
.map-card {
  min-width: 0;
  overflow: hidden;
}

.map-card :deep(.p-card-body) {
  padding: 0;
}

.map {
  z-index: 0;
  height: min(62vh, 560px);
  min-height: 340px;
  cursor: crosshair;
}

@media (max-width: 959.98px) {
  .map {
    height: 50vh;
  }
}
</style>
