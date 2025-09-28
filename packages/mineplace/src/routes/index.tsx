import { $, component$, createContextId, useContextProvider, useSignal, useStore, useVisibleTask$ } from '@builder.io/qwik';
import { Box, Github, Network, RefreshCcw, Rotate3D, Settings, Square, Sun, Trophy, Users, X } from 'lucide-icons-qwik';
import { LogoBirdflop, LogoDiscord, LogoLuminescent, NumberInput, SelectMenuRaw, Toggle } from '@luminescent/ui-qwik';
import { generateHead } from '~/root';
import { routeLoader$ } from '@builder.io/qwik-city';
import { Bluemap } from '~/components/Bluemap';
import QuartzDev from '~/components/QuartzDev';
const Mineplace = '/branding/icon.svg';

type LeaderboardResponse = {
  data: LeaderboardData;
  success: boolean;
  timestamp: string;
}

type LeaderboardData = {
  leaderboard: LeaderboardEntry[];
  totalPlayers: number;
}

type LeaderboardEntry = {
  rank: number;
  uuid: string;
  username: string;
  totalActions: number;
  availableActions: number;
  maxActions: number;
  online: boolean;
  lastLogin: string;
};

type MapStore = {
  zoom: number;
  position: { x: number; y: number; z: number };
  viewMode: 'flat' | 'perspective' | 'free';
  players: {
    uuid: string;
    name: string;
    position: { x: number; y: number; z: number };
    rotation: { pitch: number; yaw: number; roll: number };
  }[];
  settings: Partial<{
    hiresDistance: number;
    lowresDistance: number;
    sunlightStrength: number;
    pauseTileLoading: boolean;
    invertMouse: boolean;
    mouseSensitivity: number;
    showChunkBorders: boolean;
    showDebug: boolean;
    superSampling: number;
  }>;
  sidebar: 'player' | 'settings' | 'leaderboard' | null;
}

export const viewModeOptions: {
  value: MapStore['viewMode'];
  label: string;
  icon: any;
  description: string;
}[] = [
  {
    value: 'flat',
    label: 'Flat View',
    icon: <Square />,
    description: 'The simple top-down view.\nScroll to zoom in and out.',
  },
  {
    value: 'perspective',
    label: 'Perspective View',
    icon: <Box />,
    description: '3d top-down perspective.\nUse the mouse and scroll to move around.',
  },
  {
    value: 'free',
    label: 'Free Flight',
    icon: <Rotate3D />,
    description: 'Move freely with a WASD and shift.\nScroll to control speed.',
  },
];

export const SocialButtons = component$(() =>
  <div class="flex flex-col lg:flex-row gap-2">
    <button class="lum-btn rounded-lum-2 w-full font-minecraft border-luminescent-500 border-2 hover:border-2 hover:lum-bg-luminescent-500 cursor-pointer">
      <Network size={24} />
      IP: play.mineplace.me
    </button>
    <div class="flex flex-1 justify-evenly gap-1 mt-2 lg:mt-0">
      <a class="lum-btn rounded-lum-2 p-2 lum-bg-transparent" href="https://discord.gg/nmgtX5z">
        <LogoDiscord size={24} />
      </a>
      <a class="lum-btn rounded-lum-2 p-2 lum-bg-transparent" href="https://github.com/LuminescentDev">
        <Github size={24} />
      </a>
      <a class="lum-btn rounded-lum-2 p-2 lum-bg-transparent" href="https://luminescent.dev">
        <LogoLuminescent size={24} />
      </a>
      <a class="lum-btn rounded-lum-2 p-2 lum-bg-transparent" href="https://birdflop.com">
        <LogoBirdflop size={24} />
      </a>
      <a class="lum-btn rounded-lum-2 p-2 lum-bg-transparent" href="https://quartzdev.gg">
        <QuartzDev width={24} height={24} class="min-w-6 min-h-6" />
      </a>
    </div>
  </div>,
);

