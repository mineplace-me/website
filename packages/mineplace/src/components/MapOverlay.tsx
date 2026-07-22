import { component$, Signal, QRL } from '@qwik.dev/core';
import { Birdflop } from '@luminescent/icons-qwik';
import Users from 'lucide-icons-qwik/icons/Users';
import Trophy from 'lucide-icons-qwik/icons/Trophy';
import Settings from 'lucide-icons-qwik/icons/Settings';
import Sun from 'lucide-icons-qwik/icons/Sun';
import RefreshCcw from 'lucide-icons-qwik/icons/RefreshCcw';
import { Label, NumberInput, Toggle, SelectMenu } from '@luminescent/ui-qwik';
import type { MapStore, LeaderboardResponse, LeaderboardEntry } from '~/types';
import { SocialButtons } from './HeroSection';

const Mineplace = '/branding/icon.svg';

export type MapOverlayProps = {
  closed: Signal<boolean>;
  sidebarOpen: Signal<boolean>;
  mapStore: MapStore;
  mapRef: Signal<HTMLIFrameElement | undefined>;
  leaderboard: { value: LeaderboardResponse | undefined };
  setPosition: QRL<(pos: { x?: number; y?: number; z?: number }) => void>;
  setViewMode: QRL<(mode: 'flat' | 'perspective' | 'free') => void>;
  viewModeOptions: Record<string, any>;
  CurrentViewMode: any;
};

export const MapOverlay = component$<MapOverlayProps>(
  ({
    closed,
    sidebarOpen,
    mapStore,
    mapRef,
    leaderboard,
    setPosition,
    setViewMode,
    viewModeOptions,
    CurrentViewMode,
  }) => {
    return (
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
              )}
              {mapStore.sidebar === 'leaderboard' && (
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
                        <span class="text-green-500">{entry.totalActions}</span>
                      </div>
                    )
                  )}
                </div>
              )}
              {mapStore.sidebar === 'settings' && (
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
                      (window as any).BlueMapBridge?.setInvertMouse(el.checked);
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
        <div class="flex-1 lg:hidden"></div>
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
              values={Object.entries(viewModeOptions).map(
                ([key, option]: [string, any]) => ({
                  name: option.name,
                  value: key,
                })
              )}
              value={mapStore.viewMode}
              onChange$={(e, el) =>
                void setViewMode(el.value as 'flat' | 'perspective' | 'free')
              }
            >
              <CurrentViewMode.icon q:slot="dropdown-before" />
              {Object.entries(viewModeOptions).map(
                ([key, option]: [string, any]) => (
                  <option.icon key={key} q:slot={`before-${key}`} />
                )
              )}
              {Object.entries(viewModeOptions).map(
                ([key, option]: [string, any]) => (
                  <span
                    key={key}
                    q:slot={`after-${key}`}
                    class="text-lum-text-secondary text-sm"
                  >
                    {option.description}
                  </span>
                )
              )}
            </SelectMenu>
          </div>
        </div>
      </div>
    );
  }
);
