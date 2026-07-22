import { component$, Signal, useSignal, useVisibleTask$ } from '@qwik.dev/core';
import { Form } from '@qwik.dev/router';
import type { useCheckout } from '~/routes/index';
import User from 'lucide-icons-qwik/icons/User';
import X from 'lucide-icons-qwik/icons/X';
import Sparkles from 'lucide-icons-qwik/icons/Sparkles';
const Mineplace = '/branding/icon.svg';

export type Package = {
  id: string;
  name: string;
  price: number;
  dust: number;
  color: string;
  popular?: boolean;
};

export const packages: Package[] = [
  {
    id: 'pkg_1',
    name: '20,000 Dust',
    price: 4.99,
    dust: 20000,
    color: 'from-gray-300 to-gray-500',
  },
  {
    id: 'pkg_2',
    name: '45,000 Dust',
    price: 9.99,
    dust: 45000,
    color: 'from-green-400 to-emerald-600',
  },
  {
    id: 'pkg_3',
    name: '100,000 Dust',
    price: 19.99,
    dust: 100000,
    color: 'from-blue-400 to-indigo-600',
  },
  {
    id: 'pkg_4',
    name: '150,000 Dust',
    price: 29.99,
    dust: 150000,
    color: 'from-purple-400 to-purple-700',
  },
  {
    id: 'pkg_5',
    name: '300,000 Dust',
    price: 49.99,
    dust: 300000,
    color: 'from-pink-400 to-rose-600',
  },
  {
    id: 'pkg_6',
    name: '750,000 Dust',
    price: 99.99,
    dust: 750000,
    color: 'from-yellow-400 to-amber-600',
  },
];

export type StoreModalProps = {
  isOpen: Signal<boolean>;
  username: Signal<string>;
  isSubmitting: Signal<boolean>;
  selectedPackageId: Signal<string | null>;
  checkoutAction: ReturnType<typeof useCheckout>;
};

