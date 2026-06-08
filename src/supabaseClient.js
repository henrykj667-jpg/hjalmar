import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://uzufirmyjsizifnpbewe.supabase.co";

const supabaseKey =
  "sb_publishable_ozDL7S1_8KlfAOhpxbQbGA_MRjrx9j2";

export const supabase = createClient(supabaseUrl, supabaseKey);