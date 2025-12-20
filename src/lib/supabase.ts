import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (typeof window !== 'undefined') {
    if (!supabaseUrl || !supabaseKey) {
        console.error('DIAGNOSTIC: Supabase environment variables are missing on the CLIENT side. These must be available during BUILD time.')
    }
}

// Use placeholders for build phase safety, but ensure we log if they are missing at runtime
export const supabase = createClient(
    supabaseUrl || 'https://placeholder.supabase.co',
    supabaseKey || 'placeholder'
)
