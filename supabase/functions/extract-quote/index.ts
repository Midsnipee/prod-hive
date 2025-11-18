import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { pdfText } = await req.json();
    
    if (!pdfText) {
      return new Response(
        JSON.stringify({ error: 'PDF text is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      console.error('LOVABLE_API_KEY not found');
      return new Response(
        JSON.stringify({ error: 'Configuration error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Calling Lovable AI to extract quote data...');

    // Retry logic for temporary service issues
    let lastError = null;
    let response = null;
    
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        console.log(`Attempt ${attempt}/3 to call Lovable AI...`);
        
        response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${LOVABLE_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'google/gemini-2.5-flash',
            messages: [
              {
                role: 'system',
                content: `Tu es un assistant spécialisé dans l'extraction de données de devis. 
Analyse le texte du devis et extrait les informations suivantes:
- Le nom du fournisseur
- La référence du devis/commande
- Les lignes de commande avec: nom du matériel, quantité, prix unitaire
- Le montant total TTC

Réponds en utilisant la fonction extract_quote_data fournie.`
              },
              {
                role: 'user',
                content: `Analyse ce devis et extrait toutes les informations (fournisseur, référence, lignes de commande, montant total):\n\n${pdfText}`
              }
            ],
            tools: [
              {
                type: 'function',
                  function: {
                    name: 'extract_quote_data',
                    description: 'Extrait les données structurées d\'un devis',
                    parameters: {
                      type: 'object',
                      properties: {
                        supplier: { type: 'string', description: 'Nom du fournisseur' },
                        reference: { type: 'string', description: 'Référence du devis/commande' },
                        lines: {
                          type: 'array',
                          items: {
                            type: 'object',
                            properties: {
                              materialName: { type: 'string' },
                              quantity: { type: 'number' },
                              unitPrice: { type: 'number' }
                            },
                            required: ['materialName', 'quantity', 'unitPrice'],
                            additionalProperties: false
                          }
                        },
                        totalAmount: { type: 'number' }
                      },
                      required: ['lines', 'totalAmount'],
                      additionalProperties: false
                    }
                  }
              }
            ],
            tool_choice: { type: 'function', function: { name: 'extract_quote_data' } }
          }),
        });

        if (response.ok) {
          console.log('Successfully received response from Lovable AI');
          break; // Success, exit retry loop
        }

        // Handle specific error codes
        if (response.status === 429) {
          return new Response(
            JSON.stringify({ error: 'Limite de requêtes dépassée, veuillez réessayer plus tard.' }),
            { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        
        if (response.status === 402) {
          return new Response(
            JSON.stringify({ error: 'Crédits insuffisants, veuillez ajouter des crédits à votre espace de travail.' }),
            { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        lastError = await response.text();
        console.error(`Attempt ${attempt} failed with status ${response.status}:`, lastError);
        
        // Wait before retrying (exponential backoff)
        if (attempt < 3) {
          const waitTime = Math.pow(2, attempt) * 1000; // 2s, 4s
          console.log(`Waiting ${waitTime}ms before retry...`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
        }
      } catch (error) {
        lastError = error;
        console.error(`Attempt ${attempt} failed with error:`, error);
        
        if (attempt < 3) {
          const waitTime = Math.pow(2, attempt) * 1000;
          await new Promise(resolve => setTimeout(resolve, waitTime));
        }
      }
    }

    if (!response || !response.ok) {
      console.error('All retry attempts failed. Last error:', lastError);
      return new Response(
        JSON.stringify({ 
          error: 'Le service d\'analyse est temporairement indisponible. Veuillez réessayer dans quelques instants.' 
        }),
        { status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    console.log('AI response:', JSON.stringify(data, null, 2));

    // Extract tool call result
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (toolCall?.function?.arguments) {
      const extractedData = JSON.parse(toolCall.function.arguments);
      console.log('Extracted data:', extractedData);
      
      return new Response(
        JSON.stringify(extractedData),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fallback: try to parse content directly
    const content = data.choices?.[0]?.message?.content;
    if (content) {
      try {
        const parsed = JSON.parse(content);
        return new Response(
          JSON.stringify(parsed),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      } catch (e) {
        console.error('Failed to parse content:', e);
      }
    }

    return new Response(
      JSON.stringify({ error: 'Impossible d\'extraire les données du PDF' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in extract-quote:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});