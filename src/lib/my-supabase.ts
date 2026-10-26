import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

// Owner's own Supabase project (publishable key is safe in client code).
export const MY_SUPABASE_URL = "https://ddmviuvncjwrugkujlma.supabase.co";
export const MY_SUPABASE_KEY = "sb_publishable_kg_vfKHABiaCioYxdMI-CA_2zppwin7";

const isBrowser = typeof window !== "undefined";

export const supabase = createClient<Database>(MY_SUPABASE_URL, MY_SUPABASE_KEY, {
  auth: {
    storage: isBrowser ? window.localStorage : undefined,
    persistSession: isBrowser,
    autoRefreshToken: isBrowser,
    storageKey: "sb-ddmviuvncjwrugkujlma-auth-token",
  },
});
