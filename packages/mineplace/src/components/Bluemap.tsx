// src/components/Bluemap.tsx
import { component$, useContext, useVisibleTask$ } from '@builder.io/qwik';
import { MapStoreContext } from '~/routes/index.js';

export const Bluemap = component$((props: any) => {
  const mapStore = useContext(MapStoreContext);
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
