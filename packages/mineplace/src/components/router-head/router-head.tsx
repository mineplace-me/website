import { component$ } from '@builder.io/qwik';
import { useDocumentHead, useLocation } from '@builder.io/qwik-city';

/**
 * The RouterHead component is placed inside of the document `<head>` element.
 */
export const RouterHead = component$(() => {
  const head = useDocumentHead();
  const loc = useLocation();

  return (
    <>
      <title>{head.title}</title>
      <meta content={`${head.title}`} property="og:title" />
      <meta content="#54a5da" name="theme-color" />
      <meta content="/branding/icon.png" property="og:image" />
      <link rel="preload" as="font" href="/MinecraftOfficial.ttf" crossOrigin="anonymous" />

      <link rel="canonical" href={loc.url.href} />
      <link rel="icon" type="image/svg" href="/branding/icon.svg" />
      <link rel="apple-touch-icon" href="/branding/apple-icon.png" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />

      {head.meta.map((m) => (
        <meta key={m.key} {...m} />
      ))}

      {head.links.map((l) => (
        <link key={l.key} {...l} />
      ))}

      {head.styles.map((s) => (
        <style
          key={s.key}
          {...s.props}
          {...(s.props?.dangerouslySetInnerHTML
            ? {}
            : { dangerouslySetInnerHTML: s.style })}
        />
      ))}

      {head.scripts.map((s) => (
        <script
          key={s.key}
          {...s.props}
          {...(s.props?.dangerouslySetInnerHTML
            ? {}
            : { dangerouslySetInnerHTML: s.script })}
        />
      ))}
    </>
  );
});
