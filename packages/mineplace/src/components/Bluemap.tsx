// src/components/Bluemap.tsx
import { component$, useVisibleTask$ } from '@builder.io/qwik';

export const Bluemap = component$(() => {
  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(async () => {
    const { load } = await import('../../../bluemap/dist/bluemap.mjs');
    const container = document.getElementById('vue-map');
    if (container) await load(container);
  });

  return <div id="vue-map" style={{ width: '100%', height: '500px' }} />;
});
