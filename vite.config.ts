import { defineConfig, PluginOption } from "vite";
import webExtension, { readJsonFile } from "vite-plugin-web-extension";

function generateManifest() {
  const manifest = readJsonFile("src/manifest.json");
  const pkg = readJsonFile("package.json");

  return {
    ...manifest,
    name: pkg.name,
    description: pkg.description,
    version: pkg.version,
  };
}

export default defineConfig({
  root: "src",
  build: {
    emptyOutDir: true,
    outDir: "../dist",
  },
  plugins: [
    webExtension({
      browser: "firefox",
      manifest: generateManifest,
      watchFilePaths: ["../package.json", "manifest.json"],
    }) as PluginOption,
  ],
});
