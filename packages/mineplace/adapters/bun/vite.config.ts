import { bunServerAdapter } from "@qwik.dev/router/adapters/bun-server/vite";
import { extendConfig } from "@qwik.dev/router/vite";
import type { ConfigEnv } from "vite";
import baseConfig from "../../vite.config.ts";

const configFn = extendConfig(baseConfig, () => {
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
        },
      }),
      {
        name: "ssg-inline-dynamic-imports",
        configEnvironment(name, environmentOptions) {
          if (name === "ssg") {
            environmentOptions.build = environmentOptions.build || {};

            // Rolldown options
            environmentOptions.build.rolldownOptions =
              environmentOptions.build.rolldownOptions || {};
            environmentOptions.build.rolldownOptions.output =
              environmentOptions.build.rolldownOptions.output || {};
            if (Array.isArray(environmentOptions.build.rolldownOptions.output)) {
              environmentOptions.build.rolldownOptions.output.forEach((o) => {
                o.codeSplitting = false;
                delete o.inlineDynamicImports;
              });
            } else {
              environmentOptions.build.rolldownOptions.output.codeSplitting = false;
              delete environmentOptions.build.rolldownOptions.output.inlineDynamicImports;
            }

            // Rollup options
            environmentOptions.build.rollupOptions = environmentOptions.build.rollupOptions || {};
            environmentOptions.build.rollupOptions.output =
              environmentOptions.build.rollupOptions.output || {};
            if (Array.isArray(environmentOptions.build.rollupOptions.output)) {
              environmentOptions.build.rollupOptions.output.forEach((o) => {
                delete o.codeSplitting;
                o.inlineDynamicImports = true;
              });
            } else {
              delete environmentOptions.build.rollupOptions.output.codeSplitting;
              environmentOptions.build.rollupOptions.output.inlineDynamicImports = true;
            }
          }
        },
      },
    ],
  };
});

export default async (env: ConfigEnv) => {
  const resolved = await configFn(env);
  delete resolved.lint;
  return resolved;
};
