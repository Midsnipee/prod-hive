import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.47.10'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const demoUsers = [
  {
    email: 'admin@stock.local',
    password: 'admin123',
    displayName: 'Administrateur',
    department: 'IT',
    site: 'Siège',
    role: 'admin'
  },
  {
    email: 'magasinier@stock.local',
    password: 'mag123',
    displayName: 'Jean Dupont',
    department: 'Logistique',
    site: 'Entrepôt A',
    role: 'magasinier'
  },
  {
    email: 'acheteur@stock.local',
    password: 'ach123',
    displayName: 'Marie Martin',
    department: 'Achats',
    site: 'Siège',
    role: 'acheteur'
  },
  {
    email: 'lecteur@stock.local',
    password: 'lec123',
    displayName: 'Pierre Durand',
    department: 'Commercial',
    site: 'Agence B',
    role: 'lecteur'
  }
]

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Check if users already exist
    const { data: existingProfiles } = await supabaseClient
      .from('profiles')
      .select('email')
      .limit(1)

    if (existingProfiles && existingProfiles.length > 0) {
      return new Response(
        JSON.stringify({ message: 'Demo users already exist' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const results = []

    for (const user of demoUsers) {
      // Create user with admin API
      const { data: authData, error: createError } = await supabaseClient.auth.admin.createUser({
        email: user.email,
        password: user.password,
        email_confirm: true,
        user_metadata: {
          display_name: user.displayName,
          department: user.department,
          site: user.site
        }
      })

      if (createError) {
        console.error(`Error creating user ${user.email}:`, createError)
        results.push({ email: user.email, success: false, error: createError.message })
        continue
      }

      if (authData.user) {
        // Profile is created automatically by trigger, now add role
        const { error: roleError } = await supabaseClient
          .from('user_roles')
          .insert({
            user_id: authData.user.id,
            role: user.role
          })

        if (roleError) {
          console.error(`Error assigning role to ${user.email}:`, roleError)
          results.push({ email: user.email, success: false, error: roleError.message })
        } else {
          results.push({ email: user.email, success: true, role: user.role })
        }
      }
    }

    return new Response(
      JSON.stringify({ message: 'Demo users seeded', results }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
