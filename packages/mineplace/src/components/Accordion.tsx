import { component$, PropsOf, QRL, Slot, useSignal } from '@qwik.dev/core';
import { Dropdown, getClassObject } from '@luminescent/ui-qwik';

interface AccordionProps extends PropsOf<'button'> {
  pcOnly?: boolean;
  onClick$?: QRL<() => void>;
}

export default component$(
  ({ pcOnly, class: className, onClick$, ...props }: AccordionProps) => {
    const isOpen = useSignal(false);

    return (
      <>
        <Dropdown
          class={{
            'hidden sm:flex': !!pcOnly,
            ...getClassObject(className),
          }}
          opened={isOpen.value}
          {...props}
          onClick$={async () => {
            await onClick$?.();
            isOpen.value = !isOpen.value;
          }}
        >
          <Slot name="label" />
        </Dropdown>
        <div
          class={{
            'flex flex-col gap-2 transition-all duration-400': true,
            'pointer-events-none max-h-0 opacity-0': !isOpen.value,
            'pointer-events-auto max-h-64 opacity-100': isOpen.value,
          }}
          id="decode"
        >
          <Slot />
        </div>
      </>
    );
  }
);
