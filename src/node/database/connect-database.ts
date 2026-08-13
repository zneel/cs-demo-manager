import { createDatabaseConnection } from 'csdm/node/database/database';
import type { DatabaseSettings } from 'csdm/node/settings/settings';
import { getSettings } from 'csdm/node/settings/get-settings';
import { migrateDatabase } from 'csdm/node/database/migrations/migrate-database';
import { createDatabase } from 'csdm/node/database/create-database';
import { ensurePsqlIsInstalled } from 'csdm/node/database/psql/ensure-psql-is-installed';
import { PsqlTimeout } from 'csdm/node/database/psql/errors/psql-timeout';
import { DatabaseBackend } from 'csdm/common/types/database-backend';
import { startBackgroundTasks } from 'csdm/server/start-background-tasks';

export async function connectDatabase(databaseSettings?: DatabaseSettings) {
  if (databaseSettings === undefined) {
    const settings = await getSettings();
    databaseSettings = settings.database;
  }

  // PGlite is embedded into the app, it creates its data folder on its own and doesn't need the psql CLI.
  if (databaseSettings.backend === DatabaseBackend.Postgresql) {
    await ensurePsqlIsInstalled();

    try {
      await createDatabase(databaseSettings);
    } catch (error) {
      if (error instanceof PsqlTimeout) {
        throw error;
      }
      // If psql didn't timeout it means the database already exists.
    }
  }

  await createDatabaseConnection(databaseSettings);
  await migrateDatabase();
  void startBackgroundTasks();
}
