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
  const [data, setData]         = useState<any>(null);
  const [details, setDetails]   = useState<any>(null);
  const [vendeurs, setVendeurs] = useState<any[]>([]);
  const [loading, setLoading]   = useState(true);
  const [syncing, setSyncing]   = useState(false);
  const [mondayUrl, setMondayUrl] = useState('');
  const [mondayConnecte, setMondayConnecte] = useState(false);
  const [message, setMessage]   = useState('');
  const [lastSync, setLastSync] = useState('');

  const chargerScore = () => {
    fetch('/api/score').then(r => r.json()).then(d => { setData(d); setLoading(false); }).catch(() => setLoading(false));
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('monday') === 'connecte') { setMondayConnecte(true); setMessage('Monday.com connecté !'); window.history.replaceState({}, '', '/'); }
    if (params.get('erreur')) { setMessage('Erreur de connexion.'); window.history.replaceState({}, '', '/'); }
    chargerScore();
    fetch('/api/monday').then(r => r.json()).then(d => setMondayUrl(d.authUrl)).catch(() => {});
  }, []);

  const synchroniser = async () => {
    setSyncing(true); setMessage('Synchronisation en cours...');
    try {
      const res = await fetch('/api/sync', { method: 'POST' });
      const result = await res.json();
      if (result.succes) {
        setLastSync(new Date().toLocaleTimeString('fr-CA'));
        setMessage('Sync réussie !');
        setDetails(result.details);
        setVendeurs(result.vendeurs || []);
        chargerScore();
      } else { setMessage('Erreur : ' + (result.erreur || 'sync échouée')); }
    } catch { setMessage('Erreur.'); }
    setSyncing(false);
  };

  if (loading) return (
    <main style={{ fontFamily: 'system-ui', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 18, fontWeight: 500, color: '#534AB7' }}>OrgaSanté</div>
        <div style={{ fontSize: 13, color: '#888780', marginTop: 8 }}>Calcul du score...</div>
      </div>
    </main>
  );

  if (!data) return <main style={{ padding: 24 }}><p style={{ color: '#E24B4A' }}>Erreur.</p></main>;

  const scoreGlobal = data.scoreGlobal;
  const piliers = Object.entries(data.piliers);
  const alertes = data.alertes.slice(0, 5);

  return (
    <main style={{ fontFamily: 'system-ui, sans-serif', maxWidth: 980, margin: '0 auto', padding: '24px 16px', color: '#2C2C2A' }}>

      {message && (
        <div style={{ background: message.includes('succès') || message.includes('réussie') ? '#EAF3DE' : message.includes('cours') ? '#E6F1FB' : '#FCEBEB',
                      color: message.includes('succès') || message.includes('réussie') ? '#27500A' : message.includes('cours') ? '#0C447C' : '#791F1F',
                      padding: '10px 16px', borderRadius: 8, marginBottom: 14, fontSize: 13, fontWeight: 500 }}>
          {message}
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 18, flexWrap: 'wrap', gap: 10 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 500, margin: 0, color: '#534AB7' }}>OrgaSanté</h1>
          <p style={{ fontSize: 13, color: '#888780', margin: '4px 0 0' }}>Entreprise Exemple inc. — {data.periode}{lastSync && ` — Sync : ${lastSync}`}</p>
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

      <div style={{ display: 'grid', gridTemplateColumns: '145px 1fr', gap: 12, marginBottom: 12 }}>
        <div style={{ background: 'white', border: '0.5px solid #D3D1C7', borderRadius: 12, padding: 14,
                      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
          <p style={{ fontSize: 11, color: '#888780', margin: 0, fontWeight: 500 }}>Score global</p>
          <div style={{ position: 'relative', width: 86, height: 86 }}>
            <svg viewBox="0 0 100 100" style={{ width: 86, height: 86, transform: 'rotate(-90deg)' }}>
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

        <div style={{ background: 'white', border: '0.5px solid #D3D1C7', borderRadius: 12, padding: '12px 16px' }}>
          <p style={{ fontSize: 12, fontWeight: 500, margin: '0 0 10px' }}>Score par pilier</p>
          {piliers.map(([key, p]: [string, any]) => {
            const c = pilierCouleur[key] || { color: '#534AB7' };
            return (
              <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <span style={{ fontSize: 12, width: 80, flexShrink: 0 }}>{p.label}</span>
                <div style={{ flex: 1, background: '#F1EFE8', borderRadius: 999, height: 7, overflow: 'hidden' }}>
                  <div style={{ width: `${p.score}%`, height: 7, borderRadius: 999, background: c.color, transition: 'width 0.8s ease' }} />
                </div>
                <span style={{ fontSize: 12, fontWeight: 500, color: c.color, width: 50, textAlign: 'right', flexShrink: 0 }}>{p.score} / 100</span>
              </div>
            );
          })}
        </div>
      </div>

      {details && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
          <div style={{ background: 'white', border: '0.5px solid #D3D1C7', borderRadius: 12, padding: '12px 16px' }}>
            <p style={{ fontSize: 12, fontWeight: 500, margin: '0 0 10px' }}>Opérations</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {[
                { val: `${details.operations.tachesDone}/${details.operations.tachesTotales}`, lbl: 'Tâches complétées', color: details.operations.tachesDone >= details.operations.tachesTotales * 0.7 ? '#3B6D11' : '#854F0B', bg: details.operations.tachesDone >= details.operations.tachesTotales * 0.7 ? '#EAF3DE' : '#FAEEDA' },
                { val: `${details.operations.tachesEnRetard}`, lbl: 'Projets en retard', color: details.operations.tachesEnRetard === 0 ? '#3B6D11' : '#A32D2D', bg: details.operations.tachesEnRetard === 0 ? '#EAF3DE' : '#FCEBEB' },
                { val: `${details.operations.retardMoyenJours}j`, lbl: 'Retard moyen', color: '#854F0B', bg: '#FAEEDA' },
                { val: `${details.operations.tachesTotales > 0 ? Math.round((details.operations.tachesDone / details.operations.tachesTotales) * 100) : 0}%`, lbl: 'Taux complétion', color: '#2C2C2A', bg: '#F1EFE8' },
              ].map((k, i) => (
                <div key={i} style={{ background: k.bg, borderRadius: 8, padding: '10px 12px' }}>
                  <div style={{ fontSize: 19, fontWeight: 500, color: k.color }}>{k.val}</div>
                  <div style={{ fontSize: 11, color: '#888780', marginTop: 2 }}>{k.lbl}</div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ background: 'white', border: '0.5px solid #D3D1C7', borderRadius: 12, padding: '12px 16px' }}>
            <p style={{ fontSize: 12, fontWeight: 500, margin: '0 0 10px' }}>Ventes — ce mois</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {[
                { val: `${details.ventes.dealsGagnes} Won`, lbl: `${details.ventes.valeurGagnee.toLocaleString('fr-CA')}$ signé`, color: '#3B6D11', bg: '#EAF3DE' },
                { val: `${details.ventes.dealsPerdus} Lost`, lbl: `${details.ventes.valeurPerdue.toLocaleString('fr-CA')}$ perdu`, color: details.ventes.dealsPerdus === 0 ? '#3B6D11' : '#A32D2D', bg: details.ventes.dealsPerdus === 0 ? '#EAF3DE' : '#FCEBEB' },
                { val: `${details.ventes.tauxConversion}%`, lbl: 'Taux conversion', color: details.ventes.tauxConversion >= 40 ? '#3B6D11' : '#854F0B', bg: '#F1EFE8' },
                { val: `${details.ventes.valeurPipeline.toLocaleString('fr-CA')}$`, lbl: `Pipeline (${details.ventes.nbLeads} leads)`, color: '#185FA5', bg: '#E6F1FB' },
              ].map((k, i) => (
                <div key={i} style={{ background: k.bg, borderRadius: 8, padding: '10px 12px' }}>
                  <div style={{ fontSize: 19, fontWeight: 500, color: k.color }}>{k.val}</div>
                  <div style={{ fontSize: 11, color: '#888780', marginTop: 2 }}>{k.lbl}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {vendeurs.length > 0 && (
        <div style={{ background: 'white', border: '0.5px solid #D3D1C7', borderRadius: 12, padding: '12px 16px', marginBottom: 12 }}>
          <p style={{ fontSize: 12, fontWeight: 500, margin: '0 0 10px' }}>Performance par vendeur</p>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
            <thead>
              <tr style={{ borderBottom: '0.5px solid #D3D1C7' }}>
                {['Vendeur', 'Won', 'Lost', 'Leads', 'Valeur signée', 'Pipeline', 'Conversion', 'Cycle'].map(h => (
                  <th key={h} style={{ padding: '6px 10px', textAlign: 'left', color: '#888780', fontWeight: 500 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {vendeurs.map((v, i) => (
                <tr key={i} style={{ borderBottom: '0.5px solid #F1EFE8', background: i % 2 === 0 ? 'white' : '#FAFAF8' }}>
                  <td style={{ padding: '8px 10px', fontWeight: 500 }}>{v.nom}</td>
                  <td style={{ padding: '8px 10px', color: '#3B6D11', fontWeight: 500 }}>{v.won}</td>
                  <td style={{ padding: '8px 10px', color: v.lost > 0 ? '#A32D2D' : '#888780' }}>{v.lost}</td>
                  <td style={{ padding: '8px 10px' }}>{v.actifs}</td>
                  <td style={{ padding: '8px 10px', color: '#185FA5', fontWeight: 500 }}>{v.valeurGagnee.toLocaleString('fr-CA')}$</td>
                  <td style={{ padding: '8px 10px' }}>{v.valeurPipeline.toLocaleString('fr-CA')}$</td>
                  <td style={{ padding: '8px 10px' }}>
                    <span style={{ background: v.conversion >= 50 ? '#EAF3DE' : v.conversion >= 30 ? '#FAEEDA' : '#FCEBEB',
                                   color: v.conversion >= 50 ? '#27500A' : v.conversion >= 30 ? '#633806' : '#791F1F',
                                   padding: '2px 8px', borderRadius: 999, fontWeight: 500 }}>
                      {v.conversion}%
                    </span>
                  </td>
                  <td style={{ padding: '8px 10px' }}>{v.cycleVente > 0 ? `${v.cycleVente}j` : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div style={{ background: 'white', border: '0.5px solid #D3D1C7', borderRadius: 12, padding: '12px 16px', marginBottom: 12 }}>
        <p style={{ fontSize: 12, fontWeight: 500, margin: '0 0 8px' }}>Alertes IA — {alertes.filter((a: any) => a.niveau === 'rouge').length} critiques</p>
        {alertes.map((a: any, i: number) => (
          <div key={i} style={{ display: 'flex', gap: 10, padding: '6px 0', borderBottom: i < alertes.length - 1 ? '0.5px solid #F1EFE8' : 'none' }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: niveauCouleur[a.niveau], flexShrink: 0, marginTop: 5 }} />
            <div>
              <div style={{ fontSize: 12, fontWeight: 500 }}>{a.pilier}</div>
              <div style={{ fontSize: 11, color: '#888780' }}>{a.message}</div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ background: 'white', border: '0.5px solid #D3D1C7', borderRadius: 12, padding: '12px 16px' }}>
        <p style={{ fontSize: 12, fontWeight: 500, margin: '0 0 8px' }}>Sources de données</p>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 12px', background: '#F1EFE8', borderRadius: 8 }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#B4B2A9' }} />
            <span style={{ fontSize: 12, color: '#888780' }}>QuickBooks — bientôt</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 12px',
                        background: mondayConnecte ? '#EAF3DE' : '#F1EFE8', borderRadius: 8, cursor: mondayConnecte ? 'default' : 'pointer' }}
               onClick={mondayConnecte ? undefined : () => { if (mondayUrl) window.location.href = mondayUrl; }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: mondayConnecte ? '#639922' : '#534AB7' }} />
            <span style={{ fontSize: 12, color: mondayConnecte ? '#2C2C2A' : '#534AB7', fontWeight: mondayConnecte ? 400 : 500 }}>
              {mondayConnecte ? 'Monday.com — connecté' : 'Connecter Monday.com →'}
            </span>
          </div>
        </div>
      </div>

    </main>
  );
}
