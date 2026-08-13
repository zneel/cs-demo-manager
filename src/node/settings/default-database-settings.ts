import { DatabaseBackend } from 'csdm/common/types/database-backend';
import type { PgliteDatabaseSettings, PostgresqlDatabaseSettings } from './settings';

export const defaultPostgresqlDatabaseSettings: PostgresqlDatabaseSettings = {
  backend: DatabaseBackend.Postgresql,
  hostname: '127.0.0.1',
  port: 5432,
  username: 'postgres',
  password: 'password',
  database: 'csdm',
};

export const defaultPgliteDatabaseSettings: PgliteDatabaseSettings = {
  backend: DatabaseBackend.Pglite,
  folderPath: '',
};
