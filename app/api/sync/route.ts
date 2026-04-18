import { NextResponse } from 'next/server';

export async function POST() {
  try {
    const { getSupabase } = await import('../../lib/supabase');
    const supabase = getSupabase();

    const { data: integration } = await supabase
      .from('integrations')
      .select('access_token')
      .eq('organisation_id', '11111111-1111-1111-1111-111111111111')
      .eq('outil', 'monday')
      .single();

    if (!integration?.access_token) {
      return NextResponse.json({ erreur: 'Monday non connecté' }, { status: 400 });
    }

    const { syncMonday } = await import('../../mondayConnector');
    const resultat = await syncMonday(integration.access_token);
    const ind = resultat.indicateurs;
    const dbg = resultat.debug as any;

    await supabase.from('indicateurs').upsert({
      organisation_id:      '11111111-1111-1111-1111-111111111111',
      pilier:               'operations',
      periode:              new Date().toISOString().slice(0, 7),
      completion_a_temps:   ind.operations.completionatem,
      projets_retard_pct:   ind.operations.projetsretard,
      utilisation_equipe:   ind.operations.utilisationequipe,
      retard_livraison_pct: ind.operations.delailivraison,
    }, { onConflict: 'organisation_id,pilier,periode' });

    await supabase.from('indicateurs').upsert({
      organisation_id:   '11111111-1111-1111-1111-111111111111',
      pilier:            'ventes',
      periode:           new Date().toISOString().slice(0, 7),
      taux_conversion:   ind.ventes.tauxconversion,
      cycle_vente_jours: ind.ventes.cyclevente,
      pipeline_ratio:    ind.ventes.pipeline,
      retention_client:  ind.ventes.retention,
    }, { onConflict: 'organisation_id,pilier,periode' });

    await supabase.from('integrations')
      .update({ derniere_sync: new Date().toISOString() })
      .eq('organisation_id', '11111111-1111-1111-1111-111111111111')
      .eq('outil', 'monday');

    return NextResponse.json({
      succes: true,
      syncAt: new Date().toISOString(),
      indicateurs: ind,
      vendeurs: resultat.vendeurs,
      details: {
        operations: {
          tachesTotales:    dbg.totalTaches,
          tachesDone:       dbg.tachesDone,
          tachesEnRetard:   dbg.tachesEnRetard,
          retardMoyenJours: dbg.retardMoyenJours,
        },
        ventes: {
          dealsFermes:    dbg.totalFermes,
          dealsGagnes:    dbg.totalGagnes,
          dealsPerdus:    dbg.totalPerdus,
          valeurGagnee:   dbg.valeurGagnee,
          valeurPipeline: dbg.valeurPipeline,
          valeurPerdue:   dbg.valeurPerdue,
          nbLeads:        dbg.nbLeads,
          tauxConversion: dbg.tauxConversion,
          cycleVente:     dbg.cycleVente,
        }
      }
    });

  } catch (e: any) {
    return NextResponse.json({ erreur: e.message }, { status: 500 });
  }
}
