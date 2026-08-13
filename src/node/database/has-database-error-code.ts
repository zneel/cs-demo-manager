import type { PostgresqlErrorCode } from './postgresql-error-code';

// Both node-pg and PGlite report PostgreSQL errors with the SQLSTATE code in a "code" property, but PGlite throws its
// own error class so "error instanceof DatabaseError" only matches with the PostgreSQL backend.
// Checking the code itself is what all call sites actually need and works with both backends.
export function hasDatabaseErrorCode(error: unknown, code: PostgresqlErrorCode) {
  return error instanceof Error && (error as Error & { code?: unknown }).code === code;
}
