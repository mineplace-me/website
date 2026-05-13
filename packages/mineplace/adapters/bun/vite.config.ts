import { bunServerAdapter } from "@qwik.dev/router/adapters/bun-server/vite";
import { extendConfig } from "@qwik.dev/router/vite";
import baseConfig from "../../vite.config.ts";

export default extendConfig(baseConfig, () => {
  return {
    build: {
      ssr: true,
      rollupOptions: {
        input: ["src/entry.bun.ts"],
      },
      minify: false,
    },
    plugins: [
      bunServerAdapter({
        ssg: {
          include: ["/*"],
          // Exclude dynamic live data JSON endpoint & world asset proxy catch-all
          exclude: ["/world/live/players.json"],
          origin: "https://mineplace.me",
          maxWorkers: 1, // Limit Workers to 1, otherwise SSG will hang when compiling Qwik Router app with `bun run --bun build`.
        },
      }),
    ],
  };
});