export const StoreModal = component$<StoreModalProps>(
  ({ isOpen, username, isSubmitting, selectedPackageId, checkoutAction }) => {
    const dialogRef = useSignal<HTMLDialogElement>();
    const isVisible = useSignal(false);

    useVisibleTask$(({ track, cleanup }) => {
      const open = track(() => isOpen.value);
      if (open) {
        if (!dialogRef.value?.open) dialogRef.value?.showModal();
        requestAnimationFrame(() => {
          isVisible.value = true;
        });
      } else {
        isVisible.value = false;
        setTimeout(() => {
          if (!isOpen.value) dialogRef.value?.close();
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
          isOpen.value = false;
        }}
        class={{
          'text-lum-text m-0 flex h-full max-h-none w-full max-w-none items-center justify-center border-none bg-transparent p-4 transition-all duration-300 outline-none lg:p-8': true,
          'pointer-events-none scale-95 opacity-0 backdrop:opacity-0':
            !isVisible.value,
          'scale-100 opacity-100 backdrop:opacity-100': isVisible.value,
          'backdrop:bg-black/20 backdrop:backdrop-blur-sm backdrop:transition-all backdrop:duration-300': true,
        }}
        onClick$={(e, el) => {
          if (e.target === el) isOpen.value = false;
        }}
      >
        <div class="lum-card lum-grad-bg-gray-900/95 rounded-lum relative z-10 max-h-[90vh] w-full max-w-6xl overflow-y-auto border border-gray-800 p-6 drop-shadow-2xl backdrop-blur-2xl lg:p-10">
          <div class="mt-2 mb-8 flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
            <div class="flex items-center gap-4">
              <img
                src={Mineplace}
                width={64}
                height={64}
                alt="Mineplace Logo"
                class="h-16 w-16"
              />
              <div>
                <h1 class="flex items-center gap-3 text-4xl font-bold lg:text-5xl">
                  Store
                </h1>
                <p class="text-lum-text-secondary mt-1 text-lg">
                  Support the server and in return get some blocks to place.
                </p>
              </div>
            </div>
            <div class="lum-card lum-bg-gray-800/50 flex min-w-[300px] flex-col gap-3 p-4">
              <label
                for="store-username"
                class="flex items-center gap-2 text-lg font-bold"
              >
                <User size={20} />
                Minecraft Username
              </label>
              <input
                id="store-username"
                type="text"
                placeholder="Notch"
                class="lum-input rounded-lum-2 w-full text-lg"
                value={username.value}
                onInput$={(e, el) => (username.value = el.value)}
              />
              {checkoutAction.value?.fieldErrors?.username && (
                <p class="text-sm font-semibold text-red-400">
                  {checkoutAction.value.fieldErrors.username[0]}
                </p>
              )}
            </div>{' '}
            <button
              onClick$={() => (isOpen.value = false)}
              class="lum-btn lum-bg-transparent mb-auto rounded-full p-2 hover:bg-gray-800"
            >
              <X size={24} />
            </button>
          </div>

          {checkoutAction.value?.success === false && (
            <div class="rounded-lum-2 mb-8 flex items-center justify-center border-2 border-red-500/50 bg-red-500/20 p-4 text-red-200">
              {checkoutAction.value.message}
            </div>
          )}

          <div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {packages.map((pkg) => (
              <div
                key={pkg.id}
                class={{
                  'lum-card group relative flex flex-col p-6 transition-all duration-300 hover:-translate-y-2': true,
                  'border-2 border-transparent hover:border-emerald-500/50':
                    selectedPackageId.value !== pkg.id,
                  'border-2 border-emerald-500 shadow-[0_0_30px_rgba(16,185,129,0.2)]':
                    selectedPackageId.value === pkg.id,
                  'overflow-hidden': true,
                }}
              >
                {pkg.popular && (
                  <div class="absolute top-4 right-[-32px] z-10 rotate-45 bg-amber-500 px-10 py-1 text-xs font-bold text-black shadow-lg">
                    POPULAR
                  </div>
                )}

                <div
                  class={`absolute inset-0 bg-gradient-to-br opacity-10 ${pkg.color} pointer-events-none transition-opacity group-hover:opacity-20`}
                ></div>

                <div class="z-10 flex flex-1 flex-col gap-4">
                  <div class="flex items-start justify-between">
                    <h3 class="font-minecraft flex flex-col text-2xl font-bold">
                      <span
                        class={`bg-gradient-to-r ${pkg.color} inline-flex items-center gap-2 bg-clip-text text-transparent`}
                      >
                        {pkg.dust.toLocaleString()}
                        <Sparkles size={20} class="text-yellow-400" />
                      </span>
                      <span class="text-white">Dust</span>
                    </h3>
                    <span class="lum-card bg-black/50 px-3 py-1 text-xl font-bold">
                      ${pkg.price}
                    </span>
                  </div>
                  <div class="mt-auto pt-6">
                    <Form action={checkoutAction}>
                      <input
                        type="hidden"
                        name="username"
                        value={username.value}
                      />
                      <input type="hidden" name="packageId" value={pkg.id} />
                      <button
                        type="submit"
                        class={{
                          'lum-btn rounded-lum-2 w-full p-4 text-lg font-bold transition-all': true,
                          'lum-grad-bg-gray-600 cursor-not-allowed opacity-50':
                            username.value.length < 3 || isSubmitting.value,
                          'lum-grad-bg-emerald-600 hover:lum-grad-bg-emerald-500':
                            username.value.length >= 3 && !isSubmitting.value,
                        }}
                        disabled={
                          username.value.length < 3 || isSubmitting.value
                        }
                        onClick$={(e) => {
                          if (username.value.length < 3) {
                            e.preventDefault();
                            return;
                          }
                          selectedPackageId.value = pkg.id;
                          isSubmitting.value = true;
                        }}
                      >
                        {isSubmitting.value &&
                        selectedPackageId.value === pkg.id
                          ? 'Processing...'
                          : `Purchase for $${pkg.price}`}
                      </button>
                    </Form>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Render redirect when checkout is successful */}
          {checkoutAction.value?.success &&
            checkoutAction.value.checkoutUrl && (
              <script
                dangerouslySetInnerHTML={`window.location.href = "${checkoutAction.value.checkoutUrl}";`}
              />
            )}
        </div>
      </dialog>
    );
  }
);
