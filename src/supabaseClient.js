import { createClient } from '@supabase/supabase-js'

const supabaseUrl = "https://ueeensmyaqsbruezyjwe.supabase.co"
const supabaseAnonKey = "sb_publishable_Pwkeq6QyrIgUvLSbo8prGQ_9LF83oBu"

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
