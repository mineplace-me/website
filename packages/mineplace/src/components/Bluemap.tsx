// src/components/Bluemap.tsx
import { component$, useVisibleTask$ } from '@builder.io/qwik';

export const Bluemap = component$(() => {
  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(async () => {
    const { load } = await import('../../../bluemap/dist/bluemap.umd.js');
    const container = document.getElementById('vue-map');
    if (!container) {
      console.error('Bluemap container not found!');
      return;
    }
    try {
      void load(container); // this should call createApp(App).mount(container)
    } catch (e) {
      console.error('Bluemap mount failed!', e);
    }
  });

  return <div id="bluemap" style={{ width: '100%', height: '500px' }}>
    <div id="map-container"></div>
    <div id="app"></div>
  </div>;
});
