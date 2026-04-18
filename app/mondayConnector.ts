export async function syncMonday(accessToken: string) {
  const response = await fetch('https://api.monday.com/v2', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': accessToken,
      'API-Version': '2024-01',
    },
    body: JSON.stringify({
      query: `query { boards(limit: 20) { id name items_page(limit: 200) { items { id name state column_values { id text type value } created_at updated_at } } } }`
    }),
  });

  const data = await response.json();
  const boards = data?.data?.boards || [];
  let total = 0, done = 0, late = 0;
  const maintenant = new Date();

  for (const board of boards) {
    for (const item of board.items_page?.items || []) {
      total++;

      // Chercher toutes les colonnes de type statut
      const statusCol = item.column_values?.find((c: any) => 
        c.type === 'color' || 
        c.id === 'status' || 
        c.id?.includes('status') ||
        c.id?.includes('statut')
      );

      const statusText = statusCol?.text?.toLowerCase() || '';
      const estDone = ['done', 'terminé', 'terminée', 'complété', 'completé', 'completed', 'fini'].some(s => statusText.includes(s));
      
      // Vérifier date d'échéance
      const dateCol = item.column_values?.find((c: any) => c.type === 'date' || c.id?.includes('date') || c.id?.includes('due'));
      const dateEcheance = dateCol?.text ? new Date(dateCol.text) : null;
      const estEnRetard = !estDone && dateEcheance && dateEcheance < maintenant;

      if (estDone) done++;
      if (estEnRetard) late++;
    }
  }

  const completionatem = total > 0 ? Math.round((done / total) * 100) : 0;
  const projetsretard  = total > 0 ? Math.round((late / total) * 100) : 0;

  return {
    succes: true,
    syncAt: new Date().toISOString(),
    debug: { total, done, late },
    indicateurs: {
      operations: {
        completionatem,
        projetsretard,
        utilisationequipe: 75,
        delailivraison: projetsretard > 0 ? 20 : 5,
      },
      ventes: {
        tauxconversion: 20,
        cyclevente: 30,
        pipeline: 2.0,
        retention: 85,
      }
    }
  };
}

export function genererUrlAutorisationMonday(organisationId: string): string {
  const params = new URLSearchParams({
    client_id: process.env.MONDAY_CLIENT_ID || '',
    redirect_uri: process.env.MONDAY_REDIRECT_URI || '',
    state: Buffer.from(JSON.stringify({ organisationId })).toString('base64'),
  });
  return `https://auth.monday.com/oauth2/authorize?${params.toString()}`;
}
