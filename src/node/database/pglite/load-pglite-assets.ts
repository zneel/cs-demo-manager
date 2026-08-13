import path from 'node:path';
import fs from 'fs-extra';

// PGlite resolves its WebAssembly runtime and its PostgreSQL filesystem image relative to its own module location.
// Bundles built with esbuild break that resolution, so the assets are copied next to the bundle at build time
// (see scripts/pglite.mjs) and provided explicitly when the instance is created.
export async function loadPgliteAssets() {
  const assetsFolderPath = path.resolve(__dirname, 'pglite');
  const [pgliteWasm, initdbWasm, fsBundle] = await Promise.all([
    fs.readFile(path.resolve(assetsFolderPath, 'pglite.wasm')),
    fs.readFile(path.resolve(assetsFolderPath, 'initdb.wasm')),
    fs.readFile(path.resolve(assetsFolderPath, 'pglite.data')),
  ]);

  const [pgliteWasmModule, initdbWasmModule] = await Promise.all([
    WebAssembly.compile(pgliteWasm),
    WebAssembly.compile(initdbWasm),
  ]);

  return {
    pgliteWasmModule,
    initdbWasmModule,
    fsBundle: new Blob([fsBundle]),
  };
}
