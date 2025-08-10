import { $, component$, useSignal, useStore } from '@builder.io/qwik';
import { Box, Github, Network, X } from 'lucide-icons-qwik';
import { LogoBirdflop, LogoDiscord, LogoLuminescent } from '@luminescent/ui-qwik';
import { generateHead } from '~/root';

export default component$(() => {
  const closed = useSignal(true);
  const mapRef = useSignal<HTMLIFrameElement>();

  const mapStore = useStore({
    zoom: 1,
    position: { x: 0, y: 0, z: 0 },
    viewMode: 'flat',
  });

  const onLoad$ = $(() => {
    console.log('loaded');

    window.addEventListener('message', (event: any) => {
      if (event.origin !== 'https://map.mineplace.me') return;

      const { data } = event;
      switch (data.type) {
        case 'onPosition':
          console.log('Position:', data.position);
          mapStore.position = data.position;
          break;
        case 'onViewMode': {
          const { mode } = data;
          mapStore.viewMode = mode;
          break;
        }
        // …etc for all other event types
        default:
          console.log('Other message:', data);
          break;
      }
    });
  });

  return <>
    <iframe ref={mapRef} onLoad$={onLoad$} id="bg" src="https://map.mineplace.me" class={{
      'fixed bottom-0 overflow-hidden w-lvw h-lvh object-cover': true,
      'opacity-50': !closed.value,
    }}/>
    <div class={{
      'transition-all duration-300 flex items-center md:justify-center min-h-screen': true,
      'opacity-0 pointer-events-none': closed.value,
    }}>
        <div class={{
          'lum-card py-8 min-h-screen max-h-auto max-w-full shadow-2xl shadow-gray-900 backdrop-blur-lg': true,
          'md:p-16 md:min-h-auto md:animate-in md:fade-in md:slide-in-from-top-6 md:anim-duration-1000 ': true,
        }}>
          <button class="absolute top-10 right-10 lum-btn p-2 lum-bg-transparent">
            <X size={32} onClick$={() => closed.value = !closed.value} />
          </button>
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
            Bedrock Port: 19132
          </p>
          <div class="flex flex-col md:flex-row gap-2">
            <button class="lum-btn w-full font-minecraft border-luminescent-500 border-2 hover:border-2 hover:lum-bg-luminescent-500 cursor-pointer">
              <Network size={24} />
              IP: play.mineplace.me
            </button>
            <div class="flex flex-1 justify-evenly gap-1 mt-2 md:mt-0">
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
    <button class={{
      'transition-all duration-400 lum-btn p-7 text-left flex-row items-center shadow-2xl shadow-gray-900 backdrop-blur-lg fixed left-2 cursor-pointer': true,
      'pointer-events-none -top-10 opacity-0': !closed.value,
      'top-2': closed.value,
    }} onClick$={() => closed.value = !closed.value}>
      <Box size={48} />
      <h1 class="text-2xl font-bold">
        Mineplace
        <p class="text-base flex items-center gap-1 mt-2 font-normal">
          <LogoBirdflop size={20} />Powered by Birdflop Hosting
        </p>
      </h1>
    </button>
    <div class={{
      'transition-all duration-400 lum-card p-2 shadow-2xl shadow-gray-900 backdrop-blur-lg fixed right-2 gap-1': true,
      'pointer-events-none -top-10 opacity-0': !closed.value,
      'top-2': closed.value,
    }}>
      <button class="lum-btn p-2 rounded-lum-1 lum-bg-transparent">
        <LogoBirdflop size={24} />
      </button>
      <button class="lum-btn p-2 rounded-lum-1 lum-bg-transparent">
        <LogoBirdflop size={24} />
      </button>
      <button class="lum-btn p-2 rounded-lum-1 lum-bg-transparent">
        <LogoBirdflop size={24} />
      </button>
      <button class="lum-btn p-2 rounded-lum-1 lum-bg-transparent">
        <LogoBirdflop size={24} />
      </button>
      <button class="lum-btn p-2 rounded-lum-1 lum-bg-transparent">
        <LogoBirdflop size={24} />
      </button>
      <button class="lum-btn p-2 rounded-lum-1 lum-bg-transparent">
        <LogoBirdflop size={24} />
      </button>
    </div>
    <div class={{
      'fixed flex gap-2 w-full top-2 justify-center': true,
    }}>
      <div class={{
        'flex flex-row items-center transition-all duration-400 lum-card p-2 shadow-2xl shadow-gray-900 backdrop-blur-lg gap-2': true,
        'pointer-events-none -m-10 opacity-0': !closed.value,
      }}>
        <label for="x" class="px-2 font-bold text-xl text-red-300">
          x
        </label>
        <input id="x" type="number" class="lum-input rounded-lum-2 w-30 text-center" value={mapStore.position.x} />
      </div>
      {mapStore.viewMode !== 'flat' && (
        <div class={{
          'flex flex-row items-center transition-all duration-400 lum-card p-2 shadow-2xl shadow-gray-900 backdrop-blur-lg gap-2': true,
          'pointer-events-none -m-10 opacity-0': !closed.value,
        }}>
          <label for="x" class="px-2 font-bold text-xl text-green-300">
            y
          </label>
          <input id="y" type="number" class="lum-input rounded-lum-2 w-30 text-center" value={mapStore.position.y} />
        </div>)
      }
      <div class={{
        'flex flex-row items-center transition-all duration-400 lum-card p-2 shadow-2xl shadow-gray-900 backdrop-blur-lg gap-2': true,
        'pointer-events-none -m-10 opacity-0': !closed.value,
      }}>
        <label for="x" class="px-2 font-bold text-xl text-blue-300">
          z
        </label>
        <input id="z" type="number" class="lum-input rounded-lum-2 w-30 text-center" value={mapStore.position.z} />
      </div>
    </div>
  </>;
});

export const head = generateHead({});
