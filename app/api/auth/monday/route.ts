import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code  = searchParams.get('code');
  const error = searchParams.get('error');
  const base  = 'https://orgasante.vercel.app';

  if (error || !code) {
    return NextResponse.redirect(`${base}?erreur=monday_refuse`);
  }

  try {
    const response = await fetch('https://auth.monday.com/oauth2/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id:     process.env.MONDAY_CLIENT_ID,
        client_secret: process.env.MONDAY_CLIENT_SECRET,
        redirect_uri:  process.env.MONDAY_REDIRECT_URI,
        code,
      }),
    });

    const data = await response.json();
    if (!data.access_token) throw new Error('Token non reçu');

    // Sauvegarder dans Supabase
    const { getSupabase } = await import('../../../lib/supabase');
    const supabase = getSupabase();
    await supabase.from('integrations').upsert({
      organisation_id: '11111111-1111-1111-1111-111111111111',
      outil:           'monday',
      statut:          'connecte',
      access_token:    data.access_token,
      compte_nom:      'Monday.com',
      derniere_sync:   new Date().toISOString(),
    }, { onConflict: 'organisation_id,outil' });

    return NextResponse.redirect(`${base}?monday=connecte`);
  } catch (e: any) {
    console.error('[Monday OAuth]', e.message);
    return NextResponse.redirect(`${base}?erreur=connexion_echouee`);
  }
}
