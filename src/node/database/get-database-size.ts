import { sql } from 'kysely';
import { getSettings } from '../settings/get-settings';
import { DatabaseBackend } from 'csdm/common/types/database-backend';
import { getFolderSize } from 'csdm/node/filesystem/get-folder-size';
import { getPgliteFolderPath } from './pglite/get-pglite-folder-path';
import { db } from './database';

export async function getDatabaseSize(): Promise<string> {
  const settings = await getSettings();
  const { database } = settings;

  // pg_database_size() reports the size of a database inside a PostgreSQL cluster. PGlite stores a single database in
  // a folder owned by the app, its size on disk is what users actually care about.
  if (database.backend === DatabaseBackend.Pglite) {
    const query = sql<{
      size: string;
    }>`select pg_size_pretty(${await getFolderSize(getPgliteFolderPath(database))}::bigint) as size`;
    const { rows } = await query.execute(db);

    return rows.length > 0 ? rows[0].size : '0 MB';
  }

  const query = sql<{
    size: string;
  }>`select pg_size_pretty(pg_database_size(${database.database})) as size`;
  const { rows } = await query.execute(db);

  return rows.length > 0 ? rows[0].size : '0 MB';
}
