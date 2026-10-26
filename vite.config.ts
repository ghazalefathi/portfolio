import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { TanStackRouterVite, tanstackStart } from "@tanstack/router-plugin/vite";
import tailwindcss from "@tailwindcss/vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  base: "/portfolio/",
  plugins: [
    tsconfigPaths(),
    tailwindcss(),
    TanStackRouterVite(),
    react(),
    tanstackStart({
      server: { entry: "server" },
    }),
  ],
});
