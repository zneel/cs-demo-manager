import path from 'node:path';
import fs from 'fs-extra';

// Returns the size in bytes of all files contained in a folder, recursively.
// It returns 0 if the folder doesn't exist.
export async function getFolderSize(folderPath: string): Promise<number> {
  let entries: string[];
  try {
    entries = await fs.readdir(folderPath);
  } catch {
    return 0;
  }

  const sizes = await Promise.all(
    entries.map(async (entryName) => {
      const entryPath = path.resolve(folderPath, entryName);
      try {
        const stats = await fs.lstat(entryPath);
        if (stats.isDirectory()) {
          return await getFolderSize(entryPath);
        }

        return stats.isFile() ? stats.size : 0;
      } catch {
        // The entry may have been deleted while walking the folder.
        return 0;
      }
    }),
  );

  return sizes.reduce((total, size) => total + size, 0);
}
