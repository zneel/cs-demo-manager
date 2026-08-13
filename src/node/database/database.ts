import { types, Pool } from 'pg';
import { PGlite, types as pgliteTypes } from '@electric-sql/pglite';
import type { Dialect, KyselyConfig, LogEvent, Logger } from 'kysely';
import { Kysely, PGliteDialect, PostgresDialect } from 'kysely';
import type { DatabaseSettings, PgliteDatabaseSettings } from 'csdm/node/settings/settings';
import { DatabaseBackend } from 'csdm/common/types/database-backend';
import { getPgliteFolderPath } from './pglite/get-pglite-folder-path';
import { loadPgliteAssets } from './pglite/load-pglite-assets';
import type { Database } from './schema';

export let db: Kysely<Database>;
// The PGlite instance backing "db" when the PGlite backend is used, undefined otherwise.
// It's kept around because a few operations (bulk CSV insertion, on-disk size) need the instance itself rather than
// going through Kysely.
let pglite: PGlite | undefined;

// Convert int8 values that are "safe" JS integers into Numbers otherwise leave them as strings.
// Postgres returns int8 values for int8 columns but also aggregate functions (COUNT(), SUM()...).
// By default node-pg parses int8 values into strings.
// We do this conversion for the following reasons:
// - The only int8 columns in the app are used for tables PK ID and we don't do Math operations on them.
// - To not have to think about casting values into numbers when using aggregate functions, i.e.:
//   db.count('id') vs db.raw('COUNT(id)::INT')
// - Sending BigInts through WebSocket result in strings.
function parseInt8(value: string) {
  const valueAsNumber = Number(value);
  if (Number.isSafeInteger(valueAsNumber)) {
    return valueAsNumber;
  }

  return value;
}

types.setTypeParser(types.builtins.INT8, parseInt8);
// Cast numeric types into JS Number so SUM, AVG... will be numbers instead of strings.
types.setTypeParser(types.builtins.NUMERIC, Number);
types.setTypeParser(types.builtins.INT4, Number);
types.setTypeParser(types.builtins.INT2, Number);

export function getPgliteInstance() {
  if (pglite === undefined) {
    throw new Error('The PGlite instance is not available, the database is either not connected or uses PostgreSQL');
  }

  return pglite;
}

async function createPgliteDialect(settings: PgliteDatabaseSettings): Promise<Dialect> {
  const assets = await loadPgliteAssets();

  pglite = await PGlite.create(getPgliteFolderPath(settings), {
    ...assets,
    // PGlite already parses int2/int4/int8 and float8 into numbers but, like node-pg, it returns numeric values as
    // strings. Queries casting to ::NUMERIC (averages, ratios...) are typed as numbers so they have to be parsed the
    // same way the PostgreSQL backend does it.
    parsers: {
      [pgliteTypes.INT8]: parseInt8,
      [pgliteTypes.NUMERIC]: Number,
    },
  });

  return new PGliteDialect({ pglite });
}

export async function createDatabaseConnection(settings: DatabaseSettings) {
  await closeDatabaseConnection();

  const dialect =
    settings.backend === DatabaseBackend.Pglite
      ? await createPgliteDialect(settings)
      : new PostgresDialect({
          pool: new Pool({
            host: settings.hostname,
            port: settings.port,
            user: settings.username,
            password: settings.password,
            database: settings.database,
            connectionTimeoutMillis: 10000,
          }),
        });

  let loggerFunction: Logger;
  if (process.env.LOG_DATABASE_QUERIES) {
    loggerFunction = (event: LogEvent) => {
      logger.log(event.query.sql);
      logger.log(event.query.parameters);
      if (event.level === 'error') {
        logger.log('Failed query:');
        logger.error(event.error);
      }
    };
  } else {
    loggerFunction = (event: LogEvent) => {
      if (event.level === 'error') {
        logger.log('Failed query:');
        logger.error(event.error);
      }
    };
  }

  const config: KyselyConfig = {
    dialect,
    log: loggerFunction,
  };

  db = new Kysely<Database>(config);
}

export async function closeDatabaseConnection() {
  if (db !== undefined) {
    await db.destroy();
  }
  pglite = undefined;
}
