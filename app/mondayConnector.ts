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
  let valeurGagnee = 0, valeurPerdue = 0, totalPerdus = 0;

  // Par vendeur
  const vendeurs: Record<string, {
    nom: string, won: number, lost: number, actifs: number,
    valeurGagnee: number, valeurPipeline: number, totalCycle: number
  }> = {};

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
      const vendeurNom = personneCol?.text || 'Non assigné';
      const montant = montantCol?.text ? parseFloat(montantCol.text.replace(/[^0-9.]/g, '')) || 0 : 0;

      if (estPipeline && (groupNom.includes('vente') || groupNom.includes('won') ||
          groupNom.includes('lost') || groupNom.includes('lead'))) {

        const estGagne = statusText.includes('won') || groupNom.includes('vente') && statusText.includes('won');
        const estPerdu = statusText.includes('lost') || groupNom.includes('lost');
        const estLead  = groupNom.includes('lead');

        // Initialiser vendeur
        if (!vendeurs[vendeurNom]) {
          vendeurs[vendeurNom] = { nom: vendeurNom, won: 0, lost: 0, actifs: 0, valeurGagnee: 0, valeurPipeline: 0, totalCycle: 0 };
        }

        if (estGagne) {
          totalFermes++; totalGagnes++; valeurGagnee += montant;
          vendeurs[vendeurNom].won++;
          vendeurs[vendeurNom].valeurGagnee += montant;
          if (item.created_at) {
            const debut = new Date(item.created_at);
            const fin = new Date(item.updated_at || maintenant);
            const cycle = (fin.getTime() - debut.getTime()) / (1000 * 60 * 60 * 24);
            totalCycleVente += cycle;
            vendeurs[vendeurNom].totalCycle += cycle;
          }
        } else if (estPerdu) {
          totalFermes++; totalPerdus++; valeurPerdue += montant;
          vendeurs[vendeurNom].lost++;
        } else if (estLead) {
          nbLeads++; valeurPipeline += montant;
          vendeurs[vendeurNom].actifs++;
          vendeurs[vendeurNom].valeurPipeline += montant;
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

  const completionatem    = totalTaches > 0 ? Math.round((tachesDone / totalTaches) * 100) : 0;
  const projetsretardPct  = totalTaches > 0 ? Math.round((tachesEnRetard / totalTaches) * 100) : 0;
  const retardMoyenJours  = tachesEnRetard > 0 ? Math.round(totalRetardJours / tachesEnRetard) : 0;
  const utilisationEquipe = employes.size > 0 ? Math.min(95, Math.round((totalAssignations / (employes.size * 8)) * 100)) : 75;
  const tauxConversion    = totalFermes > 0 ? Math.round((totalGagnes / totalFermes) * 100) : 0;
  const cycleVente        = totalGagnes > 0 ? Math.round(totalCycleVente / totalGagnes) : 30;
  const pipelineRatio     = Math.round((valeurPipeline / 50000) * 10) / 10;

  // Formater vendeurs
  const vendeursFormats = Object.values(vendeurs).map(v => ({
    nom:           v.nom,
    won:           v.won,
    lost:          v.lost,
    actifs:        v.actifs,
    valeurGagnee:  v.valeurGagnee,
    valeurPipeline: v.valeurPipeline,
    conversion:    (v.won + v.lost) > 0 ? Math.round((v.won / (v.won + v.lost)) * 100) : 0,
    cycleVente:    v.won > 0 ? Math.round(v.totalCycle / v.won) : 0,
  })).filter(v => v.nom !== 'Non assigné');

  return {
    succes: true,
    syncAt: new Date().toISOString(),
    debug: {
      totalTaches, tachesDone, tachesEnRetard, retardMoyenJours,
      totalFermes, totalGagnes, totalPerdus, valeurPipeline,
      valeurGagnee, valeurPerdue, nbLeads, tauxConversion, cycleVente,
    },
    indicateurs: {
      operations: { completionatem, projetsretard: projetsretardPct, utilisationequipe: utilisationEquipe, delailivraison: retardMoyenJours },
      ventes: { tauxconversion: tauxConversion, cyclevente: cycleVente, pipeline: pipelineRatio, retention: 85 }
    },
    vendeurs: vendeursFormats,
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
