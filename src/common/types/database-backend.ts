// Database engines the app can store its data into.
// - Postgresql: an external PostgreSQL server, it requires the "psql" CLI to be installed on the host machine.
// - Pglite: PostgreSQL compiled to WebAssembly and embedded into the app, it doesn't require anything to be installed.
export const DatabaseBackend = {
  Postgresql: 'postgresql',
  Pglite: 'pglite',
} as const;

export type DatabaseBackend = (typeof DatabaseBackend)[keyof typeof DatabaseBackend];
