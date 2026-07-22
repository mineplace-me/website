import {
  $,
  component$,
  createContextId,
  useContextProvider,
  useSignal,
  useStore,
  useVisibleTask$,
} from '@qwik.dev/core';
import { routeLoader$, routeAction$, z, zod$ } from '@qwik.dev/router';
import Box from 'lucide-icons-qwik/icons/Box';
import Square from 'lucide-icons-qwik/icons/Square';
import Rotate3D from 'lucide-icons-qwik/icons/Rotate3D';

import { generateHead } from '~/root';
import { Bluemap } from '~/components/Bluemap';
import { HeroSection } from '~/components/HeroSection';
import { MapOverlay } from '~/components/MapOverlay';
import { StoreModal, packages } from '~/components/StoreModal';
import type { MapStore, LeaderboardResponse } from '~/types';

export const viewModeOptions: Record<string, any> = {
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

export const useCheckout = routeAction$(
  async (data, { env }) => {
    const { username, packageId } = data;
    const TEBEX_KEY = env.get('TEBEX_HEADLESS_KEY');
    const pkg = packages.find((p) => p.id === packageId);

    if (!pkg) {
      return { success: false, message: 'Invalid package selected.' };
    }

    if (!TEBEX_KEY) {
      console.warn(
        'TEBEX_HEADLESS_KEY is not set. Simulating checkout for',
        username,
        pkg.name
      );
      return {
        success: false,
        message: 'The store is currently offline.',
      };
    }

    try {
      const basketRes = await fetch('https://headless.tebex.io/api/baskets', {
        method: 'POST',
        headers: {
          'X-Tebex-Secret': TEBEX_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          complete_url: 'https://mineplace.me/store/success',
          cancel_url: 'https://mineplace.me/store',
          custom: { username },
        }),
      });

      if (!basketRes.ok) throw new Error('Failed to create basket');
      const basket = await basketRes.json();

      const addPackageRes = await fetch(
        `https://headless.tebex.io/api/baskets/${basket.data.ident}/packages`,
        {
          method: 'POST',
          headers: {
            'X-Tebex-Secret': TEBEX_KEY,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            package_id: packageId,
            quantity: 1,
          }),
        }
      );

      if (!addPackageRes.ok) throw new Error('Failed to add package to basket');

      return {
        success: true,
        checkoutUrl: basket.data.links.checkout,
      };
    } catch (err: any) {
      console.error('Checkout error:', err);
      return {
        success: false,
        message: err.message || 'An error occurred during checkout.',
      };
    }
  },
  zod$({
    username: z
      .string()
      .min(3, 'Minecraft username must be at least 3 characters')
      .max(16, 'Minecraft username cannot exceed 16 characters'),
    packageId: z.string().min(1, 'Please select a package'),
  })
);

export const MapStoreContext = createContextId<MapStore>('map-store');

export default component$(() => {
  const closed = useSignal(false);
  const storeModalOpen = useSignal(false);
  const sidebarOpen = useSignal(false);
  const mapRef = useSignal<HTMLIFrameElement>();
  const leaderboard = useServerApi();
  const checkoutAction = useCheckout();

  // Store modal form signals
  const username = useSignal('');
  const isSubmitting = useSignal(false);
  const selectedPackageId = useSignal<string | null>(null);

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

      <HeroSection
        closed={closed}
        storeModalOpen={storeModalOpen}
        setViewMode={setViewMode}
      />

      <MapOverlay
        closed={closed}
        sidebarOpen={sidebarOpen}
        mapStore={mapStore}
        mapRef={mapRef}
        leaderboard={leaderboard}
        setPosition={setPosition}
        setViewMode={setViewMode}
        viewModeOptions={viewModeOptions}
        CurrentViewMode={CurrentViewMode}
      />

      <StoreModal
        isOpen={storeModalOpen}
        username={username}
        isSubmitting={isSubmitting}
        selectedPackageId={selectedPackageId}
        checkoutAction={checkoutAction}
      />
    </>
  );
});

export const head = generateHead({});
