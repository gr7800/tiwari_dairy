export class AppError extends Error {
  constructor(message: string) {
    super(message);
  }
}

interface PostgrestLikeError {
  code?: string;
  message?: string;
}

/**
 * Supabase/PostgREST surfaces raw Postgres error codes on writes. We never
 * want a raw "duplicate key value violates unique constraint …" string
 * reaching the user — this is the backstop for the rare race-condition case
 * where the pre-flight duplicate check in a Server Action passed but a
 * concurrent insert beat it to the DB constraint (rule #20).
 */
export function toFriendlyMessage(error: PostgrestLikeError, fallback: string): string {
  if (error.code === "23505") {
    return "This entry already exists for the same farmer, date, shift and milk type. Please edit the existing entry instead.";
  }
  return fallback;
}
