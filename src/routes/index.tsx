import { component$ } from '@builder.io/qwik';
import type { DocumentHead } from '@builder.io/qwik-city';
import { Box } from 'lucide-icons-qwik';

export default component$(() => {
  return (
    <div class="flex flex-col items-center justify-center min-h-screen">
      <div class="lum-card p-24 shadow-xl">
        <h1 class="flex gap-4 items-center text-5xl font-bold" style={{
          filter: 'drop-shadow(0 0 30px var(--color-luminescent-400))',
        }}>
          <Box class="w-16 h-16" />
          Mineplace
        </h1>
        <p>
          Server IP:
        </p>
        <div class="lum-card p-2">
          mineplace.me
        </div>
      </div>
    </div>
  );
});

export const head: DocumentHead = {
  title: 'Welcome to Qwik',
  meta: [
    {
      name: 'description',
      content: 'Qwik site description',
    },
  ],
};
