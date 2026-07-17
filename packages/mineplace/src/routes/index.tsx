import {
  $,
  component$,
  createContextId,
  useContextProvider,
  useSignal,
  useStore,
  useVisibleTask$,
} from '@qwik.dev/core';

import Box from 'lucide-icons-qwik/icons/Box';
import Map from 'lucide-icons-qwik/icons/Map';
import Network from 'lucide-icons-qwik/icons/Network';
import RefreshCcw from 'lucide-icons-qwik/icons/RefreshCcw';
import Rotate3D from 'lucide-icons-qwik/icons/Rotate3D';
import Scale from 'lucide-icons-qwik/icons/Scale';
import Settings from 'lucide-icons-qwik/icons/Settings';
import Square from 'lucide-icons-qwik/icons/Square';
import Sun from 'lucide-icons-qwik/icons/Sun';
import Trophy from 'lucide-icons-qwik/icons/Trophy';
import Users from 'lucide-icons-qwik/icons/Users';

import SiDiscord from 'simple-icons-qwik/icons/SiDiscord';
import SiGithub from 'simple-icons-qwik/icons/SiGithub';

import { Luminescent, Birdflop } from '@luminescent/icons-qwik';
import { Label, NumberInput, SelectMenu, Toggle } from '@luminescent/ui-qwik';
import { generateHead } from '~/root';
import { routeLoader$ } from '@qwik.dev/router';
import { Bluemap } from '~/components/Bluemap';
import QuartzDev from '~/components/QuartzDev';
import Accordion from '~/components/Accordion';
const Mineplace = '/branding/icon.svg';

type LeaderboardResponse = {
  data: LeaderboardData;
  success: boolean;
  timestamp: string;
};

type LeaderboardData = {
  leaderboard: LeaderboardEntry[];
  totalPlayers: number;
};

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
};

export const viewModeOptions = {
  flat: {
    name: 'Flat View',
    icon: Square,
    description: 'The simple top-down view.\nScroll to zoom in and out.',
  },
  perspective: {
    name: 'Perspective View',
    icon: Box,
    description:
      '3d top-down perspective.\nUse the mouse and scroll to move around.',
  },
  free: {
    name: 'Free Flight',
    icon: Rotate3D,
    description: 'Move freely with a WASD and shift.\nScroll to control speed.',
  },
};

export const SocialButtons = component$(() => (
  <div class="flex flex-col gap-2 sm:flex-row">
    <div class="group relative">
      <p class="lum-btn rounded-lum-2 font-minecraft pointer-events-none absolute -top-10 left-1/2 -translate-x-1/2 text-xs whitespace-nowrap opacity-0 transition-opacity group-hover:opacity-100">
        Bedrock Port: 19132
      </p>
      <button class="lum-btn rounded-lum-2 font-minecraft hover:lum-bg-gray-500 w-full cursor-pointer border-2 border-gray-500 hover:border-2">
        <Network size={20} />
        IP: play.mineplace.me
      </button>
    </div>
    <div class="mt-2 flex flex-1 justify-evenly gap-1 lg:mt-0">
      <a
        class="lum-btn rounded-lum-2 lum-bg-transparent fill-current p-2"
        href="https://discord.gg/nmgtX5z"
      >
        <SiDiscord size={24} />
      </a>
      <a
        class="lum-btn rounded-lum-2 lum-bg-transparent fill-current p-2"
        href="https://github.com/LuminescentDev"
      >
        <SiGithub size={24} />
      </a>
      <a
        class="lum-btn rounded-lum-2 lum-bg-transparent p-2"
        href="https://luminescent.dev"
      >
        <Luminescent size={24} />
      </a>
      <a
        class="lum-btn rounded-lum-2 lum-bg-transparent p-2"
        href="https://birdflop.com"
      >
        <Birdflop size={24} />
      </a>
      <a
        class="lum-btn rounded-lum-2 lum-bg-transparent p-2"
        href="https://quartzdev.gg"
      >
        <QuartzDev width={24} height={24} class="min-h-6 min-w-6" />
      </a>
    </div>
  </div>
));

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
    return {
      data: { leaderboard: [], totalPlayers: 0 },
      success: false,
      timestamp: new Date().toISOString(),
    };
  }
});

