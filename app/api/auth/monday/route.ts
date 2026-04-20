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
    // 1. Échanger le code contre un token
    const tokenRes = await fetch('https://auth.monday.com/oauth2/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id:     process.env.MONDAY_CLIENT_ID,
        client_secret: process.env.MONDAY_CLIENT_SECRET,
        redirect_uri:  process.env.MONDAY_REDIRECT_URI,
        code,
      }),
    });
    const tokenData = await tokenRes.json();
    if (!tokenData.access_token) throw new Error('Token non reçu');

    // 2. Récupérer le profil de l'utilisateur
    const profileRes = await fetch('https://api.monday.com/v2', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': tokenData.access_token },
      body: JSON.stringify({ query: `query { me { id name email title is_admin is_guest teams { id name } } }` }),
    });
    const profileData = await profileRes.json();
    const user = profileData?.data?.me;

    // 3. Sauvegarder dans Supabase
    const { getSupabase } = await import('../../../lib/supabase');
    const supabase = getSupabase();

    await supabase.from('integrations').upsert({
      organisation_id: '11111111-1111-1111-1111-111111111111',
      outil:           'monday',
      statut:          'connecte',
      access_token:    tokenData.access_token,
      compte_nom:      user?.name || 'Monday.com',
      derniere_sync:   new Date().toISOString(),
    }, { onConflict: 'organisation_id,outil' });

    // 4. Sauvegarder le profil utilisateur
    if (user) {
      await supabase.from('utilisateurs').upsert({
        organisation_id: '11111111-1111-1111-1111-111111111111',
        monday_id:       String(user.id),
        nom:             user.name,
        email:           user.email,
        titre:           user.title || '',
        est_admin:       user.is_admin || false,
        derniere_connexion: new Date().toISOString(),
      }, { onConflict: 'organisation_id,monday_id' });
    }

    // Rediriger selon le rôle
    const redirect = user?.is_admin ? `${base}?monday=connecte&role=admin` : `${base}?monday=connecte&role=employe`;
    return NextResponse.redirect(redirect);

  } catch (e: any) {
    console.error('[Monday OAuth]', e.message);
    return NextResponse.redirect(`${base}?erreur=connexion_echouee`);
  }
}
