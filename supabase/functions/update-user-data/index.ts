
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Update user data function called');
    
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error('No authorization header');
      return new Response(
        JSON.stringify({ error: 'Authorization header required' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Verificar se o usuário atual é admin
    const token = authHeader.replace('Bearer ', '');
    const { data: { user: currentUser }, error: userError } = await supabaseAdmin.auth.getUser(token);
    
    if (userError || !currentUser) {
      console.error('Error getting current user:', userError);
      return new Response(
        JSON.stringify({ error: 'Invalid token' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Verificar se o usuário atual é admin
    const { data: currentProfile } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', currentUser.id)
      .single();

    if (!currentProfile || currentProfile.role !== 'admin') {
      console.error('User is not admin');
      return new Response(
        JSON.stringify({ error: 'Sem permissão para alterar dados de usuários' }),
        { 
          status: 403, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const { userId, fullName, username } = await req.json();
    console.log('Updating user data for:', userId, { fullName, username });

    if (!userId) {
      return new Response(
        JSON.stringify({ error: 'User ID é obrigatório' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Se o username foi fornecido, atualizar o email temporário no Auth também
    if (username) {
      const tempEmail = `${username}@mecsys.local`;
      console.log('Updating auth email to:', tempEmail);
      
      const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(
        userId,
        { email: tempEmail }
      );

      if (authError) {
        console.error('Error updating user auth email:', authError);
        return new Response(
          JSON.stringify({ error: `Erro ao atualizar email de autenticação: ${authError.message}` }),
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }
    }

    // Atualizar perfil do usuário se fullName ou username foram fornecidos
    if (fullName || username) {
      const updateData: any = {};
      
      if (fullName) {
        updateData.full_name = fullName;
      }
      
      if (username) {
        updateData.username = username;
      }

      const { error: profileError } = await supabaseAdmin
        .from('profiles')
        .update(updateData)
        .eq('id', userId);

      if (profileError) {
        console.error('Error updating user profile:', profileError);
        return new Response(
          JSON.stringify({ error: `Erro ao atualizar perfil: ${profileError.message}` }),
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }
    }

    console.log('User data updated successfully');
    return new Response(
      JSON.stringify({ success: true, message: 'Dados do usuário atualizados com sucesso' }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: 'Erro interno do servidor' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
