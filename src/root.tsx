import { component$, isDev } from '@builder.io/qwik';
import {
  DocumentHead,
  DocumentHeadValue,
  QwikCityProvider,
  RouterOutlet,
} from '@builder.io/qwik-city';
import { RouterHead } from './components/router-head/router-head';

import './global.css';

export default component$(() => {
  /**
   * The root of a QwikCity site always start with the <QwikCityProvider> component,
   * immediately followed by the document's <head> and <body>.
   *
   * Don't remove the `<head>` and `<body>` elements.
   */

  return (
    <QwikCityProvider>
      <head>
        <meta charset="utf-8" />
        {!isDev && (
          <link
            rel="manifest"
            href={`${import.meta.env.BASE_URL}manifest.json`}
          />
        )}
        <script
          defer
          src="https://umami.bwmp.dev/script.js"
          data-website-id="c85c7029-e6ab-49ad-b5ac-166d5363edc5"
        ></script>
        <RouterHead />
      </head>
      <body lang="en" class="text-lum-text">
        <RouterOutlet />
      </body>
    </QwikCityProvider>
  );
});

export function generateHead({
  title = 'Mineplace - Powered by Birdflop Hosting',
  description = 'A 3D reimagining of r/place',
  image = '/branding/icon.png',
  head = {},
}: {
  title?: string;
  description?: string;
  image?: string;
  head?: Partial<DocumentHeadValue>;
}): DocumentHead {
  return {
    ...head,
    title,
    meta: [
      {
        name: 'description',
        content: description,
      },
      {
        name: 'og:description',
        content: description,
      },
      {
        name: 'og:image',
        content: image,
      },
      ...(head.meta ?? []),
    ],
    scripts: [...(head.scripts ?? [])],
  };
}
