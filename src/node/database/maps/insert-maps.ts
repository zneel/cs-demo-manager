import { db } from 'csdm/node/database/database';
import { PostgresqlErrorCode } from '../postgresql-error-code';
import { hasDatabaseErrorCode } from 'csdm/node/database/has-database-error-code';
import { MapAlreadyExists } from './errors/map-already-exists';
import type { InsertableMap } from './map-table';

export async function insertMaps(maps: InsertableMap[]) {
  try {
    const insertedMaps = await db.insertInto('maps').values(maps).returningAll().execute();

    return insertedMaps;
  } catch (error) {
    if (hasDatabaseErrorCode(error, PostgresqlErrorCode.UniqueViolation)) {
      throw new MapAlreadyExists();
    }

    throw error;
  }
}
