// src/components/Bluemap.tsx
import { component$, useVisibleTask$ } from '@builder.io/qwik';

export const Bluemap = component$((props: any) => {
  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(async () => {
    try {
      // Wait a bit for the DOM to be ready
      await new Promise(resolve => setTimeout(resolve, 100));
      
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
