import { db } from 'csdm/node/database/database';
import type { InsertableCamera } from './cameras-table';
import { PostgresqlErrorCode } from '../postgresql-error-code';
import { hasDatabaseErrorCode } from 'csdm/node/database/has-database-error-code';
import { CameraAlreadyExists } from './errors/camera-already-exists';

export async function insertCamera(camera: InsertableCamera) {
  try {
    const rows = await db.insertInto('cameras').values(camera).returningAll().execute();

    if (rows.length === 0) {
      throw new Error('Failed to insert camera');
    }

    return rows[0];
  } catch (error) {
    if (hasDatabaseErrorCode(error, PostgresqlErrorCode.UniqueViolation)) {
      throw new CameraAlreadyExists();
    }

    throw error;
  }
}
