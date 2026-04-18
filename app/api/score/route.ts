import { NextResponse } from 'next/server';

const PILIERS_CONFIG: Record<string, any> = {
  finances: {
    label: 'Finances', poids: 0.35,
    indicateurs: {
      dso:              { poids: 0.30, calculer: (v: number) => v <= 25 ? 100 : v <= 35 ? 85 : v <= 45 ? 65 : v <= 60 ? 40 : 15 },
      margebrute:       { poids: 0.25, calculer: (v: number) => v >= 50 ? 100 : v >= 40 ? 85 : v >= 30 ? 65 : v >= 20 ? 40 : 15 },
      tresorerie:       { poids: 0.25, calculer: (v: number) => v >= 90 ? 100 : v >= 60 ? 85 : v >= 30 ? 60 : v >= 15 ? 35 : 10 },
      croissancerevenu: { poids: 0.20, calculer: (v: number) => v >= 10 ? 100 : v >= 5 ? 85 : v >= 0 ? 65 : v >= -5 ? 35 : 10 },
    },
  },
  ventes: {
    label: 'Ventes', poids: 0.25,
    indicateurs: {
      tauxconversion: { poids: 0.35, calculer: (v: number) => v >= 30 ? 100 : v >= 20 ? 80 : v >= 15 ? 60 : v >= 10 ? 40 : 15 },
      retention:      { poids: 0.30, calculer: (v: number) => v >= 90 ? 100 : v >= 80 ? 80 : v >= 70 ? 55 : v >= 60 ? 30 : 10 },
      cyclevente:     { poids: 0.20, calculer: (v: number) => v <= 20 ? 100 : v <= 30 ? 85 : v <= 45 ? 65 : v <= 60 ? 40 : 15 },
      pipeline:       { poids: 0.15, calculer: (v: number) => v >= 3 ? 100 : v >= 2 ? 80 : v >= 1.5 ? 60 : v >= 1 ? 35 : 10 },
    },
  },
  operations: {
    label: 'Opérations', poids: 0.20,
    indicateurs: {
      completionatem:    { poids: 0.35, calculer: (v: number) => v >= 90 ? 100 : v >= 80 ? 85 : v >= 70 ? 65 : v >= 60 ? 40 : 15 },
      projetsretard:     { poids: 0.30, calculer: (v: number) => v === 0 ? 100 : v <= 10 ? 80 : v <= 20 ? 60 : v <= 35 ? 35 : 10 },
      utilisationequipe: { poids: 0.20, calculer: (v: number) => (v >= 70 && v <= 85) ? 100 : (v >= 60 && v < 70) ? 75 : (v > 85 && v <= 90) ? 75 : 20 },
      delailivraison:    { poids: 0.15, calculer: (v: number) => v <= 0 ? 100 : v <= 10 ? 80 : v <= 20 ? 60 : v <= 35 ? 35 : 10 },
    },
  },
  rh: {
    label: 'RH', poids: 0.10,
    indicateurs: {
      roulement:    { poids: 0.35, calculer: (v: number) => v <= 5 ? 100 : v <= 10 ? 80 : v <= 15 ? 55 : v <= 25 ? 30 : 10 },
      satisfaction: { poids: 0.30, calculer: (v: number) => v >= 8.5 ? 100 : v >= 7.5 ? 80 : v >= 6.5 ? 60 : v >= 5 ? 35 : 10 },
      absenteisme:  { poids: 0.20, calculer: (v: number) => v <= 1.5 ? 100 : v <= 2.5 ? 80 : v <= 4 ? 55 : v <= 6 ? 30 : 10 },
      recrutement:  { poids: 0.15, calculer: (v: number) => v <= 20 ? 100 : v <= 30 ? 80 : v <= 45 ? 60 : v <= 60 ? 35 : 10 },
    },
  },
  marketing: {
    label: 'Marketing', poids: 0.10,
    indicateurs: {
      cpl:           { poids: 0.30, calculer: (v: number) => v <= 40 ? 100 : v <= 60 ? 85 : v <= 80 ? 70 : v <= 100 ? 45 : 20 },
      conversionweb: { poids: 0.25, calculer: (v: number) => v >= 5 ? 100 : v >= 3 ? 80 : v >= 1.5 ? 60 : v >= 0.5 ? 35 : 10 },
      roi:           { poids: 0.25, calculer: (v: number) => v >= 5 ? 100 : v >= 3.5 ? 85 : v >= 2.5 ? 65 : v >= 1.5 ? 40 : 10 },
      trafic:        { poids: 0.20, calculer: (v: number) => v >= 15 ? 100 : v >= 8 ? 80 : v >= 0 ? 60 : v >= -5 ? 35 : 10 },
    },
  },
};

