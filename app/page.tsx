'use client';

import { useState } from 'react';

const piliers = [
  { key: 'finances',   label: 'Finances',   score: 81, color: '#3B6D11', bg: '#EAF3DE' },
  { key: 'ventes',     label: 'Ventes',     score: 68, color: '#854F0B', bg: '#FAEEDA' },
  { key: 'operations', label: 'Opérations', score: 64, color: '#854F0B', bg: '#FAEEDA' },
  { key: 'rh',         label: 'RH',         score: 58, color: '#A32D2D', bg: '#FCEBEB' },
  { key: 'marketing',  label: 'Marketing',  score: 71, color: '#0F6E56', bg: '#E1F5EE' },
];

const alertes = [
  { niveau: 'rouge',  titre: 'DSO en hausse',            detail: '38j vs 28j — risque trésorerie' },
  { niveau: 'orange', titre: 'Conversion en baisse',      detail: '18% vs 26% historique' },
  { niveau: 'orange', titre: '3 projets en retard',       detail: 'Délai moyen 12 jours' },
  { niveau: 'rouge',  titre: 'Roulement RH élevé',        detail: '18% annualisé — priorité' },
  { niveau: 'vert',   titre: 'Trafic web +12%',           detail: 'Marketing en progression' },
];

const kpis = [
  { val: '187 k$', lbl: 'Revenus (30j)' },
  { val: '38 j',   lbl: 'DSO moyen' },
  { val: '62 %',   lbl: 'Tâches à temps' },
  { val: '18 %',   lbl: 'Taux conversion' },
  { val: '1 840',  lbl: 'Visites web/mois' },
  { val: '6.8',    lbl: 'Satisfaction RH /10' },
];

const niveauCouleur: Record<string, string> = {
  rouge:  '#E24B4A',
  orange: '#EF9F27',
  vert:   '#639922',
};

export default function Dashboard() {
  const [periode, setPeriode] = useState('30 derniers jours');
  const scoreGlobal = 73;

  return (
    <main style={{ fontFamily: 'system-ui, sans-serif', maxWidth: 900, margin: '0 auto', padding: '24px 16px', color: '#2C2C2A' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 500, margin: 0 }}>OrgaSanté</h1>
          <p style={{ fontSize: 13, color: '#888780', margin: '4px 0 0' }}>Entreprise Exemple inc. — Mis à jour aujourd'hui</p>
        </div>
        <select
          value={periode}
          onChange={e => setPeriode(e.target.value)}
          style={{ fontSize: 13, padding: '6px 10px', borderRadius: 8, border: '0.5px solid #D3D1C7', background: 'white' }}
        >
          <option>30 derniers jours</option>
          <option>90 derniers jours</option>
          <option>Cette année</option>
        </select>
      </div>

      {/* Score global + KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: '160px 1fr', gap: 16, marginBottom: 16 }}>

        {/* Donut score */}
        <div style={{ background: 'white', border: '0.5px solid #D3D1C7', borderRadius: 12, padding: 20, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
          <p style={{ fontSize: 12, color: '#888780', margin: 0, fontWeight: 500 }}>Score de santé</p>
          <div style={{ position: 'relative', width: 100, height: 100 }}>
            <svg viewBox="0 0 100 100" style={{ width: 100, height: 100, transform: 'rotate(-90deg)' }}>
              <circle cx="50" cy="50" r="40" fill="none" stroke="#F1EFE8" strokeWidth="16" />
              <circle cx="50" cy="50" r="40" fill="none" stroke="#EF9F27" strokeWidth="16"
                strokeDasharray={`${scoreGlobal * 2.513} 251.3`} strokeLinecap="round" />
            </svg>
            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', textAlign: 'center' }}>
              <div style={{ fontSize: 22, fontWeight: 500, color: '#BA7517', lineHeight: 1 }}>{scoreGlobal}</div>
              <div style={{ fontSize: 10, color: '#888780' }}>/ 100</div>
            </div>
          </div>
          <span style={{ background: '#FAEEDA', color: '#633806', fontSize: 11, padding: '2px 10px', borderRadius: 999, fontWeight: 500 }}>
            +4 pts ce mois
          </span>
        </div>

        {/* KPIs */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
            {kpis.map(k => (
              <div key={k.lbl} style={{ background: '#F1EFE8', borderRadius: 8, padding: '10px 12px' }}>
                <div style={{ fontSize: 18, fontWeight: 500 }}>{k.val}</div>
                <div style={{ fontSize: 11, color: '#888780', marginTop: 2 }}>{k.lbl}</div>
              </div>
            ))}
          </div>

          {/* Piliers */}
          <div style={{ background: 'white', border: '0.5px solid #D3D1C7', borderRadius: 12, padding: '12px 16px' }}>
            <p style={{ fontSize: 13, fontWeight: 500, margin: '0 0 10px' }}>Score par pilier</p>
            {piliers.map(p => (
              <div key={p.key} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <span style={{ fontSize: 13, width: 80, flexShrink: 0 }}>{p.label}</span>
                <div style={{ flex: 1, background: '#F1EFE8', borderRadius: 999, height: 8, overflow: 'hidden' }}>
                  <div style={{ width: `${p.score}%`, height: 8, borderRadius: 999, background: p.color }} />
                </div>
                <span style={{ fontSize: 13, fontWeight: 500, color: p.color, width: 52, textAlign: 'right', flexShrink: 0 }}>{p.score} / 100</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Alertes */}
      <div style={{ background: 'white', border: '0.5px solid #D3D1C7', borderRadius: 12, padding: '12px 16px', marginBottom: 16 }}>
        <p style={{ fontSize: 13, fontWeight: 500, margin: '0 0 8px' }}>Alertes IA</p>
        {alertes.map((a, i) => (
          <div key={i} style={{ display: 'flex', gap: 10, padding: '8px 0', borderBottom: i < alertes.length - 1 ? '0.5px solid #F1EFE8' : 'none' }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: niveauCouleur[a.niveau], flexShrink: 0, marginTop: 5 }} />
            <div>
              <div style={{ fontSize: 13, fontWeight: 500 }}>{a.titre}</div>
              <div style={{ fontSize: 11, color: '#888780' }}>{a.detail}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Sources */}
      <div style={{ background: 'white', border: '0.5px solid #D3D1C7', borderRadius: 12, padding: '12px 16px' }}>
        <p style={{ fontSize: 13, fontWeight: 500, margin: '0 0 10px' }}>Sources connectées</p>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {[
            { nom: 'QuickBooks', statut: true },
            { nom: 'Monday.com', statut: true },
            { nom: 'HubSpot',    statut: false },
            { nom: 'Google Analytics', statut: false },
          ].map(s => (
            <div key={s.nom} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', background: '#F1EFE8', borderRadius: 8 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: s.statut ? '#639922' : '#B4B2A9' }} />
              <span style={{ fontSize: 13, color: s.statut ? '#2C2C2A' : '#888780' }}>{s.nom}</span>
            </div>
          ))}
        </div>
      </div>

    </main>
  );
}
