import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.79.0'
import { corsHeaders } from '../_shared/cors.ts'

interface UserData {
  email: string
  displayName: string
  department?: string
  site?: string
  role: 'admin' | 'magasinier' | 'acheteur' | 'lecteur'
  password?: string
}

interface BatchResult {
  success: number
  errors: Array<{ email: string; error: string }>
  createdUsers: string[]
}

// Generate a secure random password
function generateSecurePassword(): string {
  const length = 12
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*'
  let password = ''
  const array = new Uint8Array(length)
  crypto.getRandomValues(array)
  for (let i = 0; i < length; i++) {
    password += charset[array[i] % charset.length]
  }
  return password
}

// Process users in batches to avoid rate limits
async function processBatch(
  supabaseAdmin: any,
  users: UserData[],
  batchSize: number = 10
): Promise<BatchResult> {
  const result: BatchResult = {
    success: 0,
    errors: [],
    createdUsers: []
  }

  // Process in smaller batches with delays
  for (let i = 0; i < users.length; i += batchSize) {
    const batch = users.slice(i, i + batchSize)
    
    // Process batch concurrently but with rate limiting
    const batchPromises = batch.map(async (userData) => {
      try {
        // Check if user already exists
        const { data: existingProfile } = await supabaseAdmin
          .from('profiles')
          .select('id, email')
          .eq('email', userData.email)
          .maybeSingle()

        if (existingProfile) {
          return {
            success: false,
            email: userData.email,
            error: 'Utilisateur existe déjà'
          }
        }

        // Generate password if not provided
        const password = userData.password || generateSecurePassword()

        // Create user with admin API
        const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
          email: userData.email,
          password: password,
          email_confirm: true, // Auto-confirm email
          user_metadata: {
            display_name: userData.displayName,
            department: userData.department || null,
            site: userData.site || null
          }
        })

        if (authError) {
          return {
            success: false,
            email: userData.email,
            error: authError.message
          }
        }

        if (!authData.user) {
          return {
            success: false,
            email: userData.email,
            error: 'Échec de création utilisateur'
          }
        }

        // Update role if not default
        if (userData.role && userData.role !== 'lecteur') {
          const { error: roleError } = await supabaseAdmin
            .from('user_roles')
            .update({ role: userData.role })
            .eq('user_id', authData.user.id)

          if (roleError) {
            console.error('Role update error:', roleError)
            // Don't fail the whole import if role update fails
          }
        }

        return {
          success: true,
          email: userData.email,
          userId: authData.user.id
        }
      } catch (error) {
        console.error(`Error creating user ${userData.email}:`, error)
        return {
          success: false,
          email: userData.email,
          error: error instanceof Error ? error.message : 'Erreur inconnue'
        }
      }
    })

    const batchResults = await Promise.all(batchPromises)

    // Aggregate results
    for (const res of batchResults) {
      if (res.success) {
        result.success++
        result.createdUsers.push(res.email)
      } else {
        result.errors.push({ email: res.email, error: res.error })
      }
    }

    // Add delay between batches to respect rate limits (100ms between batches)
    if (i + batchSize < users.length) {
      await new Promise(resolve => setTimeout(resolve, 100))
    }
  }

  return result
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Verify authentication
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Non autorisé' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Create Supabase client with service role (admin privileges)
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Verify the requesting user is an admin
    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token)

    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Non autorisé' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Check if user has admin role
    const { data: roleData } = await supabaseAdmin
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single()

    if (!roleData || roleData.role !== 'admin') {
      return new Response(
        JSON.stringify({ error: 'Seuls les administrateurs peuvent importer des utilisateurs' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Parse request body
    const { users }: { users: UserData[] } = await req.json()

    if (!users || !Array.isArray(users) || users.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Liste d\'utilisateurs invalide' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Validate user data
    const validRoles = ['admin', 'magasinier', 'acheteur', 'lecteur']
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

    for (const user of users) {
      if (!user.email || !emailRegex.test(user.email)) {
        return new Response(
          JSON.stringify({ error: `Email invalide: ${user.email}` }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
      if (!user.displayName) {
        return new Response(
          JSON.stringify({ error: `Nom requis pour ${user.email}` }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
      if (user.role && !validRoles.includes(user.role)) {
        return new Response(
          JSON.stringify({ error: `Rôle invalide pour ${user.email}: ${user.role}` }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
    }

    console.log(`Starting bulk user creation: ${users.length} users`)

    // Process users in batches
    const result = await processBatch(supabaseAdmin, users)

    console.log(`Bulk user creation completed: ${result.success} success, ${result.errors.length} errors`)

    return new Response(
      JSON.stringify(result),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Error in bulk-create-users:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Erreur serveur',
        details: error instanceof Error ? error.message : 'Erreur inconnue'
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
