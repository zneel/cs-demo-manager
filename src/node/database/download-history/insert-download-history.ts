import { sql } from 'kysely';
import { db } from '../database';

export async function insertDownloadHistory(downloadId: string) {
  await db
    .insertInto('download_history')
    .values({ download_id: downloadId })
    .onConflict((oc) => {
      return oc.column('download_id').doUpdateSet({
        downloaded_at: () => sql`now()`,
      });
    })
    .execute();
}
