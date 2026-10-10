import L from "leaflet";

/** Default center of the maps: Valle del Mantaro (Angular `DEFAULT_CENTER`). */
export const DEFAULT_MAP_CENTER = [-12.0725, -75.2121];

/** Center and zoom that show all Peru (Crop Health viewer without polygon). */
export const PERU_VIEW = { center: [-9.19, -75.015], zoom: 5 };

/**
 * Same base layers as the Angular maps: Esri satellite imagery with place
 * names, and OpenStreetMap streets.
 * @returns {{satellite: L.Layer, streets: L.Layer}} Base layers.
 */
export function createBaseLayers() {
    return {
        satellite: L.layerGroup([
            L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
                maxZoom: 19, maxNativeZoom: 17, attribution: 'Tiles © Esri — Esri, Maxar, Earthstar Geographics'
            }),
            L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}', {
                maxZoom: 19, maxNativeZoom: 17
            })
        ]),
        streets: L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19, attribution: '© OpenStreetMap contributors'
        })
    };
}

/**
 * Shows one base layer and removes the others.
 * @param {L.Map} map - Map.
 * @param {Object<string, L.Layer>} layers - Base layers.
 * @param {string} active - Layer to show.
 */
export function showBaseLayer(map, layers, active) {
    Object.entries(layers).forEach(([name, layer]) => {
        if (name === active) layer.addTo(map);
        else layer.remove();
    });
}
