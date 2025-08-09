import { component$ } from '@builder.io/qwik';
import { Box, Github, Map, Network } from 'lucide-icons-qwik';
import { LogoBirdflop, LogoDiscord, LogoLuminescent } from '@luminescent/ui-qwik';
import { generateHead } from '~/root';

export default component$(() => {
  return (
    <div class="flex flex-col items-center md:justify-center min-h-screen">
      <div class={{
        'lum-card py-16 min-h-screen max-h-auto max-w-full shadow-xl backdrop-blur-xl': true,
        'md:p-16 md:min-h-auto md:animate-in md:fade-in md:slide-in-from-top-6 md:anim-duration-1000 ': true,
      }}>
        <div class="flex gap-4 items-center mb-6">
          <Box size={64} />
          <h1 class="text-5xl font-bold">
            Mineplace
            <a class="text-lg flex items-center gap-1 mt-2 hover:underline font-normal" href="https://birdflop.com">
              <LogoBirdflop size={20} />Powered by Birdflop Hosting
            </a>
          </h1>
        </div>

        <p class="text-xl md:text-4xl mb-6 font-minecraft">
          Now imagine if r/place was 3D.
        </p>

        <div class="text-xs md:text-base">
          <p class="text-xl font-bold">
            Rules
          </p>
          <p>
            😈 Do not paint over other artworks using random colors or patterns just to mess things up
          </p>
          <p>
            🔞 No +18 or hate group related paintings
          </p>
          <p>
            🔗 Do not reference inappropriate websites
          </p>
          <p>
            🧑‍🤝‍🧑 Do not paint with more than one account
          </p>
          <p>
            🤖 Use of bots is not allowed
          </p>
          <p>
            🙅 Disclosing other user's personal information is not allowed
          </p>
          <p>
            ✅ Painting over other artworks to complement them or create a new drawing is allowed
          </p>
          <p>
            ✅ Griefing political party flags or portraits of politicians is allowed
          </p>
        </div>

        <p>
          Mineplace supports Java and Bedrock Edition!<br />
          Bedrock Port: 21512
        </p>
        <div class="flex flex-col md:flex-row gap-2">
          <button class="lum-btn w-full font-minecraft border-luminescent-500 border-2 hover:border-2 hover:lum-bg-luminescent-500 cursor-pointer">
            <Network size={24} />
            IP: play.mineplace.me
          </button>
          <a href="" class="lum-btn border-luminescent-900 hover:lum-bg-luminescent-900 cursor-pointer">
            <Map size={24} />
            Online Map
          </a>
          <div class="flex flex-1 justify-evenly mt-2">
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
    </div>
  );
});

export const head = generateHead({});
