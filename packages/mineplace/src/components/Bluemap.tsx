// src/components/Bluemap.tsx
import { component$, useContext, useVisibleTask$ } from '@builder.io/qwik';
import { MapStoreContext } from '~/routes/index.js';

export const Bluemap = component$((props: any) => {
  const mapStore = useContext(MapStoreContext);
  // Expose simple functions on window for quick console testing (optional)
  if (typeof window !== 'undefined') {
    (window as any).bluemapSetPerspective = (t?: number, d?: number) => window.BlueMapBridge?.setPerspectiveView(t, d);
    (window as any).bluemapSetFlat = (t?: number, d?: number) => window.BlueMapBridge?.setFlatView(t, d);
    (window as any).bluemapSetFree = (t?: number, y?: number) => window.BlueMapBridge?.setFreeFlight(t, y);
  }
  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(async () => {
    try {
      // Load the BlueMap UMD file
      await import('../../../bluemap/dist/bluemap.umd.js');

      // Access the global export
      const bluemapModule = (window as any).BlueMapModule;
      if (!bluemapModule || !bluemapModule.load) {
        console.error('BlueMap module not found or load function missing!');
        return;
      }

      const { load } = bluemapModule;

      // Ensure the container exists
      const container = document.getElementById('app');
      if (!container) {
        console.error('Bluemap container not found!');
        return;
      }

      // Ensure the map-container also exists
      const mapContainer = document.getElementById('map-container');
      if (!mapContainer) {
        console.error('Map container not found!');
        return;
      }

      console.log('Loading BlueMap into container:', container);

      try {
        await load(container);
        console.log('BlueMap loaded successfully!');

        // Listen to BlueMap events and update store
        mapContainer.addEventListener('bluemapCameraMoved', (event: any) => {
          // round position values
          const { x, y, z } = event.detail.camera.position;
          mapStore.position = {
            x: Math.round(x),
            y: Math.round(y),
            z: Math.round(z),
          };
        });

      } catch (e) {
        console.error('Bluemap mount failed!', e);
      }
    } catch (e) {
      console.error('Failed to load BlueMap:', e);
    }
  });

  return <div id="bluemap" {...props}>
    <div id="map-container" class="w-full h-full"></div>
    <div id="app" class="hidden"></div>
  </div>;
});
