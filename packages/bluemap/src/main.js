/*
 * This file is part of BlueMap, licensed under the MIT License (MIT).
 *
 * Copyright (c) Blue (Lukas Rieger) <https://bluecolored.de>
 * Copyright (c) contributors
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

import { createApp } from 'vue';
import App from './App.vue';
import * as BlueMap from "./js/BlueMap";
import { BlueMapApp } from "./js/BlueMapApp";
import { i18nModule, loadLanguageSettings } from "./i18n";

// utils
String.prototype.includesCI = function (val) {
  return this.toLowerCase().includes(val.toLowerCase());
}

// bluemap app
async function load(el) {
  try {
    const bluemap = new BlueMapApp(document.getElementById("map-container"));
    window.bluemap = bluemap;
    window.BlueMap = BlueMap;

    window.BlueMapBridge = {
      setPerspectiveView: (transition = 250, minDistance = 5) => bluemap.setPerspectiveView?.(transition, minDistance),
      setFlatView: (transition = 250, minDistance = 5) => bluemap.setFlatView?.(transition, minDistance),
      setFreeFlight: (transition = 250, targetY) => bluemap.setFreeFlight?.(transition, targetY),
      getMode: () => bluemap.appState?.controls?.state,
      getPosition: () => ({ ...(bluemap.mapViewer?.controlsManager?.position || {}) }),
      updateMap: () => bluemap.updateMap?.(),
      setSuperSampling: (v) => { bluemap.mapViewer.data.superSampling = v; bluemap.mapViewer.redraw(); bluemap.saveUserSettings(); },
      setHiresDistance: (v) => { bluemap.mapViewer.data.loadedHiresViewDistance = v; bluemap.mapViewer.updateLoadedMapArea(); bluemap.saveUserSettings(); },
      setLowresDistance: (v) => { bluemap.mapViewer.data.loadedLowresViewDistance = v; bluemap.mapViewer.updateLoadedMapArea(); bluemap.saveUserSettings(); },
      setMouseSensitivity: (v) => { bluemap.appState.controls.mouseSensitivity = v; bluemap.updateControlsSettings(); bluemap.saveUserSettings(); },
      setInvertMouse: (flag) => { bluemap.appState.controls.invertMouse = flag; bluemap.updateControlsSettings(); bluemap.saveUserSettings(); },
      setPauseTileLoading: (flag) => { bluemap.appState.controls.pauseTileLoading = flag; bluemap.saveUserSettings(); },
      setChunkBorders: (flag) => { bluemap.setChunkBorders(flag); bluemap.saveUserSettings(); },
      setDebug: (flag) => { bluemap.setDebug(flag); bluemap.saveUserSettings(); },
      setSunlightStrength: (v) => { bluemap.mapViewer.data.uniforms.sunlightStrength.value = v; bluemap.mapViewer.redraw(); },
      cycleSunlightStrength: () => { const cur = bluemap.mapViewer.data.uniforms.sunlightStrength.value; const next = cur >= 1 ? 0 : Math.min(1, +(cur + 0.1).toFixed(2)); bluemap.mapViewer.data.uniforms.sunlightStrength.value = next; bluemap.mapViewer.redraw(); },
      getSettings: () => ({
        superSampling: bluemap.mapViewer.data.superSampling,
        hiresDistance: bluemap.mapViewer.data.loadedHiresViewDistance,
        lowresDistance: bluemap.mapViewer.data.loadedLowresViewDistance,
        mouseSensitivity: bluemap.appState.controls.mouseSensitivity,
        invertMouse: bluemap.appState.controls.invertMouse,
        pauseTileLoading: bluemap.appState.controls.pauseTileLoading,
        showChunkBorders: bluemap.mapViewer.data.uniforms.chunkBorders.value,
        showDebug: bluemap.appState.debug,
        sunlightStrength: bluemap.mapViewer.data.uniforms.sunlightStrength.value,
      }),
    };

    await loadLanguageSettings()
    // init vue
    const vue = createApp(App, {
      i18nModule,
      render: h => h(App)
    });
    vue.config.globalProperties.$bluemap = bluemap;

    // load languages
    vue.use(i18nModule);

    // load bluemap next tick (to let the assets load first)
    const app = vue.mount(el);
    await app.$nextTick();
    await bluemap.load();

  // Signal readiness so host frontends can sync settings
  window.dispatchEvent(new CustomEvent('bluemap:ready'));

  } catch (e) {
    console.error("Failed to load BlueMap webapp!", e);
    document.getElementById("map-container").innerHTML = `
    <div id="bm-app-err" class="w-full h-full flex items-center justify-center">
      <div>
        <img src="assets/logo.png" alt="bluemap logo">
        <div class="bm-app-err-main">Failed to load BlueMap webapp!</div>
        <div class="bm-app-err-hint">Make sure you have <a href="https://get.webgl.org/webgl2/">WebGL2</a> enabled on your browser.</div>
      </div>
    </div>
  `;
  }
}

// Export for different module systems
const exports = { load };

// For CommonJS/Node.js (only if module is defined in the runtime)
/* global module */
try {
  if (typeof module !== 'undefined' && module?.exports) {
    module.exports = exports;
  }
} catch (_) { /* ignore */ }

// For ES modules
export default exports;

// For UMD/global
if (typeof window !== 'undefined') {
  window.BlueMapModule = exports;
}

// Remove the automatic load() call - only call when explicitly requested
// load().catch(error => console.error(error));
