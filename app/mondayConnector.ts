export async function syncMonday(accessToken: string) {
  const response = await fetch('https://api.monday.com/v2', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': accessToken,
    },
    body: JSON.stringify({
      query: `query { boards(limit: 20) { id name groups { id title } items_page(limit: 500) { items { id name group { id title } column_values { id text type } created_at updated_at } } } }`
    }),
  });

  const data = await response.json();
  const boards = data?.data?.boards || [];
  const maintenant = new Date();

  let totalTaches = 0, tachesDone = 0, tachesEnRetard = 0, totalRetardJours = 0;
  const employes = new Set<string>();
  let totalAssignations = 0;
  let totalFermes = 0, totalGagnes = 0, totalCycleVente = 0;
  let valeurPipeline = 0, nbLeads = 0;

  for (const board of boards) {
    const nomBoard = board.name.toLowerCase();
    if (nomBoard.includes('subitems') || nomBoard.includes('welcome') || nomBoard.includes('developer')) continue;

    const estPipeline = nomBoard.includes('pipeline') || nomBoard.includes('vente') || 
                        nomBoard.includes('customer') || nomBoard.includes('crm') ||
                        nomBoard.includes('lead') || nomBoard.includes('client') ||
                        nomBoard.includes('project');

    for (const item of board.items_page?.items || []) {
      const groupNom = item.group?.title?.toLowerCase() || '';
      const statusCols = item.column_values?.filter((c: any) => c.type === 'status') || [];
      const statusText = statusCols[0]?.text?.toLowerCase() || '';
      const dateCol = item.column_values?.find((c: any) => c.type === 'date' && c.text);
      const montantCol = item.column_values?.find((c: any) => c.type === 'numbers' && c.text);
      const personneCol = item.column_values?.find((c: any) => c.type === 'people' && c.text);

      if (estPipeline && (groupNom.includes('vente') || groupNom.includes('won') || groupNom.includes('lost') || groupNom.includes('lead'))) {
        const estGagne = statusText.includes('won') || (groupNom.includes('vente') && statusText.includes('won'));
        const estPerdu = statusText.includes('lost') || groupNom.includes('lost');
        const estLead  = groupNom.includes('lead');

        if (estGagne) {
          totalFermes++; totalGagnes++;
          if (item.created_at) {
            const debut = new Date(item.created_at);
            const fin = new Date(item.updated_at || maintenant);
            totalCycleVente += (fin.getTime() - debut.getTime()) / (1000 * 60 * 60 * 24);
          }
        } else if (estPerdu) {
          totalFermes++;
        } else if (estLead) {
          nbLeads++;
          if (montantCol?.text) {
            const montant = parseFloat(montantCol.text.replace(/[^0-9.]/g, ''));
            if (!isNaN(montant)) valeurPipeline += montant;
          }
        }
      } else {
        totalTaches++;
        const estDone = ['done', 'terminé', 'complété', 'completed'].some(s => statusText.includes(s));
        const dateEcheance = dateCol?.text ? new Date(dateCol.text) : null;
        const estEnRetard = !estDone && dateEcheance && dateEcheance < maintenant;

        if (estDone) tachesDone++;
        if (estEnRetard) {
          tachesEnRetard++;
          const retardJours = Math.floor((maintenant.getTime() - dateEcheance!.getTime()) / (1000 * 60 * 60 * 24));
          totalRetardJours += retardJours;
        }
        if (personneCol?.text) { employes.add(personneCol.text); totalAssignations++; }
      }
    }
  }

  const completionatem   = totalTaches > 0 ? Math.round((tachesDone / totalTaches) * 100) : 0;
  const projetsretardPct = totalTaches > 0 ? Math.round((tachesEnRetard / totalTaches) * 100) : 0;
  const retardMoyenJours = tachesEnRetard > 0 ? Math.round(totalRetardJours / tachesEnRetard) : 0;
  const utilisationEquipe = employes.size > 0 ? Math.min(95, Math.round((totalAssignations / (employes.size * 8)) * 100)) : 75;
  const tauxConversion   = totalFermes > 0 ? Math.round((totalGagnes / totalFermes) * 100) : 0;
  const cycleVente       = totalGagnes > 0 ? Math.round(totalCycleVente / totalGagnes) : 30;
  const pipelineRatio    = Math.round((valeurPipeline / 50000) * 10) / 10;

  return {
    succes: true,
    syncAt: new Date().toISOString(),
    debug: { totalTaches, tachesDone, tachesEnRetard, retardMoyenJours, totalFermes, totalGagnes, valeurPipeline, nbLeads, tauxConversion, cycleVente, pipelineRatio },
    indicateurs: {
      operations: { completionatem, projetsretard: projetsretardPct, utilisationequipe: utilisationEquipe, delailivraison: retardMoyenJours },
      ventes: { tauxconversion: tauxConversion, cyclevente: cycleVente, pipeline: pipelineRatio, retention: 85 }
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
