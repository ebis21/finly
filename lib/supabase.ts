import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Dopóki nie wklejone są prawdziwe klucze w .env.local, aplikacja
// nie łączy się z bazą i pokazuje ekran konfiguracji zamiast się
// wywalać. Po uzupełnieniu kluczy klient tworzy się automatycznie.
export const isSupabaseConfigured = Boolean(
  url && anonKey && url.startsWith("http")
);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(url as string, anonKey as string)
  : null;

// Pomocnik do użycia w miejscach, które wykonują się dopiero po
// zalogowaniu (a więc gdy klient na pewno istnieje).
export function requireSupabase(): SupabaseClient {
  if (!supabase) {
    throw new Error(
      "Supabase nie jest skonfigurowane — uzupełnij klucze w .env.local"
    );
  }
  return supabase;
}
