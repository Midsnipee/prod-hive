import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface OrderLine {
  materialName: string;
  quantity: number;
  unitPrice: number;
}

interface QuoteData {
  reference: string;
  supplier: string;
  amount: number;
  description?: string;
  lines: OrderLine[];
  date: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const quoteData: QuoteData = await req.json();
    
    if (!quoteData.reference || !quoteData.supplier || !quoteData.lines) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Generating PDF for quote:', quoteData.reference);

    // Generate HTML for the PDF
    const html = generateQuoteHTML(quoteData);
    
    // Convert HTML to PDF using a service (we'll use a simple HTML response for now)
    // In production, you'd want to use a proper PDF generation service
    
    return new Response(html, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/html',
      },
    });
  } catch (error) {
    console.error('Error generating PDF:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function generateQuoteHTML(data: QuoteData): string {
  const subtotal = data.lines.reduce((sum, line) => sum + (line.quantity * line.unitPrice), 0);
  const taxRate = 0.20;
  const tax = subtotal * taxRate;
  const total = subtotal + tax;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Devis ${data.reference}</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      margin: 40px;
      color: #333;
    }
    .header {
      text-align: center;
      margin-bottom: 40px;
      border-bottom: 2px solid #333;
      padding-bottom: 20px;
    }
    .header h1 {
      margin: 0;
      color: #2563eb;
    }
    .info-section {
      margin-bottom: 30px;
    }
    .info-section h2 {
      font-size: 16px;
      margin-bottom: 10px;
      color: #2563eb;
    }
    .info-grid {
      display: grid;
      grid-template-columns: 150px 1fr;
      gap: 8px;
    }
    .label {
      font-weight: bold;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 20px 0;
    }
    th, td {
      border: 1px solid #ddd;
      padding: 12px;
      text-align: left;
    }
    th {
      background-color: #2563eb;
      color: white;
    }
    .number {
      text-align: right;
    }
    .totals {
      margin-top: 20px;
      float: right;
      width: 300px;
    }
    .totals table {
      margin: 0;
    }
    .totals .grand-total {
      font-size: 18px;
      font-weight: bold;
      background-color: #f3f4f6;
    }
    .footer {
      clear: both;
      margin-top: 60px;
      padding-top: 20px;
      border-top: 1px solid #ddd;
      text-align: center;
      font-size: 12px;
      color: #666;
    }
    @media print {
      body { margin: 0; }
      .no-print { display: none; }
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>DEVIS</h1>
    <p>Référence: ${data.reference}</p>
    <p>Date: ${new Date(data.date).toLocaleDateString('fr-FR')}</p>
  </div>

  <div class="info-section">
    <h2>Fournisseur</h2>
    <div class="info-grid">
      <span class="label">Nom:</span>
      <span>${data.supplier}</span>
    </div>
  </div>

  ${data.description ? `
  <div class="info-section">
    <h2>Description</h2>
    <p>${data.description}</p>
  </div>
  ` : ''}

  <div class="info-section">
    <h2>Détail des articles</h2>
    <table>
      <thead>
        <tr>
          <th>Désignation</th>
          <th class="number">Quantité</th>
          <th class="number">Prix unitaire HT</th>
          <th class="number">Total HT</th>
        </tr>
      </thead>
      <tbody>
        ${data.lines.map(line => `
          <tr>
            <td>${line.materialName}</td>
            <td class="number">${line.quantity}</td>
            <td class="number">${line.unitPrice.toFixed(2)} €</td>
            <td class="number">${(line.quantity * line.unitPrice).toFixed(2)} €</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  </div>

  <div class="totals">
    <table>
      <tr>
        <td>Sous-total HT</td>
        <td class="number">${subtotal.toFixed(2)} €</td>
      </tr>
      <tr>
        <td>TVA (20%)</td>
        <td class="number">${tax.toFixed(2)} €</td>
      </tr>
      <tr class="grand-total">
        <td><strong>Total TTC</strong></td>
        <td class="number"><strong>${total.toFixed(2)} €</strong></td>
      </tr>
    </table>
  </div>

  <div class="footer">
    <p>Document généré automatiquement le ${new Date().toLocaleDateString('fr-FR')}</p>
  </div>

  <div class="no-print" style="margin-top: 40px; text-align: center;">
    <button onclick="window.print()" style="padding: 10px 20px; font-size: 16px; cursor: pointer;">
      Imprimer / Télécharger en PDF
    </button>
  </div>
</body>
</html>
  `;
}
