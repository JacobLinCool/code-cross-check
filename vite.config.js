import { defineConfig } from "vite";
import monacoEditorPlugin from "vite-plugin-monaco-editor";
import { minifyHtml } from "vite-plugin-html";

export default defineConfig({
    base: "./",
    root: "./src-web",
    build: { outDir: "../web" },
    plugins: [monacoEditorPlugin({ languageWorkers: ["typescript"] }), minifyHtml()],
});
