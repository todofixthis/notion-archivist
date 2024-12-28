import { defineConfig, PluginOption } from "vite";
import webExtension, { readJsonFile } from "vite-plugin-web-extension";

/**
 * Dynamically generate a `manifest.json` file to use for Vite configuration.
 *
 * This lets us inject values such as package name and version that we're already
 * maintaining in `package.json`.
 */
function generateManifest() {
  const manifest = readJsonFile("src/manifest.json");
  const pkg = readJsonFile("package.json");

  return {
    ...manifest,
    description: pkg.description,
    name: pkg.name,
    version: pkg.version,
  };
}

export default defineConfig({
  build: {
    emptyOutDir: true,
    outDir: "../dist",
  },
  plugins: [
    webExtension({
      // We don't take kindly to the c-word 'round these parts.
      browser: "firefox",
      manifest: generateManifest,
      watchFilePaths: ["../package.json", "manifest.json"],
    }) as PluginOption,
  ],
  root: "src",
});
