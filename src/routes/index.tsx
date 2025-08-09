import { component$ } from '@builder.io/qwik';
import type { DocumentHead } from '@builder.io/qwik-city';
import { Box, Github, Network } from 'lucide-icons-qwik';
import { LogoBirdflop, LogoDiscord, LogoLuminescent } from '@luminescent/ui-qwik';

export default component$(() => {
  return (
    <div class="flex flex-col items-center justify-center min-h-screen">
      <div class="animate-in fade-in slide-in-from-top-6 anim-duration-1000 lum-card p-16 shadow-xl">
        <div class="flex gap-4 items-center mb-6">
          <Box size={64} />
          <h1 class="text-5xl font-bold">
            Mineplace
            <a class="text-lg flex items-center mt-2 hover:underline font-normal" href="https://birdflop.com">
              <LogoBirdflop size={20} /> Powered by Birdflop Hosting
            </a>
          </h1>
        </div>

        <p class="text-4xl mb-6 font-bold">
          Now imagine if r/place was 3D.
        </p>
        <div class="flex gap-2">
          <button class="lum-btn border-purple-500 border-2 hover:border-2 hover:lum-bg-purple-500 cursor-pointer">
            <Network size={24} />
            Server IP: mineplace.me
          </button>
          <div class="flex-1"></div>
          <a class="lum-btn p-2 lum-bg-transparent" href="https://discord.gg/nmgtX5z">
            <LogoDiscord size={24} />
          </a>
          <a class="lum-btn p-2 lum-bg-transparent" href="https://github.com/LuminescentDev">
            <Github size={24} />
          </a>
          <a class="lum-btn p-2 lum-bg-transparent" href="https://luminescent.dev">
            <LogoLuminescent size={24} />
          </a>
          <a class="lum-btn p-2 lum-bg-transparent" href="https://github.com/LuminescentDev">
            <LogoBirdflop size={24} />
          </a>
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