export const MapStoreContext = createContextId<MapStore>('map-store');
export default component$(() => {
  const closed = useSignal(false);
  const sidebarOpen = useSignal(false);
  const mapRef = useSignal<HTMLIFrameElement>();
  const leaderboard = useServerApi();
  const mapStore = useStore<MapStore>(
    {
      zoom: 1,
      position: { x: 0, y: 0, z: 0 },
      viewMode: 'flat',
      settings: {
        sunlightStrength: 1,
      },
      players: [],
      sidebar: 'player',
    },
    { deep: true }
  );

  useContextProvider(MapStoreContext, mapStore);

  const setPosition = $((position: { x?: number; y?: number; z?: number }) => {
    mapStore.position = {
      ...mapStore.position,
      ...position,
    };
    mapRef.value?.contentWindow?.postMessage(
      { type: 'updatePosition', ...mapStore.position },
      '*'
    );
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

  // oxlint-disable-next-line qwik/no-use-visible-task
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

    try {
      const players = await fetch(
        'https://map.mineplace.me/maps/world/live/players.json'
      );
      const playersData = await players.json();
      mapStore.players = playersData.players;
    } catch (error) {
      console.error('Error fetching player data:', error);
    }
  });

  const CurrentViewMode = viewModeOptions[mapStore.viewMode];

  return (
    <>
      <Bluemap
        class={{
          'fixed bottom-0 h-lvh w-lvw overflow-hidden object-cover': true,
          'opacity-50': !closed.value,
        }}
      />
      <div
        class={{
          'flex min-h-screen items-center transition-all duration-300 lg:justify-center': true,
          'pointer-events-none opacity-0': closed.value,
        }}
      >
        <div
          class={{
            'lum-card lum-grad-bg-gray-900 max-h-auto w-full justify-center p-16 backdrop-blur-xl': true,
            'min-h-screen rounded-none': true,
            'lg:rounded-lum lg:animate-in lg:fade-in lg:slide-in-from-top-6 lg:anim-duration-1000 lg:lum-grad-bg-gray-900/80 lg:min-h-auto lg:w-auto lg:drop-shadow-xl': true,
          }}
        >
          <div class="mb-6 flex flex-col items-center gap-4 lg:flex-row">
            <img
              src={Mineplace}
              width={88}
              height={88}
              class="h-50 w-50 lg:h-22 lg:w-22"
              alt="Mineplace Logo"
            />
            <div class="flex flex-col items-center gap-1 lg:items-start">
              <h1 class="flex-1 text-5xl font-bold">Mineplace</h1>
              <a
                class="text-lum-text-secondary mt-2 flex items-center gap-1 text-lg font-normal hover:underline"
                href="https://birdflop.com"
              >
                <Birdflop size={20} />
                Powered by Birdflop Hosting
              </a>
            </div>
            <p class="font-minecraft text-right text-3xl">
              From pixels
              <br />
              <span
                style="background: linear-gradient(to bottom right, rgb(84, 218, 244), rgb(84, 94, 182)) padding-box text;"
                class="bg-clip-text text-transparent"
              >
                to worlds.
              </span>
            </p>
          </div>

          <div class="mx-auto flex max-w-xl flex-col gap-1">
            <p class="mb-2 flex items-center gap-2 text-xl font-bold">
              <Scale />
              Rules
            </p>
            <Accordion class="lum-bg-transparent rounded-lum-2 w-full">
              <span q:slot="label">1. Inappropriate content</span>
              <p>
                The following content is not allowed and may result in a ban:
              </p>
              <ul class="text-lum-text-secondary list-inside list-disc">
                <li>
                  Explicit sexual content (genitalia, sexual acts, sexual
                  fluids)
                </li>
                <li>
                  Sexualization of minors or fictitious characters with
                  child-like visual traits, regardless of their fictional age or
                  lore
                </li>
                <li>Hate speech, extreme slurs, symbols of hate</li>
                <li>Doxxing or sharing of personal information of others</li>
              </ul>
            </Accordion>
            <Accordion class="lum-bg-transparent rounded-lum-2 w-full">
              <span q:slot="label">2. Griefing</span>
              <p>
                Griefing or any form of harassment towards other players is
                strictly prohibited. for example:
              </p>
              <ul class="text-lum-text-secondary list-inside list-disc">
                <li>Destruction of other players' builds</li>
                <li>Placing blocks that obstruct other players' builds</li>
              </ul>
            </Accordion>
            <Accordion class="lum-bg-transparent rounded-lum-2 w-full">
              <span q:slot="label">3. Automation</span>
              <p>
                The use of bots, macros, or any form of client-side automation
                is prohibited. This includes:
              </p>
              <ul class="text-lum-text-secondary list-inside list-disc">
                <li>Alt accounts</li>
                <li>Baritone</li>
                <li>Mineflayer</li>
              </ul>
              <p>
                Mods such as Litematica that are used for outlining builds are
                allowed.
              </p>
            </Accordion>
          </div>

          <button
            class="lum-btn lum-btn-p-4 rounded-lum-2 lum-grad-bg-gray-500 hover:lum-grad-bg-gray-400 mx-auto my-6"
            onClick$={() => {
              closed.value = !closed.value;
              void setViewMode('flat');
            }}
          >
            <Map size={24} />
            Open Map
          </button>

          <p class="text-lum-text-secondary">
            Mineplace supports both Java and Bedrock Edition!
          </p>
          <SocialButtons />
        </div>
      </div>
      <div
        class={{
          'pointer-events-none fixed inset-2 flex w-full flex-col items-start justify-between gap-2 pr-4 sm:flex-row': true,
        }}
      >
        <div class="flex w-full flex-1 flex-col items-start gap-2 lg:w-auto">
          <button
            class={{
              'lum-btn w-full cursor-pointer flex-row items-center p-4 text-left drop-shadow-xl backdrop-blur-lg transition-all duration-400 hover:duration-400 lg:w-auto': true,
              '-mt-10 opacity-0': !closed.value,
              'pointer-events-auto': closed.value,
            }}
            onClick$={() => (closed.value = !closed.value)}
          >
            <img src={Mineplace} width={48} height={48} alt="Mineplace Logo" />
            <span class="text-2xl font-bold">
              Mineplace
              <span class="flex items-center gap-1 text-base font-normal">
                <Birdflop size={20} />
                Powered by Birdflop Hosting
              </span>
            </span>
          </button>
          <div
            class={{
              'flex h-full flex-1 gap-1': true,
            }}
          >
            <div>
              <div
                class={{
                  'lum-card flex-col gap-1 p-2 drop-shadow-xl backdrop-blur-lg transition-all duration-400': true,
                  'opacity-0': !closed.value,
                  'pointer-events-auto': closed.value,
                }}
              >
                <button
                  class={{
                    'lum-btn rounded-lum-2 p-2': true,
                    'lum-bg-transparent':
                      mapStore.sidebar !== 'player' || !sidebarOpen.value,
                  }}
                  onClick$={() => {
                    if (mapStore.sidebar == 'player' && sidebarOpen.value)
                      return (sidebarOpen.value = false);
                    sidebarOpen.value = true;
                    mapStore.sidebar = 'player';
                  }}
                >
                  <Users size={24} />
                </button>
                <button
                  class={{
                    'lum-btn rounded-lum-2 p-2': true,
                    'lum-bg-transparent':
                      mapStore.sidebar !== 'leaderboard' || !sidebarOpen.value,
                  }}
                  onClick$={() => {
                    if (mapStore.sidebar == 'leaderboard' && sidebarOpen.value)
                      return (sidebarOpen.value = false);
                    sidebarOpen.value = true;
                    mapStore.sidebar = 'leaderboard';
                  }}
                >
                  <Trophy size={24} />
                </button>
                <button
                  class={{
                    'lum-btn rounded-lum-2 p-2': true,
                    'lum-bg-transparent':
                      mapStore.sidebar !== 'settings' || !sidebarOpen.value,
                  }}
                  onClick$={() => {
                    if (mapStore.sidebar == 'settings' && sidebarOpen.value)
                      return (sidebarOpen.value = false);
                    sidebarOpen.value = true;
                    mapStore.sidebar = 'settings';
                  }}
                >
                  <Settings size={24} />
                </button>
                <hr class="border-lum-border/40 my-2" />
                <button
                  onClick$={() => {
                    mapStore.settings.sunlightStrength! += 0.1;
                    if (mapStore.settings.sunlightStrength! > 1)
                      mapStore.settings.sunlightStrength = 0;
                    mapRef?.value?.contentWindow?.postMessage(
                      {
                        type: 'animateSunlightStrength',
                        targetValue: mapStore.settings.sunlightStrength,
                      },
                      '*'
                    );
                  }}
                  class="lum-btn rounded-lum-2 lum-bg-transparent p-2"
                >
                  <Sun size={24} />
                </button>
                <button
                  onClick$={() => {
                    if (typeof window !== 'undefined') {
                      const bridge = (window as any).BlueMapBridge;
                      bridge?.updateMap();
                    }
                  }}
                  class="lum-btn rounded-lum-2 lum-bg-transparent p-2"
                >
                  <RefreshCcw size={24} />
                </button>
              </div>
            </div>
            <div
              class={{
                'lum-card -z-1 flex-col gap-1 p-4 drop-shadow-xl backdrop-blur-lg transition-all duration-300': true,
                'ml-[-100%] opacity-0': !closed.value || !sidebarOpen.value,
                'pointer-events-auto': closed.value,
                'min-w-68': sidebarOpen.value,
              }}
            >
              {mapStore.sidebar === 'player' && (
                <h2 class="mb-2 flex items-center gap-2 text-2xl font-bold">
                  <Users size={24} />
                  Online Players: {mapStore.players.length}
                </h2>
              )}
              {mapStore.sidebar === 'settings' && (
                <h2 class="mb-2 flex items-center gap-2 text-2xl font-bold">
                  <Settings size={24} />
                  Settings
                </h2>
              )}
              {mapStore.sidebar === 'leaderboard' && (
                <h2 class="mb-2 flex items-center gap-2 text-2xl font-bold">
                  <Trophy size={24} />
                  Leaderboard{' '}
                  {leaderboard.value?.data?.totalPlayers
                    ? `(10/${leaderboard.value.data.totalPlayers} players)`
                    : ''}
                </h2>
              )}
              {mapStore.sidebar === 'player' && (
                <>
                  <div class="flex flex-col gap-2">
                    {mapStore.players.map((player) => (
                      <button
                        key={player.uuid}
                        class="lum-btn rounded-lum-2 cursor-pointer flex-row items-center gap-4 p-4 text-left"
                        onClick$={() => {
                          mapRef.value?.contentWindow?.postMessage(
                            {
                              type: 'teleportToPlayer',
                              playerId: player.uuid,
                            },
                            '*'
                          );
                        }}
                      >
                        <span>
                          <img
                            src={`https://mc-heads.net/head/${player.uuid}`}
                            alt={player.name}
                            class="rounded-lum-3"
                            width={48}
                            height={48}
                          />
                        </span>
                        <span class="flex flex-1 flex-col">
                          <span class="text-lg font-bold">{player.name}</span>
                          <span class="text-xs text-gray-500">
                            ({Math.round(player.position.x)},{' '}
                            {Math.round(player.position.y)},{' '}
                            {Math.round(player.position.z)})
                          </span>
                        </span>
                      </button>
                    ))}
                  </div>
                </>
              )}
              {mapStore.sidebar === 'leaderboard' && (
                <>
                  <div class="flex flex-col gap-1">
                    {leaderboard.value?.data?.leaderboard.map(
                      (entry: LeaderboardEntry) => (
                        <div
                          key={entry.uuid}
                          class="lum-btn-p-2 lum-card rounded-lum-2 flex-row justify-between"
                        >
                          <div class="flex items-center gap-2">
                            <span class="font-bold">{entry.rank}.</span>
                            <img
                              src={`https://mc-heads.net/head/${entry.uuid}`}
                              alt={entry.username}
                              class="rounded-lum-3"
                              width={24}
                              height={24}
                            />
                            <span class="font-bold">{entry.username}</span>
                          </div>
                          <span class="text-green-500">
                            {entry.totalActions}
                          </span>
                        </div>
                      )
                    )}
                  </div>
                </>
              )}
              {mapStore.sidebar === 'settings' && (
                <>
                  <div class="flex flex-col gap-2">
                    <Label label="High Resolution Render Distance">
                      <NumberInput
                        id="hiresDistance"
                        class={{ 'w-20': true }}
                        input
                        value={mapStore.settings.hiresDistance}
                        onIncrement$={() => {
                          if (mapStore.settings.hiresDistance != null) {
                            mapStore.settings.hiresDistance++;
                            (window as any).BlueMapBridge?.setHiresDistance(
                              mapStore.settings.hiresDistance
                            );
                          }
                        }}
                        onDecrement$={() => {
                          if (mapStore.settings.hiresDistance != null) {
                            mapStore.settings.hiresDistance--;
                            (window as any).BlueMapBridge?.setHiresDistance(
                              mapStore.settings.hiresDistance
                            );
                          }
                        }}
                      />
                    </Label>
                    <Label label="Low Resolution Render Distance">
                      <NumberInput
                        id="lowresDistance"
                        class={{ 'w-20': true }}
                        input
                        value={mapStore.settings.lowresDistance}
                        onIncrement$={() => {
                          if (mapStore.settings.lowresDistance != null) {
                            mapStore.settings.lowresDistance++;
                            (window as any).BlueMapBridge?.setLowresDistance(
                              mapStore.settings.lowresDistance
                            );
                          }
                        }}
                        onDecrement$={() => {
                          if (mapStore.settings.lowresDistance != null) {
                            mapStore.settings.lowresDistance--;
                            (window as any).BlueMapBridge?.setLowresDistance(
                              mapStore.settings.lowresDistance
                            );
                          }
                        }}
                      />
                    </Label>
                    <Label label="Mouse Sensitivity">
                      <NumberInput
                        id="mouseSensitivity"
                        class={{ 'w-20': true }}
                        input
                        value={mapStore.settings.mouseSensitivity}
                        onIncrement$={() => {
                          if (mapStore.settings.mouseSensitivity != null) {
                            mapStore.settings.mouseSensitivity++;
                            (window as any).BlueMapBridge?.setMouseSensitivity(
                              mapStore.settings.mouseSensitivity
                            );
                          }
                        }}
                        onDecrement$={() => {
                          if (mapStore.settings.mouseSensitivity != null) {
                            mapStore.settings.mouseSensitivity--;
                            (window as any).BlueMapBridge?.setMouseSensitivity(
                              mapStore.settings.mouseSensitivity
                            );
                          }
                        }}
                      />
                    </Label>
                    <Label label="Supersampling">
                      <NumberInput
                        id="superSampling"
                        class={{ 'w-20': true }}
                        input
                        value={mapStore.settings.superSampling}
                        onIncrement$={() => {
                          if (mapStore.settings.superSampling != null) {
                            mapStore.settings.superSampling++;
                            (window as any).BlueMapBridge?.setSuperSampling(
                              mapStore.settings.superSampling
                            );
                          }
                        }}
                        onDecrement$={() => {
                          if (mapStore.settings.superSampling != null) {
                            mapStore.settings.superSampling--;
                            (window as any).BlueMapBridge?.setSuperSampling(
                              mapStore.settings.superSampling
                            );
                          }
                        }}
                      />
                    </Label>
                    <Toggle
                      id="pauseTileLoading"
                      checked={mapStore.settings.pauseTileLoading}
                      onChange$={(e, el) => {
                        mapStore.settings.pauseTileLoading = el.checked;
                        (window as any).BlueMapBridge?.setPauseTileLoading(
                          el.checked
                        );
                      }}
                    >
                      Pause Tile Loading
                    </Toggle>
                    <Toggle
                      id="invertMouse"
                      checked={mapStore.settings.invertMouse}
                      onChange$={(e, el) => {
                        mapStore.settings.invertMouse = el.checked;
                        (window as any).BlueMapBridge?.setInvertMouse(
                          el.checked
                        );
                      }}
                    >
                      Invert Mouse
                    </Toggle>
                    <Toggle
                      id="showChunkBorders"
                      checked={mapStore.settings.showChunkBorders}
                      onChange$={(e, el) => {
                        mapStore.settings.showChunkBorders = el.checked;
                        (window as any).BlueMapBridge?.setChunkBorders(
                          el.checked
                        );
                      }}
                    >
                      Show Chunk Borders
                    </Toggle>
                    <Toggle
                      id="showDebug"
                      checked={mapStore.settings.showDebug}
                      onChange$={(e, el) => {
                        mapStore.settings.showDebug = el.checked;
                        (window as any).BlueMapBridge?.setDebug(el.checked);
                      }}
                    >
                      Show Debug Info
                    </Toggle>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
        <div class="flex-1 lg:hidden"></div>
        <div class="flex w-full justify-center gap-2 lg:flex-1">
          <div
            class={{
              'lum-card flex flex-row items-center gap-2 p-2 drop-shadow-xl backdrop-blur-lg transition-all duration-400': true,
              '-mt-10 opacity-0': !closed.value,
              'pointer-events-auto': closed.value,
            }}
          >
            <label for="x" class="pr-2 pl-3 text-xl font-bold text-red-300">
              x
            </label>
            <input
              id="x"
              type="number"
              class="lum-input rounded-lum-2 w-20 text-center"
              value={mapStore.position.x}
              onInput$={(e, el) => {
                const value = parseFloat(el.value);
                if (isNaN(value)) return;
                void setPosition({ x: value });
              }}
            />
          </div>
          <div
            class={{
              'lum-card flex flex-row items-center gap-2 p-2 drop-shadow-xl backdrop-blur-lg transition-all duration-400': true,
              '-mt-10 opacity-0': !closed.value,
              'pointer-events-auto': closed.value,
            }}
          >
            <label for="y" class="pr-2 pl-3 text-xl font-bold text-green-300">
              y
            </label>
            <input
              id="y"
              type="number"
              class="lum-input rounded-lum-2 w-20 text-center"
              value={mapStore.position.y}
              onInput$={(e, el) => {
                const value = parseFloat(el.value);
                if (isNaN(value)) return;
                void setPosition({ y: value });
              }}
            />
          </div>
          <div
            class={{
              'lum-card flex flex-row items-center gap-2 p-2 drop-shadow-xl backdrop-blur-lg transition-all duration-400': true,
              '-mt-10 opacity-0': !closed.value,
              'pointer-events-auto': closed.value,
            }}
          >
            <label for="z" class="pr-2 pl-3 text-xl font-bold text-blue-300">
              z
            </label>
            <input
              id="z"
              type="number"
              class="lum-input rounded-lum-2 w-20 text-center"
              value={mapStore.position.z}
              onInput$={(e, el) => {
                const value = parseFloat(el.value);
                if (isNaN(value)) return;
                void setPosition({ z: value });
              }}
            />
          </div>
        </div>
        <div class="flex w-full items-start justify-end gap-2 lg:w-auto lg:flex-1">
          <div
            class={{
              'flex w-full flex-col items-end gap-2 lg:w-auto': true,
              'pointer-events-auto': closed.value,
            }}
          >
            <div
              class={{
                'lum-card flex w-full gap-1 p-2 drop-shadow-xl backdrop-blur-lg transition-all duration-400': true,
                '-mt-10 opacity-0': !closed.value,
              }}
            >
              <SocialButtons />
            </div>
            <SelectMenu
              align="right"
              class={{
                'hidden gap-1 drop-shadow-xl backdrop-blur-lg transition-all duration-400 lg:flex': true,
                'opacity-0': !closed.value,
              }}
              values={Object.entries(viewModeOptions).map(([key, option]) => ({
                name: option.name,
                value: key,
              }))}
              value={mapStore.viewMode}
              onChange$={(e, el) =>
                void setViewMode(el.value as 'flat' | 'perspective' | 'free')
              }
            >
              <CurrentViewMode.icon q:slot="dropdown-before" />
              {Object.entries(viewModeOptions).map(([key, option]) => (
                <option.icon key={key} q:slot={`before-${key}`} />
              ))}
              {Object.entries(viewModeOptions).map(([key, option]) => (
                <span
                  key={key}
                  q:slot={`after-${key}`}
                  class="text-lum-text-secondary text-sm"
                >
                  {option.description}
                </span>
              ))}
            </SelectMenu>
          </div>
        </div>
      </div>
    </>
  );
});

export const head = generateHead({});
