import path from 'node:path';
import os from 'node:os';
import fs from 'fs-extra';
import { glob } from 'csdm/node/filesystem/glob';
import type { DatabaseSettings } from 'csdm/node/settings/settings';
import type { Database } from 'csdm/node/database/schema';
import { executePsql } from 'csdm/node/database/psql/execute-psql';
import { formatHostnameForUri } from 'csdm/node/database/format-hostname-for-uri';
import { getPgliteInstance } from 'csdm/node/database/database';
import { DatabaseBackend } from 'csdm/common/types/database-backend';

export type InsertOptions = {
  databaseSettings: DatabaseSettings;
  outputFolderPath: string;
  demoName: string;
};

export function getOutputFolderPath() {
  return path.resolve(os.tmpdir(), 'cs-demo-manager');
}

export function getDemoNameFromPath(demoPath: string) {
  return path.parse(demoPath).name;
}

export function getCsvFilePath(outputFolderPath: string, demoName: string, csvFileSuffix: string) {
  return path.resolve(outputFolderPath, `${demoName}${csvFileSuffix}`);
}

type InsertFromCsvOptions<Table> = {
  databaseSettings: DatabaseSettings;
  csvFilePath: string;
  tableName: keyof Database;
  columns: Array<keyof Table>;
};

export async function insertFromCsv<Table>({
  columns,
  csvFilePath,
  databaseSettings,
  tableName,
}: InsertFromCsvOptions<Table>) {
  const columnNames = columns.join(',');

  // PGlite runs in-process, it can read the CSV content directly through its "/dev/blob" virtual file instead of
  // going through the psql CLI.
  if (databaseSettings.backend === DatabaseBackend.Pglite) {
    const csvContent = await fs.readFile(csvFilePath);
    await getPgliteInstance().query(
      `COPY ${tableName}(${columnNames}) FROM '/dev/blob' WITH (FORMAT CSV, DELIMITER ',', ENCODING 'UTF8')`,
      [],
      {
        blob: new Blob([csvContent]),
      },
    );

    return;
  }

  const { database, username, hostname, port, password } = databaseSettings;
  const escapedCsvFilePath = csvFilePath.replaceAll("'", "''");
  const command = `-c "\\copy ${tableName}(${columnNames}) FROM '${escapedCsvFilePath}' ENCODING 'UTF8' CSV DELIMITER ','" "postgresql://${username}:${encodeURIComponent(
    password,
  )}@${formatHostnameForUri(hostname)}:${port}/${database}"`;
  await executePsql(command);
}

export async function deleteCsvFilesInOutputFolder(outputFolderPath: string) {
  const files = await glob('*.csv', {
    cwd: outputFolderPath,
    absolute: true,
  });

  await Promise.all(files.map((csvFile) => fs.remove(csvFile)));
}
