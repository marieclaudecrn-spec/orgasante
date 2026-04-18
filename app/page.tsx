'use client';

import { useState, useEffect } from 'react';

const pilierCouleur: Record<string, { color: string }> = {
  finances:   { color: '#3B6D11' },
  ventes:     { color: '#854F0B' },
  operations: { color: '#854F0B' },
  rh:         { color: '#A32D2D' },
  marketing:  { color: '#0F6E56' },
};

const niveauCouleur: Record<string, string> = { rouge: '#E24B4A', orange: '#EF9F27', vert: '#639922' };

export default function Dashboard() {
  const [data, setData]           = useState<any>(null);
  const [details, setDetails]     = useState<any>(null);
  const [loading, setLoading]     = useState(true);
  const [syncing, setSyncing]     = useState(false);
  const [mondayUrl, setMondayUrl] = useState('');
  const [mondayConnecte, setMondayConnecte] = useState(false);
  const [message, setMessage]     = useState('');
  const [lastSync, setLastSync]   = useState('');

  const chargerScore = () => {
    fetch('/api/score')
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
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
    chargerScore();
    fetch('/api/monday').then(r => r.json()).then(d => setMondayUrl(d.authUrl)).catch(() => {});
  }, []);

  const synchroniser = async () => {
    setSyncing(true);
    setMessage('Synchronisation en cours...');
    try {
      const res = await fetch('/api/sync', { method: 'POST' });
      const result = await res.json();
      if (result.succes) {
        setLastSync(new Date().toLocaleTimeString('fr-CA'));
        setMessage('Sync réussie ! Score mis à jour.');
        setDetails(result.details);
        chargerScore();
      } else {
        setMessage('Erreur : ' + (result.erreur || 'sync échouée'));
      }
    } catch { setMessage('Erreur de synchronisation.'); }
    setSyncing(false);
  };

  if (loading) return (
    <main style={{ fontFamily: 'system-ui', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 18, fontWeight: 500, color: '#534AB7' }}>OrgaSanté</div>
        <div style={{ fontSize: 13, color: '#888780', marginTop: 8 }}>Calcul du score en cours...</div>
      </div>
    </main>
  );

  if (!data) return <main style={{ fontFamily: 'system-ui', padding: 24 }}><p style={{ color: '#E24B4A' }}>Erreur de chargement.</p></main>;

  const scoreGlobal = data.scoreGlobal;
  const piliers = Object.entries(data.piliers);
  const alertes = data.alertes.slice(0, 5);

  return (
    <main style={{ fontFamily: 'system-ui, sans-serif', maxWidth: 960, margin: '0 auto', padding: '24px 16px', color: '#2C2C2A' }}>

      {message && (
        <div style={{ background: message.includes('succès') || message.includes('réussie') ? '#EAF3DE' : message.includes('cours') ? '#E6F1FB' : '#FCEBEB',
                      color: message.includes('succès') || message.includes('réussie') ? '#27500A' : message.includes('cours') ? '#0C447C' : '#791F1F',
                      padding: '10px 16px', borderRadius: 8, marginBottom: 16, fontSize: 13, fontWeight: 500 }}>
          {message}
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 500, margin: 0, color: '#534AB7' }}>OrgaSanté</h1>
          <p style={{ fontSize: 13, color: '#888780', margin: '4px 0 0' }}>
            Entreprise Exemple inc. — {data.periode}
            {lastSync && <span> — Sync : {lastSync}</span>}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <button onClick={synchroniser} disabled={syncing}
            style={{ background: syncing ? '#F1EFE8' : '#534AB7', color: syncing ? '#888780' : 'white',
                     border: 'none', borderRadius: 8, padding: '8px 20px', fontSize: 13, cursor: syncing ? 'default' : 'pointer', fontWeight: 500 }}>
            {syncing ? 'Sync...' : 'Synchroniser'}
          </button>
          <span style={{ background: scoreGlobal >= 65 ? '#EAF3DE' : scoreGlobal >= 50 ? '#FAEEDA' : '#FCEBEB',
                         color: scoreGlobal >= 65 ? '#27500A' : scoreGlobal >= 50 ? '#633806' : '#791F1F',
                         fontSize: 12, padding: '4px 14px', borderRadius: 999, fontWeight: 500 }}>
            {data.statut.label}
          </span>
        </div>
      </div>

      {/* Score global */}
      <div style={{ display: 'grid', gridTemplateColumns: '150px 1fr', gap: 14, marginBottom: 14 }}>
        <div style={{ background: 'white', border: '0.5px solid #D3D1C7', borderRadius: 12, padding: 16,
                      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
          <p style={{ fontSize: 12, color: '#888780', margin: 0, fontWeight: 500 }}>Score global</p>
          <div style={{ position: 'relative', width: 90, height: 90 }}>
            <svg viewBox="0 0 100 100" style={{ width: 90, height: 90, transform: 'rotate(-90deg)' }}>
              <circle cx="50" cy="50" r="40" fill="none" stroke="#F1EFE8" strokeWidth="16" />
              <circle cx="50" cy="50" r="40" fill="none"
                stroke={scoreGlobal >= 65 ? '#639922' : scoreGlobal >= 50 ? '#EF9F27' : '#E24B4A'}
                strokeWidth="16" strokeDasharray={`${scoreGlobal * 2.513} 251.3`} strokeLinecap="round" />
            </svg>
            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', textAlign: 'center' }}>
              <div style={{ fontSize: 20, fontWeight: 500, color: '#BA7517', lineHeight: 1 }}>{scoreGlobal}</div>
              <div style={{ fontSize: 9, color: '#888780' }}>/ 100</div>
            </div>
          </div>
        </div>

        <div style={{ background: 'white', border: '0.5px solid #D3D1C7', borderRadius: 12, padding: '14px 18px' }}>
          <p style={{ fontSize: 13, fontWeight: 500, margin: '0 0 12px' }}>Score par pilier</p>
          {piliers.map(([key, p]: [string, any]) => {
            const c = pilierCouleur[key] || { color: '#534AB7' };
            return (
              <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 9 }}>
                <span style={{ fontSize: 13, width: 85, flexShrink: 0 }}>{p.label}</span>
                <div style={{ flex: 1, background: '#F1EFE8', borderRadius: 999, height: 7, overflow: 'hidden' }}>
                  <div style={{ width: `${p.score}%`, height: 7, borderRadius: 999, background: c.color, transition: 'width 0.8s ease' }} />
                </div>
                <span style={{ fontSize: 13, fontWeight: 500, color: c.color, width: 52, textAlign: 'right', flexShrink: 0 }}>{p.score} / 100</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Indicateurs détaillés Monday */}
      {details && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>

          {/* Opérations */}
          <div style={{ background: 'white', border: '0.5px solid #D3D1C7', borderRadius: 12, padding: '14px 18px' }}>
            <p style={{ fontSize: 13, fontWeight: 500, margin: '0 0 12px', color: '#534AB7' }}>Opérations — détails</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <div style={{ background: '#F1EFE8', borderRadius: 8, padding: '10px 12px' }}>
                <div style={{ fontSize: 20, fontWeight: 500, color: details.operations.tachesDone >= details.operations.tachesTotales * 0.7 ? '#3B6D11' : '#854F0B' }}>
                  {details.operations.tachesDone}/{details.operations.tachesTotales}
                </div>
                <div style={{ fontSize: 11, color: '#888780', marginTop: 2 }}>Tâches complétées</div>
              </div>
              <div style={{ background: details.operations.tachesEnRetard > 0 ? '#FCEBEB' : '#EAF3DE', borderRadius: 8, padding: '10px 12px' }}>
                <div style={{ fontSize: 20, fontWeight: 500, color: details.operations.tachesEnRetard > 0 ? '#A32D2D' : '#3B6D11' }}>
                  {details.operations.tachesEnRetard}
                </div>
                <div style={{ fontSize: 11, color: '#888780', marginTop: 2 }}>Projets en retard</div>
              </div>
              <div style={{ background: '#F1EFE8', borderRadius: 8, padding: '10px 12px' }}>
                <div style={{ fontSize: 20, fontWeight: 500, color: '#2C2C2A' }}>
                  {details.operations.retardMoyenJours}j
                </div>
                <div style={{ fontSize: 11, color: '#888780', marginTop: 2 }}>Retard moyen</div>
              </div>
              <div style={{ background: '#F1EFE8', borderRadius: 8, padding: '10px 12px' }}>
                <div style={{ fontSize: 20, fontWeight: 500, color: '#2C2C2A' }}>
                  {details.operations.tachesTotales > 0 ? Math.round((details.operations.tachesDone / details.operations.tachesTotales) * 100) : 0}%
                </div>
                <div style={{ fontSize: 11, color: '#888780', marginTop: 2 }}>Taux complétion</div>
              </div>
            </div>
          </div>

          {/* Ventes */}
          <div style={{ background: 'white', border: '0.5px solid #D3D1C7', borderRadius: 12, padding: '14px 18px' }}>
            <p style={{ fontSize: 13, fontWeight: 500, margin: '0 0 12px', color: '#534AB7' }}>Ventes — détails</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <div style={{ background: '#EAF3DE', borderRadius: 8, padding: '10px 12px' }}>
                <div style={{ fontSize: 20, fontWeight: 500, color: '#3B6D11' }}>
                  {details.ventes.dealsGagnes}/{details.ventes.dealsFermes}
                </div>
                <div style={{ fontSize: 11, color: '#888780', marginTop: 2 }}>Deals gagnés</div>
              </div>
              <div style={{ background: '#F1EFE8', borderRadius: 8, padding: '10px 12px' }}>
                <div style={{ fontSize: 20, fontWeight: 500, color: '#854F0B' }}>
                  {details.ventes.tauxConversion}%
                </div>
                <div style={{ fontSize: 11, color: '#888780', marginTop: 2 }}>Taux conversion</div>
              </div>
              <div style={{ background: '#E6F1FB', borderRadius: 8, padding: '10px 12px' }}>
                <div style={{ fontSize: 18, fontWeight: 500, color: '#185FA5' }}>
                  {details.ventes.valeurPipeline.toLocaleString('fr-CA')}$
                </div>
                <div style={{ fontSize: 11, color: '#888780', marginTop: 2 }}>Pipeline actif</div>
              </div>
              <div style={{ background: '#F1EFE8', borderRadius: 8, padding: '10px 12px' }}>
                <div style={{ fontSize: 20, fontWeight: 500, color: '#2C2C2A' }}>
                  {details.ventes.cycleVente}j
                </div>
                <div style={{ fontSize: 11, color: '#888780', marginTop: 2 }}>Cycle de vente</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Alertes */}
      <div style={{ background: 'white', border: '0.5px solid #D3D1C7', borderRadius: 12, padding: '14px 18px', marginBottom: 14 }}>
        <p style={{ fontSize: 13, fontWeight: 500, margin: '0 0 8px' }}>
          Alertes IA — {alertes.filter((a: any) => a.niveau === 'rouge').length} critiques
        </p>
        {alertes.map((a: any, i: number) => (
          <div key={i} style={{ display: 'flex', gap: 10, padding: '7px 0', borderBottom: i < alertes.length - 1 ? '0.5px solid #F1EFE8' : 'none' }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: niveauCouleur[a.niveau], flexShrink: 0, marginTop: 5 }} />
            <div>
              <div style={{ fontSize: 13, fontWeight: 500 }}>{a.pilier}</div>
              <div style={{ fontSize: 11, color: '#888780' }}>{a.message}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Sources */}
      <div style={{ background: 'white', border: '0.5px solid #D3D1C7', borderRadius: 12, padding: '14px 18px' }}>
        <p style={{ fontSize: 13, fontWeight: 500, margin: '0 0 10px' }}>Sources de données</p>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', background: '#F1EFE8', borderRadius: 8 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#B4B2A9' }} />
            <span style={{ fontSize: 13, color: '#888780' }}>QuickBooks — bientôt</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px',
                        background: mondayConnecte ? '#EAF3DE' : '#F1EFE8', borderRadius: 8,
                        cursor: mondayConnecte ? 'default' : 'pointer' }}
               onClick={mondayConnecte ? undefined : () => { if (mondayUrl) window.location.href = mondayUrl; }}>
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
