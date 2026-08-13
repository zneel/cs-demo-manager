import type { Settings } from '../settings';
import type { Migration } from '../migration';
import { DatabaseBackend } from 'csdm/common/types/database-backend';

// Database settings used to only describe a PostgreSQL server, they now describe either a PostgreSQL server or the
// embedded PGlite database.
// Settings written before the "backend" field existed always refer to a PostgreSQL server, keep those users on it so
// they don't lose access to their data. Fresh installations are not impacted because default settings already have a
// "backend" and default to PGlite.
type DatabaseSettingsWithoutBackend = {
  backend?: DatabaseBackend;
  hostname: string;
  port: number;
  username: string;
  password: string;
  database: string;
};

const v14: Migration = {
  schemaVersion: 14,
  run: (settings: Settings) => {
    const database = settings.database as unknown as DatabaseSettingsWithoutBackend;
    if (database.backend === undefined) {
      settings.database = {
        backend: DatabaseBackend.Postgresql,
        hostname: database.hostname,
        port: database.port,
        username: database.username,
        password: database.password,
        database: database.database,
      };
    }

    return Promise.resolve(settings);
  },
};

export default v14;
