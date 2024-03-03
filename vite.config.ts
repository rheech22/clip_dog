import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

import react from "@vitejs/plugin-react-swc";
import { ManifestV3Export, crx } from "@crxjs/vite-plugin";
import hotReloadExtension from "hot-reload-extension-vite";

import manifestJson from "./manifest.json";

const manifest = manifestJson as ManifestV3Export;

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    tsconfigPaths(),
    react(),
    crx({ manifest }),
    hotReloadExtension({
      log: true,
      backgroundPath: "./src/service_worker.ts",
    }),
  ],
  server: {
    port: 3000,
  },
});
