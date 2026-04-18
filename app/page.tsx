'use client';

import { useState, useEffect } from 'react';

const niveauCouleur = { rouge: '#E24B4A', orange: '#EF9F27', vert: '#639922' };
const pilierCouleur = {
  finances:   { color: '#3B6D11', bg: '#EAF3DE' },
  ventes:     { color: '#854F0B', bg: '#FAEEDA' },
  operations: { color: '#854F0B', bg: '#FAEEDA' },
  rh:         { color: '#A32D2D', bg: '#FCEBEB' },
  marketing:  { color: '#0F6E56', bg: '#E1F5EE' },
};

export default function Dashboard() {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/score')
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return (
    <main style={{ fontFamily: 'system-ui', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 18, fontWeight: 500, color: '#534AB7' }}>OrgaSanté</div>
        <div style={{ fontSize: 13, color: '#888780', marginTop: 8 }}>Calcul du score en cours...</div>
      </div>
    </main>
  );

  if (!data) return (
    <main style={{ fontFamily: 'system-ui', padding: 24 }}>
      <p style={{ color: '#E24B4A' }}>Erreur de chargement — vérifie la console.</p>
    </main>
  );

  const scoreGlobal = data.scoreGlobal;
  const piliers     = Object.entries(data.piliers);
  const alertes     = data.alertes.slice(0, 5);

  return (
    <main style={{ fontFamily: 'system-ui, sans-serif', maxWidth: 900, margin: '0 auto', padding: '24px 16px', color: '#2C2C2A' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 500, margin: 0, color: '#534AB7' }}>OrgaSanté</h1>
          <p style={{ fontSize: 13, color: '#888780', margin: '4px 0 0' }}>
            Entreprise Exemple inc. — Période : {data.periode}
          </p>
        </div>
        <span style={{ background: data.statut.couleur === 'vert' ? '#EAF3DE' : data.statut.couleur === 'orange' ? '#FAEEDA' : '#FCEBEB',
                       color:      data.statut.couleur === 'vert' ? '#27500A' : data.statut.couleur === 'orange' ? '#633806' : '#791F1F',
                       fontSize: 12, padding: '4px 14px', borderRadius: 999, fontWeight: 500 }}>
          {data.statut.label}
        </span>
      </div>

      {/* Score + Piliers */}
      <div style={{ display: 'grid', gridTemplateColumns: '160px 1fr', gap: 16, marginBottom: 16 }}>

        {/* Score donut */}
        <div style={{ background: 'white', border: '0.5px solid #D3D1C7', borderRadius: 12, padding: 20,
                      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
          <p style={{ fontSize: 12, color: '#888780', margin: 0, fontWeight: 500 }}>Score de santé</p>
          <div style={{ position: 'relative', width: 100, height: 100 }}>
            <svg viewBox="0 0 100 100" style={{ width: 100, height: 100, transform: 'rotate(-90deg)' }}>
              <circle cx="50" cy="50" r="40" fill="none" stroke="#F1EFE8" strokeWidth="16" />
              <circle cx="50" cy="50" r="40" fill="none"
                stroke={scoreGlobal >= 65 ? '#639922' : scoreGlobal >= 50 ? '#EF9F27' : '#E24B4A'}
                strokeWidth="16"
                strokeDasharray={`${scoreGlobal * 2.513} 251.3`}
                strokeLinecap="round" />
            </svg>
            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', textAlign: 'center' }}>
              <div style={{ fontSize: 22, fontWeight: 500, color: '#BA7517', lineHeight: 1 }}>{scoreGlobal}</div>
              <div style={{ fontSize: 10, color: '#888780' }}>/ 100</div>
            </div>
          </div>
          <span style={{ background: '#FAEEDA', color: '#633806', fontSize: 11, padding: '2px 10px', borderRadius: 999, fontWeight: 500 }}>
            {data.statut.label}
          </span>
        </div>

        {/* Piliers */}
        <div style={{ background: 'white', border: '0.5px solid #D3D1C7', borderRadius: 12, padding: '16px 20px' }}>
          <p style={{ fontSize: 13, fontWeight: 500, margin: '0 0 14px' }}>Score par pilier</p>
          {piliers.map(([key, p]) => {
            const c = pilierCouleur[key] || { color: '#534AB7', bg: '#EEEDFE' };
            return (
              <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                <span style={{ fontSize: 13, width: 85, flexShrink: 0 }}>{p.label}</span>
                <div style={{ flex: 1, background: '#F1EFE8', borderRadius: 999, height: 8, overflow: 'hidden' }}>
                  <div style={{ width: `${p.score}%`, height: 8, borderRadius: 999, background: c.color, transition: 'width 0.8s ease' }} />
                </div>
                <span style={{ fontSize: 13, fontWeight: 500, color: c.color, width: 55, textAlign: 'right', flexShrink: 0 }}>
                  {p.score} / 100
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Alertes */}
      <div style={{ background: 'white', border: '0.5px solid #D3D1C7', borderRadius: 12, padding: '16px 20px', marginBottom: 16 }}>
        <p style={{ fontSize: 13, fontWeight: 500, margin: '0 0 10px' }}>
          Alertes IA — {alertes.filter(a => a.niveau === 'rouge').length} critiques
        </p>
        {alertes.map((a, i) => (
          <div key={i} style={{ display: 'flex', gap: 10, padding: '8px 0',
                                borderBottom: i < alertes.length - 1 ? '0.5px solid #F1EFE8' : 'none' }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: niveauCouleur[a.niveau],
                           flexShrink: 0, marginTop: 5 }} />
            <div>
              <div style={{ fontSize: 13, fontWeight: 500 }}>{a.pilier}</div>
              <div style={{ fontSize: 11, color: '#888780' }}>{a.message}</div>
            </div>
          </div>
        ))}
        {alertes.length === 0 && (
          <p style={{ fontSize: 13, color: '#639922', margin: 0 }}>Aucune alerte — tout est dans les cibles !</p>
        )}
      </div>

      {/* Sources */}
      <div style={{ background: 'white', border: '0.5px solid #D3D1C7', borderRadius: 12, padding: '16px 20px' }}>
        <p style={{ fontSize: 13, fontWeight: 500, margin: '0 0 10px' }}>Sources connectées</p>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {[
            { nom: 'QuickBooks', connecte: true },
            { nom: 'Monday.com', connecte: true },
            { nom: 'HubSpot',    connecte: false },
            { nom: 'Google Analytics', connecte: false },
          ].map(s => (
            <div key={s.nom} style={{ display: 'flex', alignItems: 'center', gap: 8,
                                      padding: '8px 12px', background: '#F1EFE8', borderRadius: 8 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%',
                             background: s.connecte ? '#639922' : '#B4B2A9' }} />
              <span style={{ fontSize: 13, color: s.connecte ? '#2C2C2A' : '#888780' }}>{s.nom}</span>
            </div>
          ))}
        </div>
      </div>

    </main>
  );
}
