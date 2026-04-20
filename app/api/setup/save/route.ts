import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const config = await request.json();
    const { getSupabase } = await import('../../../../lib/supabase');
    const supabase = getSupabase();

    await supabase.from('integrations').upsert({
      organisation_id: '11111111-1111-1111-1111-111111111111',
      outil:           'monday_config',
      statut:          'connecte',
      access_token:    JSON.stringify(config),
      compte_nom:      'Config Monday',
      derniere_sync:   new Date().toISOString(),
    }, { onConflict: 'organisation_id,outil' });

    return NextResponse.json({ succes: true });
  } catch (e: any) {
    return NextResponse.json({ erreur: e.message }, { status: 500 });
  }
}
