import { sql } from 'kysely';
import type { Migration } from './migration';

// A FACEIT match may hold several demos, one per map played (i.e. a best of 3), only the first one used to be stored.
// The download history is also tracked per demo instead of per match, its identifier is the match's id for matches
// holding a single demo so that the existing rows keep matching.
const v15: Migration = {
  schemaVersion: 15,
  run: async (transaction) => {
    await transaction.schema
      .alterTable('faceit_matches')
      .addColumn('demo_urls', sql`varchar[]`, (col) => col.notNull().defaultTo(sql`'{}'`))
      .execute();

    await sql`UPDATE faceit_matches SET demo_urls = ARRAY[demo_url] WHERE demo_url <> ''`.execute(transaction);

    await transaction.schema.alterTable('faceit_matches').dropColumn('demo_url').execute();

    await transaction.schema.alterTable('download_history').renameColumn('match_id', 'download_id').execute();
  },
};

export default v15;
