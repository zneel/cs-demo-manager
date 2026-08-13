import path from 'node:path';
import { getAppFolderPath } from 'csdm/node/filesystem/get-app-folder-path';
import type { PgliteDatabaseSettings } from 'csdm/node/settings/settings';

// Returns the folder where PGlite stores its data files.
// An empty folder path in settings means "use the default location" so that the database follows the app's folder
// instead of being pinned to an absolute path.
export function getPgliteFolderPath(settings: PgliteDatabaseSettings) {
  if (settings.folderPath !== '') {
    return settings.folderPath;
  }

  return path.resolve(getAppFolderPath(), 'database');
}
