import path from 'node:path';
import { fileURLToPath } from 'node:url';
import fs from 'fs-extra';

const rootFolderPath = fileURLToPath(new URL('..', import.meta.url));

// PGlite loads its WebAssembly runtime and its PostgreSQL filesystem image from files sitting next to its own module.
// Those files can't go through esbuild so they are copied as-is and loaded explicitly at runtime, see
// src/node/database/pglite/load-pglite-assets.ts.
export const PGLITE_ASSET_FILE_NAMES = ['pglite.wasm', 'pglite.data', 'initdb.wasm'];

export function getPgliteAssetsFolderName() {
  return 'pglite';
}

export async function copyPgliteAssets(outFolderPath) {
  const sourceFolderPath = path.resolve(rootFolderPath, 'node_modules', '@electric-sql', 'pglite', 'dist');
  const destinationFolderPath = path.resolve(outFolderPath, getPgliteAssetsFolderName());
  await fs.ensureDir(destinationFolderPath);

  await Promise.all(
    PGLITE_ASSET_FILE_NAMES.map((fileName) => {
      return fs.copy(path.resolve(sourceFolderPath, fileName), path.resolve(destinationFolderPath, fileName));
    }),
  );
}

// PGlite builds URLs relative to "import.meta.url" to locate the assets above. esbuild's CJS output leaves
// "import.meta.url" undefined which makes the URL constructor throw, so it's replaced by the bundle's own location.
// The assets are provided explicitly at runtime, these URLs are only built, never fetched.
const IMPORT_META_URL_IDENTIFIER = 'CSDM_IMPORT_META_URL';

export const pgliteDefine = {
  'import.meta.url': IMPORT_META_URL_IDENTIFIER,
};

export const pgliteBanner = {
  js: `const ${IMPORT_META_URL_IDENTIFIER} = require('node:url').pathToFileURL(__filename).href;`,
};
