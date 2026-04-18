'use client';

import { useState, useEffect } from 'react';

const niveauCouleur: Record<string, string> = { rouge: '#E24B4A', orange: '#EF9F27', vert: '#639922' };
const pilierCouleur: Record<string, { color: string; bg: string }> = {
  finances:   { color: '#3B6D11', bg: '#EAF3DE' },
  ventes:     { color: '#854F0B', bg: '#FAEEDA' },
  operations: { color: '#854F0B', bg: '#FAEEDA' },
  rh:         { color: '#A32D2D', bg: '#FCEBEB' },
  marketing:  { color: '#0F6E56', bg: '#E1F5EE' },
};

export default function Dashboard() {
  const [data, setData]             = useState<any>(null);
  const [loading, setLoading]       = useState(true);
  const [mondayUrl, setMondayUrl]   = useState('');
  const [mondayConnecte, setMondayConnecte] = useState(false);
  const [message, setMessage]       = useState('');

  useEffect(() => {
    // Vérifier si Monday vient d'être connecté
    const params = new URLSearchParams(window.location.search);
    if (params.get('monday') === 'connecte') {
      setMondayConnecte(true);
      setMessage('Monday.com connecté avec succès !');
      window.history.replaceState({}, '', '/');
    }
    if (params.get('erreur')) {
      setMessage('Erreur de connexion — réessaie.');
      window.history.replaceState({}, '', '/');
    }

    // Charger le score
    fetch('/api/score')
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));

    // Charger l'URL Monday
    fetch('/api/monday')
      .then(r => r.json())
      .then(d => setMondayUrl(d.authUrl))
      .catch(() => {});
  }, []);

  const connecterMonday = () => {
    if (mondayUrl) window.location.href = mondayUrl;
  };

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
      <p style={{ color: '#E24B4A' }}>Erreur de chargement.</p>
    </main>
  );

  const scoreGlobal = data.scoreGlobal;
  const piliers     = Object.entries(data.piliers);
  const alertes     = data.alertes.slice(0, 5);

  return (
    <main style={{ fontFamily: 'system-ui, sans-serif', maxWidth: 900, margin: '0 auto', padding: '24px 16px', color: '#2C2C2A' }}>

      {message && (
        <div style={{ background: mondayConnecte ? '#EAF3DE' : '#FCEBEB', color: mondayConnecte ? '#27500A' : '#791F1F',
                      padding: '10px 16px', borderRadius: 8, marginBottom: 16, fontSize: 13, fontWeight: 500 }}>
          {message}
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 500, margin: 0, color: '#534AB7' }}>OrgaSanté</h1>
          <p style={{ fontSize: 13, color: '#888780', margin: '4px 0 0' }}>Entreprise Exemple inc. — Période : {data.periode}</p>
        </div>
        <span style={{ background: data.statut.couleur === 'vert' ? '#EAF3DE' : data.statut.couleur === 'orange' ? '#FAEEDA' : '#FCEBEB',
                       color: data.statut.couleur === 'vert' ? '#27500A' : data.statut.couleur === 'orange' ? '#633806' : '#791F1F',
                       fontSize: 12, padding: '4px 14px', borderRadius: 999, fontWeight: 500 }}>
          {data.statut.label}
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '160px 1fr', gap: 16, marginBottom: 16 }}>
        <div style={{ background: 'white', border: '0.5px solid #D3D1C7', borderRadius: 12, padding: 20,
                      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
          <p style={{ fontSize: 12, color: '#888780', margin: 0, fontWeight: 500 }}>Score de santé</p>
          <div style={{ position: 'relative', width: 100, height: 100 }}>
            <svg viewBox="0 0 100 100" style={{ width: 100, height: 100, transform: 'rotate(-90deg)' }}>
              <circle cx="50" cy="50" r="40" fill="none" stroke="#F1EFE8" strokeWidth="16" />
              <circle cx="50" cy="50" r="40" fill="none"
                stroke={scoreGlobal >= 65 ? '#639922' : scoreGlobal >= 50 ? '#EF9F27' : '#E24B4A'}
                strokeWidth="16" strokeDasharray={`${scoreGlobal * 2.513} 251.3`} strokeLinecap="round" />
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

        <div style={{ background: 'white', border: '0.5px solid #D3D1C7', borderRadius: 12, padding: '16px 20px' }}>
          <p style={{ fontSize: 13, fontWeight: 500, margin: '0 0 14px' }}>Score par pilier</p>
          {piliers.map(([key, p]: [string, any]) => {
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

      <div style={{ background: 'white', border: '0.5px solid #D3D1C7', borderRadius: 12, padding: '16px 20px', marginBottom: 16 }}>
        <p style={{ fontSize: 13, fontWeight: 500, margin: '0 0 10px' }}>
          Alertes IA — {alertes.filter((a: any) => a.niveau === 'rouge').length} critiques
        </p>
        {alertes.map((a: any, i: number) => (
          <div key={i} style={{ display: 'flex', gap: 10, padding: '8px 0', borderBottom: i < alertes.length - 1 ? '0.5px solid #F1EFE8' : 'none' }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: niveauCouleur[a.niveau], flexShrink: 0, marginTop: 5 }} />
            <div>
              <div style={{ fontSize: 13, fontWeight: 500 }}>{a.pilier}</div>
              <div style={{ fontSize: 11, color: '#888780' }}>{a.message}</div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ background: 'white', border: '0.5px solid #D3D1C7', borderRadius: 12, padding: '16px 20px' }}>
        <p style={{ fontSize: 13, fontWeight: 500, margin: '0 0 10px' }}>Sources de données</p>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', background: '#F1EFE8', borderRadius: 8 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#B4B2A9' }} />
            <span style={{ fontSize: 13, color: '#888780' }}>QuickBooks — bientôt</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px',
                        background: mondayConnecte ? '#EAF3DE' : '#F1EFE8', borderRadius: 8,
                        cursor: mondayConnecte ? 'default' : 'pointer' }}
               onClick={mondayConnecte ? undefined : connecterMonday}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: mondayConnecte ? '#639922' : '#534AB7' }} />
            <span style={{ fontSize: 13, color: mondayConnecte ? '#2C2C2A' : '#534AB7', fontWeight: mondayConnecte ? 400 : 500 }}>
              {mondayConnecte ? 'Monday.com — connecté' : 'Connecter Monday.com →'}
            </span>
          </div>
        </div>
      </div>

    </main>
  );
}
