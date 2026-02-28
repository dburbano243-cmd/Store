import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
	const msg = 'Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY environment variables.'
	if (process.env.NODE_ENV === 'production') {
		throw new Error(`${msg} Set them in your Netlify (or host) environment settings.`)
	} else {
		// warn during local dev/build so logs show informative message
		// but allow execution to continue (some pages may run without Supabase)
		// This prevents obscure runtime errors during build/deploy.
		// eslint-disable-next-line no-console
		console.warn(msg)
	}
}

export const supabase = createClient(
	supabaseUrl || "https://placeholder.supabase.co",
	supabaseAnonKey || "placeholder-key"
)
