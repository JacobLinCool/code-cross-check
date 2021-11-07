import { defineConfig } from "vite";
import monacoEditorPlugin from "vite-plugin-monaco-editor";
import { minifyHtml } from "vite-plugin-html";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
    base: "./",
    root: "./src-web",
    build: { outDir: "../web" },
    plugins: [
        monacoEditorPlugin({ languageWorkers: ["typescript"] }),
        VitePWA({
            includeAssets: ["monacoeditorwork/ts.worker.bundle.js", "image/apple-touch-icon.png"],
            manifest: {
                name: "Code Cross Check",
                short_name: "Code CC",
                description: "Code Cross Check",
                theme_color: "#2e3440",
                icons: [
                    {
                        src: "image/icon.192.png",
                        sizes: "192x192",
                        type: "image/png",
                    },
                    {
                        src: "image/icon.512.png",
                        sizes: "512x512",
                        type: "image/png",
                    },
                    {
                        src: "image/icon.512.png",
                        sizes: "512x512",
                        type: "image/png",
                        purpose: "any maskable",
                    },
                ],
            },
            workbox: {
                maximumFileSizeToCacheInBytes: 10 * 1024 * 1024,
            },
        }),
        minifyHtml(),
    ],
});