export const useServerApi = routeLoader$(async () => {
  try {
    const url = 'https://api.mineplace.me/api/leaderboard';

    const headers = new Headers();
    headers.append('X-API-Key', 'abcd');

    const response = await fetch(url, { headers });
    if (!response.ok) {
      console.error('Failed to fetch leaderboard data:', response.statusText);
      throw new Error('Failed to fetch leaderboard data');
    }

    return response.json() as Promise<LeaderboardResponse>;
  } catch (error) {
    console.error('Failed to fetch leaderboard data:', error);
    return { data: { leaderboard: [], totalPlayers: 0 }, success: false, timestamp: new Date().toISOString() } as LeaderboardResponse;
  }
});

export const MapStoreContext = createContextId<MapStore>('map-store');
export default component$(() => {
  const closed = useSignal(false);
  const sidebarOpen = useSignal(false);
  const mapRef = useSignal<HTMLIFrameElement>();
  const leaderboard = useServerApi();
  const mapStore = useStore<MapStore>({
    zoom: 1,
    position: { x: 0, y: 0, z: 0 },
    viewMode: 'flat',
    settings: {
      sunlightStrength: 1,
    },
    players: [],
    sidebar: 'player',
  }, { deep: true });

  useContextProvider(MapStoreContext, mapStore);

  const setPosition = $((position: { x?: number; y?: number; z?: number }) => {
    mapStore.position = {
      ...mapStore.position,
      ...position,
    };
    mapRef.value?.contentWindow?.postMessage({ type: 'updatePosition', ...mapStore.position }, '*');
  });

  const setViewMode = $((mode: 'flat' | 'perspective' | 'free') => {
    mapStore.viewMode = mode;
    if (typeof window !== 'undefined') {
      const bridge = (window as any).BlueMapBridge;
      if (bridge) {
        try {
          const transition = 500;
          switch (mode) {
          case 'free':
            bridge.setFreeFlight?.(transition);
            break;
          case 'perspective':
            bridge.setPerspectiveView?.(transition);
            break;
          case 'flat':
            bridge.setFlatView?.(transition);
            break;
          }
        } catch (e) {
          console.warn('Failed to switch BlueMap view mode:', e);
        }
      } else {
        console.debug('BlueMapBridge not ready yet');
      }
    }
  });

  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(async () => {
    const syncFromBridge = () => {
      const bridge = (window as any).BlueMapBridge;
      if (!bridge || !bridge.getSettings) return;
      try {
        const s = bridge.getSettings();
        mapStore.settings.superSampling = s.superSampling;
        mapStore.settings.hiresDistance = s.hiresDistance;
        mapStore.settings.lowresDistance = s.lowresDistance;
        mapStore.settings.mouseSensitivity = s.mouseSensitivity;
        mapStore.settings.invertMouse = s.invertMouse;
        mapStore.settings.pauseTileLoading = s.pauseTileLoading;
        mapStore.settings.showChunkBorders = s.showChunkBorders;
        mapStore.settings.showDebug = s.showDebug;
        mapStore.settings.sunlightStrength = s.sunlightStrength;
      } catch (e) {
        console.warn('Failed syncing settings from BlueMapBridge:', e);
      }
    };

    window.addEventListener('bluemap:ready', syncFromBridge, { once: true });
    // If it's already loaded before this runs
    if ((window as any).BlueMapBridge?.getSettings) syncFromBridge();
    console.log('loaded');
    console.log('leaderboard info:', leaderboard.value);
    const players = await fetch('https://map.mineplace.me/maps/world/live/players.json');
    const playersData = await players.json();
    mapStore.players = playersData.players;
  });

  return <>
    <Bluemap class={{
      'fixed bottom-0 overflow-hidden w-lvw h-lvh object-cover': true,
      'opacity-50': !closed.value,
    }} />
    <div class={{
      'transition-all duration-300 flex items-center lg:justify-center min-h-screen': true,
      'opacity-0 pointer-events-none': closed.value,
    }}>
      <div class={{
        'lum-card p-16 max-h-auto justify-center w-full backdrop-blur-xl': true,
        'rounded-none min-h-screen bg-gray-900': true,
        'lg:rounded-lum lg:min-h-auto lg:animate-in lg:fade-in lg:slide-in-from-top-6 lg:anim-duration-1000 lg:w-auto lg:drop-shadow-xl bg-gray-900/80': true,
      }}>
        <button class="absolute top-10 right-10 lum-btn p-2 lum-bg-transparent">
          <X size={32} onClick$={() => {
            closed.value = !closed.value;
            void setViewMode('flat');
          }} />
        </button>
        <div class="flex gap-4 mb-6">
          <img src={Mineplace} width={86} height={86} />
          <h1 class="text-5xl font-bold">
            Mineplace
            <a class="text-lg flex items-center gap-1 mt-2 hover:underline font-normal" href="https://birdflop.com">
              <LogoBirdflop size={20} />Powered by Birdflop Hosting
            </a>
          </h1>
        </div>

        <p class="text-xl lg:text-4xl mb-6 font-minecraft">
          Now imagine if r/place was 3D.
        </p>

        <div class="text-xs lg:text-base">
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
        <SocialButtons />
      </div>
    </div>
    <div class={{
      'fixed flex flex-col lg:flex-row gap-2 w-full inset-2 pr-4 items-start justify-between pointer-events-none': true,
    }}>
      <div class="flex-1 flex w-full lg:w-auto flex-col gap-2 items-start">
        <button class={{
          'w-full lg:w-auto transition-all duration-400 hover:duration-400 lum-btn p-4 text-left flex-row items-center drop-shadow-xl backdrop-blur-lg cursor-pointer': true,
          '-mt-10 opacity-0': !closed.value,
          'pointer-events-auto': closed.value,
        }} onClick$={() => closed.value = !closed.value}>
          <Box size={48} />
          <h1 class="text-2xl font-bold">
            Mineplace
            <p class="text-base flex items-center gap-1 font-normal">
              <LogoBirdflop size={20} />Powered by Birdflop Hosting
            </p>
          </h1>
        </button>
        <div class={{
          'flex-1 h-full flex gap-1': true,
        }}>
          <div>
            <div class={{
              'lum-card transition-all duration-400 p-2 flex-col gap-1 drop-shadow-xl backdrop-blur-lg': true,
              'opacity-0': !closed.value,
              'pointer-events-auto': closed.value,
            }}>
              <button class={{
                'lum-btn p-2 rounded-lum-2': true,
                'lum-bg-transparent': mapStore.sidebar !== 'player' || !sidebarOpen.value,
              }} onClick$={() => {
                if (mapStore.sidebar == 'player' && sidebarOpen.value) return sidebarOpen.value = false;
                sidebarOpen.value = true;
                mapStore.sidebar = 'player';
              }}>
                <Users size={24} />
              </button>
              <button class={{
                'lum-btn p-2 rounded-lum-2': true,
                'lum-bg-transparent': mapStore.sidebar !== 'leaderboard' || !sidebarOpen.value,
              }} onClick$={() => {
                if (mapStore.sidebar == 'leaderboard' && sidebarOpen.value) return sidebarOpen.value = false;
                sidebarOpen.value = true;
                mapStore.sidebar = 'leaderboard';
              }}>
                <Trophy size={24} />
              </button>
              <button class={{
                'lum-btn p-2 rounded-lum-2': true,
                'lum-bg-transparent': mapStore.sidebar !== 'settings' || !sidebarOpen.value,
              }} onClick$={() => {
                if (mapStore.sidebar == 'settings' && sidebarOpen.value) return sidebarOpen.value = false;
                sidebarOpen.value = true;
                mapStore.sidebar = 'settings';
              }}>
                <Settings size={24} />
              </button>
              <hr class="my-2 border-lum-border/40" />
              <button onClick$={() => {
                mapStore.settings.sunlightStrength! += 0.1;
                if (mapStore.settings.sunlightStrength! > 1) mapStore.settings.sunlightStrength = 0;
                mapRef?.value?.contentWindow?.postMessage({
                  type: 'animateSunlightStrength',
                  targetValue: mapStore.settings.sunlightStrength,
                }, '*');
              }} class="lum-btn p-2 rounded-lum-2 lum-bg-transparent">
                <Sun size={24} />
              </button>
              <button onClick$={() => {
                if (typeof window !== 'undefined') {
                  const bridge = (window as any).BlueMapBridge;
                  bridge?.updateMap();
                }
              }} class="lum-btn p-2 rounded-lum-2 lum-bg-transparent">
                <RefreshCcw size={24} />
              </button>
            </div>
          </div>
          <div class={{
            'lum-card transition-all duration-300 p-4 flex-col gap-1 drop-shadow-xl backdrop-blur-lg -z-1': true,
            'opacity-0 -ml-[100%]': !closed.value || !sidebarOpen.value,
            'pointer-events-auto': closed.value,
            'min-w-68': sidebarOpen.value,
          }}>
            {mapStore.sidebar === 'player' &&
              <h2 class="text-2xl font-bold flex items-center gap-2 mb-2">
                <Users size={24} />
                Online Players: {mapStore.players.length}
              </h2>
            }
            {mapStore.sidebar === 'settings' &&
              <h2 class="text-2xl font-bold flex items-center gap-2 mb-2">
                <Settings size={24} />
                Settings
              </h2>
            }
            {mapStore.sidebar === 'leaderboard' &&
              <h2 class="text-2xl font-bold flex items-center gap-2 mb-2">
                <Trophy size={24} />
                Leaderboard {leaderboard.value?.data?.totalPlayers ? `(10/${leaderboard.value.data.totalPlayers} players)` : ''}
              </h2>
            }
            {mapStore.sidebar === 'player' && <>
              <div class="flex flex-col gap-2">
                {mapStore.players.map(player => (
                  <button key={player.uuid} class="lum-btn flex-row items-center text-left p-4 gap-4 rounded-lum-2 cursor-pointer"
                    onClick$={() => {
                      mapRef.value?.contentWindow?.postMessage({
                        type: 'teleportToPlayer',
                        playerId: player.uuid,
                      }, '*');
                    }}>
                    <div>
                      <img src={`https://mc-heads.net/head/${player.uuid}`} alt={player.name} class="rounded-lum-3" width={48} height={48} />
                    </div>
                    <div class="flex flex-col flex-1">
                      <span class="font-bold text-lg">
                        {player.name}
                      </span>
                      <span class="text-xs text-gray-500">
                        ({Math.round(player.position.x)}, {Math.round(player.position.y)}, {Math.round(player.position.z)})
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </>}
            {mapStore.sidebar === 'leaderboard' && <>
              <div class="flex flex-col gap-1">
                {leaderboard.value?.data?.leaderboard.map((entry: LeaderboardEntry) => (
                  <div key={entry.uuid} class="lum-btn-p-2 lum-card flex-row rounded-lum-2 justify-between">
                    <div class="flex items-center gap-2">
                      <span class="font-bold">{entry.rank}.</span>
                      <img src={`https://mc-heads.net/head/${entry.uuid}`} alt={entry.username} class="rounded-lum-3" width={24} height={24} />
                      <span class="font-bold">{entry.username}</span>
                    </div>
                    <span class="text-green-500">{entry.totalActions}</span>
                  </div>
                ))}
              </div>
            </>}
            {mapStore.sidebar === 'settings' && <>
              <div class="flex flex-col gap-2">
                <NumberInput id="hiresDistance" class={{ 'w-20': true }} input value={mapStore.settings.hiresDistance}
                  onIncrement$={() => {
                    if (mapStore.settings.hiresDistance != null) {
                      mapStore.settings.hiresDistance++;
                      (window as any).BlueMapBridge?.setHiresDistance(mapStore.settings.hiresDistance);
                    }
                  }}
                  onDecrement$={() => {
                    if (mapStore.settings.hiresDistance != null) {
                      mapStore.settings.hiresDistance--;
                      (window as any).BlueMapBridge?.setHiresDistance(mapStore.settings.hiresDistance);
                    }
                  }}>
                  <label class="text-sm">
                    High Resolution Render Distance
                  </label>
                </NumberInput>
                <NumberInput id="lowresDistance" class={{ 'w-20': true }} input value={mapStore.settings.lowresDistance}
                  onIncrement$={() => {
                    if (mapStore.settings.lowresDistance != null) {
                      mapStore.settings.lowresDistance++;
                      (window as any).BlueMapBridge?.setLowresDistance(mapStore.settings.lowresDistance);
                    }
                  }}
                  onDecrement$={() => {
                    if (mapStore.settings.lowresDistance != null) {
                      mapStore.settings.lowresDistance--;
                      (window as any).BlueMapBridge?.setLowresDistance(mapStore.settings.lowresDistance);
                    }
                  }}>
                  <label class="text-sm">
                    Low Resolution Render Distance
                  </label>
                </NumberInput>
                <NumberInput id="mouseSensitivity" class={{ 'w-20': true }} input value={mapStore.settings.mouseSensitivity}
                  onIncrement$={() => {
                    if (mapStore.settings.mouseSensitivity != null) {
                      mapStore.settings.mouseSensitivity++;
                      (window as any).BlueMapBridge?.setMouseSensitivity(mapStore.settings.mouseSensitivity);
                    }
                  }}
                  onDecrement$={() => {
                    if (mapStore.settings.mouseSensitivity != null) {
                      mapStore.settings.mouseSensitivity--;
                      (window as any).BlueMapBridge?.setMouseSensitivity(mapStore.settings.mouseSensitivity);
                    }
                  }}>
                  <label class="text-sm">
                    Mouse Sensitivity
                  </label>
                </NumberInput>
                <NumberInput id="superSampling" class={{ 'w-20': true }} input value={mapStore.settings.superSampling}
                  onIncrement$={() => {
                    if (mapStore.settings.superSampling != null) {
                      mapStore.settings.superSampling++;
                      (window as any).BlueMapBridge?.setSuperSampling(mapStore.settings.superSampling);
                    }
                  }}
                  onDecrement$={() => {
                    if (mapStore.settings.superSampling != null) {
                      mapStore.settings.superSampling--;
                      (window as any).BlueMapBridge?.setSuperSampling(mapStore.settings.superSampling);
                    }
                  }}>
                  <label class="text-sm">
                    Supersampling
                  </label>
                </NumberInput>
                <Toggle id="pauseTileLoading" checked={mapStore.settings.pauseTileLoading}
                  onChange$={(e, el) => {
                    mapStore.settings.pauseTileLoading = el.checked;
                    (window as any).BlueMapBridge?.setPauseTileLoading(el.checked);
                  }}>
                  Pause Tile Loading
                </Toggle>
                <Toggle id="invertMouse" checked={mapStore.settings.invertMouse}
                  onChange$={(e, el) => {
                    mapStore.settings.invertMouse = el.checked;
                    (window as any).BlueMapBridge?.setInvertMouse(el.checked);
                  }}>
                  Invert Mouse
                </Toggle>
                <Toggle id="showChunkBorders" checked={mapStore.settings.showChunkBorders}
                  onChange$={(e, el) => {
                    mapStore.settings.showChunkBorders = el.checked;
                    (window as any).BlueMapBridge?.setChunkBorders(el.checked);
                  }}>
                  Show Chunk Borders
                </Toggle>
                <Toggle id="showDebug" checked={mapStore.settings.showDebug}
                  onChange$={(e, el) => {
                    mapStore.settings.showDebug = el.checked;
                    (window as any).BlueMapBridge?.setDebug(el.checked);
                  }}>
                  Show Debug Info
                </Toggle>
              </div>
            </>}
          </div>
        </div>
      </div>
      <div class="flex-1 lg:hidden"></div>
      <div class="flex lg:flex-1 gap-2 justify-center w-full">
        <div class={{
          'flex flex-row items-center transition-all duration-400 lum-card p-2 drop-shadow-xl backdrop-blur-lg gap-2': true,
          '-mt-10 opacity-0': !closed.value,
          'pointer-events-auto': closed.value,
        }}>
          <label for="x" class="px-2 font-bold text-xl text-red-300">
            x
          </label>
          <input id="x" type="number" class="lum-input rounded-lum-2 w-20 text-center" value={mapStore.position.x}
            onInput$={(e, el) => {
              const value = parseFloat(el.value);
              if (isNaN(value)) return;
              void setPosition({ x: value });
            }} />
        </div>
        <div class={{
          'flex flex-row items-center transition-all duration-400 lum-card p-2 drop-shadow-xl backdrop-blur-lg gap-2': true,
          '-mt-10 opacity-0': !closed.value,
          'pointer-events-auto': closed.value,
        }}>
          <label for="x" class="px-2 font-bold text-xl text-green-300">
            y
          </label>
          <input id="y" type="number" class="lum-input rounded-lum-2 w-20 text-center" value={mapStore.position.y}
            onInput$={(e, el) => {
              const value = parseFloat(el.value);
              if (isNaN(value)) return;
              void setPosition({ y: value });
            }} />
        </div>
        <div class={{
          'flex flex-row items-center transition-all duration-400 lum-card p-2 drop-shadow-xl backdrop-blur-lg gap-2': true,
          '-mt-10 opacity-0': !closed.value,
          'pointer-events-auto': closed.value,
        }}>
          <label for="x" class="px-2 font-bold text-xl text-blue-300">
            z
          </label>
          <input id="z" type="number" class="lum-input rounded-lum-2 w-20 text-center" value={mapStore.position.z}
            onInput$={(e, el) => {
              const value = parseFloat(el.value);
              if (isNaN(value)) return;
              void setPosition({ z: value });
            }} />
        </div>
      </div>
      <div class="flex w-full lg:w-auto lg:flex-1 gap-2 justify-end items-start">
        <div class={{
          'flex w-full lg:w-auto flex-col gap-2 items-end': true,
          'pointer-events-auto': closed.value,
        }}>
          <div class={{
            'flex w-full transition-all duration-400 lum-card p-2 drop-shadow-xl backdrop-blur-lg gap-1': true,
            '-mt-10 opacity-0': !closed.value,
          }}>
            <SocialButtons />
          </div>
          <SelectMenuRaw align='right' class={{
            'hidden lg:flex transition-all duration-400 drop-shadow-xl backdrop-blur-lg gap-1': true,
            'opacity-0': !closed.value,
          }} value={mapStore.viewMode} customDropdown>
            {viewModeOptions.map(({ value, ...option }) => {
              const innerContent = <>
                <div
                  class={'h-8 w-8 rounded-full flex items-center justify-center'}
                >
                  {option.icon}
                </div>
                <div class="flex-1">
                  <div class="text-sm font-medium">
                    {option.label}
                  </div>
                  <div class="text-xs whitespace-pre-wrap">
                    {option.description}
                  </div>
                </div>
              </>;

              if (mapStore.viewMode == value) {
                return <div q:slot={'dropdown'} key={value}
                  class="flex items-center gap-2 text-left">
                  {innerContent}
                </div>;
              }
              else {
                return <button q:slot={'extra-buttons'} key={value}
                  class="lum-btn text-left rounded-lum-1 lum-bg-transparent"
                  onClick$={() => void setViewMode(value)}>
                  {innerContent}
                </button>;
              }
            })}
          </SelectMenuRaw>
        </div>
      </div>
    </div>
  </>;
});

export const head = generateHead({});
