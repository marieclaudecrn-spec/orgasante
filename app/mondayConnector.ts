export async function syncMonday(accessToken: string) {
  const response = await fetch('https://api.monday.com/v2', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': accessToken,
      'API-Version': '2024-01',
    },
    body: JSON.stringify({
      query: `query { boards(limit: 20) { id name items_page(limit: 200) { items { id name state column_values { id text value } created_at updated_at } } } }`
    }),
  });
  const data = await response.json();
  const boards = data?.data?.boards || [];
  let total = 0, done = 0, late = 0;
  for (const board of boards) {
    for (const item of board.items_page?.items || []) {
      total++;
      const status = item.column_values?.find((c: any) => c.id === 'status')?.text?.toLowerCase() || '';
      if (['done','terminé','complété'].some(s => status.includes(s))) done++;
      else late++;
    }
  }
  return {
    succes: true,
    syncAt: new Date().toISOString(),
    indicateurs: {
      operations: {
        completionatem: total > 0 ? Math.round((done/total)*100) : 0,
        projetsretard: total > 0 ? Math.round((late/total)*100) : 0,
        utilisationequipe: 75,
        delailivraison: 10,
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