function getStatut(score: number) {
  if (score >= 80) return { label: 'Fort',        couleur: 'vert' };
  if (score >= 65) return { label: 'Bon',          couleur: 'vert' };
  if (score >= 50) return { label: 'À améliorer',  couleur: 'orange' };
  if (score >= 35) return { label: 'Faible',       couleur: 'rouge' };
  return               { label: 'Critique',      couleur: 'rouge' };
}

function calculerScore(donnees: Record<string, any>) {
  const piliers: Record<string, any> = {};
  const alertes: any[] = [];
  let scoreGlobalTotal = 0;
  let poidsTotal = 0;

  for (const [pilierKey, config] of Object.entries(PILIERS_CONFIG)) {
    const donneesPilier = donnees[pilierKey] || {};
    let scoreTotal = 0;
    let poidsPilier = 0;

    for (const [indKey, indConfig] of Object.entries(config.indicateurs as Record<string, any>)) {
      const val = donneesPilier[indKey];
      if (val === undefined || val === null) continue;
      const score = Math.round(indConfig.calculer(val));
      scoreTotal  += score * indConfig.poids;
      poidsPilier += indConfig.poids;
      if (score < 40) alertes.push({ niveau: 'rouge',  pilier: config.label, message: `${indKey} en zone critique (${val})` });
      else if (score < 60) alertes.push({ niveau: 'orange', pilier: config.label, message: `${indKey} à surveiller (${val})` });
    }

    const scorePilier = poidsPilier > 0 ? Math.round(scoreTotal / poidsPilier) : null;
    piliers[pilierKey] = { label: config.label, score: scorePilier, statut: scorePilier ? getStatut(scorePilier) : null };
    if (scorePilier !== null) { scoreGlobalTotal += scorePilier * config.poids; poidsTotal += config.poids; }
  }

  const scoreGlobal = poidsTotal > 0 ? Math.round(scoreGlobalTotal / poidsTotal) : 0;
  return {
    scoreGlobal,
    statut: getStatut(scoreGlobal),
    piliers,
    alertes: alertes.sort((a, b) => a.niveau === 'rouge' ? -1 : 1),
    periode: new Date().toISOString().slice(0, 7),
  };
}

const DONNEES_DEMO: Record<string, any> = {
  finances:   { dso: 38, margebrute: 43, tresorerie: 33, croissancerevenu: 8 },
  ventes:     { tauxconversion: 18, retention: 88, cyclevente: 42, pipeline: 2.1 },
  operations: { completionatem: 62, projetsretard: 27, utilisationequipe: 78, delailivraison: 27 },
  rh:         { roulement: 18, satisfaction: 6.8, absenteisme: 4.2, recrutement: 32 },
  marketing:  { cpl: 68, conversionweb: 3.2, roi: 3.1, trafic: 12 },
};

export async function GET() {
  const resultat = calculerScore(DONNEES_DEMO);
  return NextResponse.json(resultat);
}

export async function POST(request: Request) {
  const donnees = await request.json();
  const resultat = calculerScore(donnees);
  return NextResponse.json(resultat);
}
