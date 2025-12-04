
import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

// Load env vars
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Missing env vars')
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function checkAccess() {
    console.log('Testing Public Access to "seo_pages"...')

    const { data, error } = await supabase
        .from('seo_pages')
        .select('count')
        .limit(1)

    if (error) {
        console.error('❌ Access Denied or Error:', error.message)
        console.log('Hint: You probably need to enable "Enable read access for all users" in Supabase RLS policies.')
    } else {
        console.log('✅ Access Granted!')
        console.log('Data sample:', data)
    }
}

checkAccess()
