'use client';

import { useState, useEffect } from 'react';

export default function Setup() {
  const [etape, setEtape]     = useState(1);
  const [boards, setBoards]   = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);
  const [boardOps, setBoardOps]   = useState('');
  const [boardCRM, setBoardCRM]   = useState('');
  const [colStatut, setColStatut] = useState('');
  const [valDone, setValDone]     = useState('');
  const [colDate, setColDate]     = useState('');
  const [colStatutCRM, setColStatutCRM] = useState('');
  const [valWon, setValWon]   = useState('');
  const [valLost, setValLost] = useState('');
  const [colMontant, setColMontant] = useState('');
  const [colVendeur, setColVendeur] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetch('/api/setup/boards')
      .then(r => r.json())
      .then(d => { setBoards(d.boards || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const boardOpsData = boards.find(b => b.id === boardOps);
  const boardCRMData = boards.find(b => b.id === boardCRM);
  const colonnesOps  = boardOpsData?.columns || [];
  const colonnesCRM  = boardCRMData?.columns || [];
  const colStatutData    = colonnesOps.find((c: any) => c.id === colStatut);
  const colStatutCRMData = colonnesCRM.find((c: any) => c.id === colStatutCRM);
  const valeursStatut = colStatutData?.settings?.labels ? Object.values(colStatutData.settings.labels) : [];
  const valeursCRM    = colStatutCRMData?.settings?.labels ? Object.values(colStatutCRMData.settings.labels) : [];

  const sauvegarder = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/setup/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          operations: { boardId: boardOps, colStatut, valDone, colDate },
          ventes: { boardId: boardCRM, colStatut: colStatutCRM, valWon, valLost, colMontant, colVendeur },
        }),
      });
      const data = await res.json();
      if (data.succes) { setEtape(4); setMessage('Configuration sauvegardée !'); }
      else setMessage('Erreur : ' + data.erreur);
    } catch { setMessage('Erreur.'); }
    setSaving(false);
  };

  const s    = { fontFamily: 'system-ui', maxWidth: 580, margin: '0 auto', padding: '32px 16px', color: '#2C2C2A' };
  const card = { background: 'white', border: '0.5px solid #D3D1C7', borderRadius: 12, padding: '20px 24px', marginBottom: 16 };
  const lbl  = { fontSize: 13, fontWeight: 500 as const, marginBottom: 6, display: 'block' as const };
  const sel  = { width: '100%', padding: '8px 12px', borderRadius: 8, border: '0.5px solid #D3D1C7', fontSize: 13, marginBottom: 14, background: 'white' };
  const btn  = (p: boolean) => ({ background: p ? '#534AB7' : 'white', color: p ? 'white' : '#534AB7', border: p ? 'none' : '0.5px solid #534AB7', borderRadius: 8, padding: '10px 24px', fontSize: 13, cursor: 'pointer', fontWeight: 500 as const });

  if (loading) return (
    <main style={s}>
      <div style={{ textAlign: 'center', padding: 40, color: '#534AB7' }}>Chargement de vos tableaux Monday...</div>
    </main>
  );

  return (
    <main style={s}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 20, fontWeight: 500, margin: 0, color: '#534AB7' }}>Configuration Monday.com</h1>
        <p style={{ fontSize: 13, color: '#888780', margin: '6px 0 0' }}>Indiquez comment vous utilisez Monday pour qu'OrgaSanté calcule vos indicateurs correctement.</p>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 24, alignItems: 'center' }}>
        {[1,2,3].map(e => (
          <div key={e} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 24, height: 24, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                          background: etape >= e ? '#534AB7' : '#F1EFE8', color: etape >= e ? 'white' : '#888780', fontSize: 12, fontWeight: 500 }}>
              {e}
            </div>
            <span style={{ fontSize: 12, color: etape >= e ? '#534AB7' : '#888780' }}>
              {e === 1 ? 'Tableaux' : e === 2 ? 'Colonnes' : 'Confirmation'}
            </span>
            {e < 3 && <div style={{ width: 20, height: 1, background: '#D3D1C7' }} />}
          </div>
        ))}
      </div>

      {etape === 1 && (
        <div style={card}>
          <h2 style={{ fontSize: 15, fontWeight: 500, margin: '0 0 16px' }}>Étape 1 — Choisissez vos tableaux</h2>
          <label style={lbl}>Tableau des projets / tâches *</label>
          <select style={sel} value={boardOps} onChange={e => setBoardOps(e.target.value)}>
            <option value="">— Sélectionner —</option>
            {boards.map((b: any) => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
          <label style={lbl}>Tableau de ventes / CRM (optionnel)</label>
          <select style={sel} value={boardCRM} onChange={e => setBoardCRM(e.target.value)}>
            <option value="">— Aucun —</option>
            {boards.map((b: any) => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button style={btn(true)} disabled={!boardOps} onClick={() => setEtape(2)}>Suivant →</button>
          </div>
        </div>
      )}

      {etape === 2 && (
        <div style={card}>
          <h2 style={{ fontSize: 15, fontWeight: 500, margin: '0 0 16px' }}>Étape 2 — Mappez vos colonnes</h2>
          <div style={{ background: '#F1EFE8', borderRadius: 8, padding: '8px 12px', marginBottom: 14, fontSize: 12, color: '#534AB7', fontWeight: 500 }}>
            Opérations : {boardOpsData?.name}
          </div>
          <label style={lbl}>Colonne de statut *</label>
          <select style={sel} value={colStatut} onChange={e => setColStatut(e.target.value)}>
            <option value="">— Sélectionner —</option>
            {colonnesOps.filter((c: any) => c.type === 'color' || c.type === 'status').map((c: any) => (
              <option key={c.id} value={c.id}>{c.title}</option>
            ))}
          </select>
          {colStatut && <>
            <label style={lbl}>Valeur "Complété" *</label>
            <select style={sel} value={valDone} onChange={e => setValDone(e.target.value)}>
              <option value="">— Sélectionner —</option>
              {(valeursStatut as string[]).map((v, i) => <option key={i} value={String(v)}>{String(v)}</option>)}
              {['Done','Terminé','Complété','Completed'].map(v => <option key={v} value={v}>{v}</option>)}
            </select>
          </>}
          <label style={lbl}>Colonne date d'échéance</label>
          <select style={sel} value={colDate} onChange={e => setColDate(e.target.value)}>
            <option value="">— Aucune —</option>
            {colonnesOps.filter((c: any) => c.type === 'date').map((c: any) => (
              <option key={c.id} value={c.id}>{c.title}</option>
            ))}
          </select>
          {boardCRM && <>
            <div style={{ background: '#FAEEDA', borderRadius: 8, padding: '8px 12px', margin: '14px 0', fontSize: 12, color: '#854F0B', fontWeight: 500 }}>
              Ventes : {boardCRMData?.name}
            </div>
            <label style={lbl}>Colonne statut deals</label>
            <select style={sel} value={colStatutCRM} onChange={e => setColStatutCRM(e.target.value)}>
              <option value="">— Sélectionner —</option>
              {colonnesCRM.filter((c: any) => c.type === 'color' || c.type === 'status').map((c: any) => (
                <option key={c.id} value={c.id}>{c.title}</option>
              ))}
            </select>
            {colStatutCRM && <>
              <label style={lbl}>Valeur "Gagné / Won"</label>
              <select style={sel} value={valWon} onChange={e => setValWon(e.target.value)}>
                <option value="">— Sélectionner —</option>
                {(valeursCRM as string[]).map((v, i) => <option key={i} value={String(v)}>{String(v)}</option>)}
                {['Won','Gagné'].map(v => <option key={v} value={v}>{v}</option>)}
              </select>
              <label style={lbl}>Valeur "Perdu / Lost"</label>
              <select style={sel} value={valLost} onChange={e => setValLost(e.target.value)}>
                <option value="">— Sélectionner —</option>
                {(valeursCRM as string[]).map((v, i) => <option key={i} value={String(v)}>{String(v)}</option>)}
                {['Lost','Perdu'].map(v => <option key={v} value={v}>{v}</option>)}
              </select>
            </>}
            <label style={lbl}>Colonne montant</label>
            <select style={sel} value={colMontant} onChange={e => setColMontant(e.target.value)}>
              <option value="">— Aucune —</option>
              {colonnesCRM.filter((c: any) => c.type === 'numeric' || c.type === 'numbers').map((c: any) => (
                <option key={c.id} value={c.id}>{c.title}</option>
              ))}
            </select>
            <label style={lbl}>Colonne vendeur</label>
            <select style={sel} value={colVendeur} onChange={e => setColVendeur(e.target.value)}>
              <option value="">— Aucune —</option>
              {colonnesCRM.filter((c: any) => c.type === 'people' || c.type === 'multiple-person').map((c: any) => (
                <option key={c.id} value={c.id}>{c.title}</option>
              ))}
            </select>
          </>}
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <button style={btn(false)} onClick={() => setEtape(1)}>← Retour</button>
            <button style={btn(true)} disabled={!colStatut || !valDone} onClick={() => setEtape(3)}>Suivant →</button>
          </div>
        </div>
      )}

      {etape === 3 && (
        <div style={card}>
          <h2 style={{ fontSize: 15, fontWeight: 500, margin: '0 0 16px' }}>Étape 3 — Confirmation</h2>
          {[
            { lbl: 'Tableau opérations', val: boardOpsData?.name },
            { lbl: 'Colonne statut', val: colonnesOps.find((c: any) => c.id === colStatut)?.title },
            { lbl: 'Valeur complété', val: valDone },
            { lbl: 'Colonne date', val: colDate ? colonnesOps.find((c: any) => c.id === colDate)?.title : '—' },
            ...(boardCRM ? [
              { lbl: 'Tableau ventes', val: boardCRMData?.name },
              { lbl: 'Won', val: valWon || '—' },
              { lbl: 'Lost', val: valLost || '—' },
            ] : [])
          ].map((row, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '0.5px solid #F1EFE8' }}>
              <span style={{ fontSize: 13, color: '#888780' }}>{row.lbl}</span>
              <span style={{ fontSize: 13, fontWeight: 500 }}>{row.val}</span>
            </div>
          ))}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 16 }}>
            <button style={btn(false)} onClick={() => setEtape(2)}>← Retour</button>
            <button style={btn(true)} disabled={saving} onClick={sauvegarder}>
              {saving ? 'Sauvegarde...' : 'Confirmer →'}
            </button>
          </div>
        </div>
      )}

      {etape === 4 && (
        <div style={{ ...card, textAlign: 'center', padding: 40 }}>
          <div style={{ fontSize: 36, marginBottom: 12 }}>🎉</div>
          <h2 style={{ fontSize: 17, fontWeight: 500, color: '#534AB7', margin: '0 0 8px' }}>Configuration terminée !</h2>
          <p style={{ fontSize: 13, color: '#888780', marginBottom: 20 }}>OrgaSanté va maintenant lire vos données correctement.</p>
          <a href="/" style={{ ...btn(true), textDecoration: 'none', display: 'inline-block' }}>Voir mon dashboard →</a>
        </div>
      )}

      {message && (
        <div style={{ background: message.includes('sauvegardée') ? '#EAF3DE' : '#FCEBEB',
                      color: message.includes('sauvegardée') ? '#27500A' : '#791F1F',
                      padding: '10px 16px', borderRadius: 8, fontSize: 13, fontWeight: 500, marginTop: 8 }}>
          {message}
        </div>
      )}
    </main>
  );
}
