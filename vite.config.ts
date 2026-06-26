import path from "path"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"
import { VitePWA } from "vite-plugin-pwa"

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: "autoUpdate",
      // Only register the service worker in production builds, so `vite dev`
      // is never served stale assets from a cached SW.
      devOptions: { enabled: false },
      manifest: {
        name: "Endo2Go",
        short_name: "Endo2Go",
        description: "Zie in één foto wat je kunt eten met endometriose.",
        theme_color: "#E3027F",
        background_color: "#ffffff",
        display: "standalone",
        start_url: "/",
        lang: "nl",
        icons: [
          {
            src: "/pwa-192x192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "/pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
          },
          {
            src: "/pwa-maskable-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})
