import {
  component$,
  Signal,
  type QRL,
  useSignal,
  useVisibleTask$,
} from '@qwik.dev/core';
import Network from 'lucide-icons-qwik/icons/Network';
import Scale from 'lucide-icons-qwik/icons/Scale';
import Map from 'lucide-icons-qwik/icons/Map';
import ShoppingCart from 'lucide-icons-qwik/icons/ShoppingCart';
import SiDiscord from 'simple-icons-qwik/icons/SiDiscord';
import SiGithub from 'simple-icons-qwik/icons/SiGithub';
import { Luminescent, Birdflop } from '@luminescent/icons-qwik';
import QuartzDev from '~/components/QuartzDev';
import Accordion from '~/components/Accordion';

const Mineplace = '/branding/icon.svg';

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

export type HeroSectionProps = {
  closed: Signal<boolean>;
  storeModalOpen: Signal<boolean>;
  setViewMode: QRL<(mode: 'flat' | 'perspective' | 'free') => void>;
};

export const HeroSection = component$<HeroSectionProps>(
  ({ closed, storeModalOpen, setViewMode }) => {
    const dialogRef = useSignal<HTMLDialogElement>();
    const isVisible = useSignal(false);

    useVisibleTask$(({ track, cleanup }) => {
      const isClosed = track(() => closed.value);
      const open = !isClosed;

      if (open) {
        if (!dialogRef.value?.open) dialogRef.value?.showModal();
        requestAnimationFrame(() => {
          isVisible.value = true;
        });
      } else {
        isVisible.value = false;
        setTimeout(() => {
          if (closed.value) dialogRef.value?.close();
        }, 300);
      }

      const dialogEl = dialogRef.value;
      if (dialogEl) {
        const stopKeyEvents = (e: KeyboardEvent) => {
          if (e.key !== 'Escape') {
            e.stopPropagation();
          }
        };
        dialogEl.addEventListener('keydown', stopKeyEvents, true);
        dialogEl.addEventListener('keyup', stopKeyEvents, true);
        dialogEl.addEventListener('keypress', stopKeyEvents, true);

        cleanup(() => {
          dialogEl.removeEventListener('keydown', stopKeyEvents, true);
          dialogEl.removeEventListener('keyup', stopKeyEvents, true);
          dialogEl.removeEventListener('keypress', stopKeyEvents, true);
        });
      }
    });

    return (
      <dialog
        ref={dialogRef}
        onCancel$={(e) => {
          e.preventDefault();
          // Native escape should not close HeroSection unless they click "Open Map".
          // But if they want to close it with escape, we can allow it:
          // closed.value = true;
          // setViewMode('flat');
          // Let's just prevent escape since HeroSection requires pressing the open map button
          // or actually, pressing escape to close menu is fine.
          closed.value = true;
        }}
        class={{
          'text-lum-text m-0 flex h-full max-h-none w-full max-w-none items-center justify-center border-none bg-transparent p-4 transition-all duration-300 outline-none lg:p-8': true,
          'pointer-events-none scale-95 opacity-0 backdrop:opacity-0':
            !isVisible.value,
          'scale-100 opacity-100 backdrop:opacity-100': isVisible.value,
          'backdrop:bg-black/20 backdrop:backdrop-blur-sm backdrop:transition-all backdrop:duration-300': true,
        }}
        onClick$={(e, el) => {
          if (e.target === el) closed.value = true;
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

          <div class="mx-auto my-6 flex flex-col gap-4 sm:flex-row">
            <button
              class="lum-btn lum-btn-p-4 rounded-lum-2 lum-grad-bg-gray-500 hover:lum-grad-bg-gray-400"
              onClick$={() => {
                closed.value = !closed.value;
                void setViewMode('flat');
              }}
            >
              <Map size={24} />
              Open Map
            </button>
            <button
              onClick$={() => {
                storeModalOpen.value = true;
              }}
              class="lum-btn lum-btn-p-4 rounded-lum-2 lum-grad-bg-emerald-600 hover:lum-grad-bg-emerald-500 flex cursor-pointer items-center gap-2 font-bold text-white"
            >
              <ShoppingCart size={24} />
              Store
            </button>
          </div>

          <p class="text-lum-text-secondary">
            Mineplace supports both Java and Bedrock Edition!
          </p>
          <SocialButtons />
        </div>
      </dialog>
    );
  }
);
