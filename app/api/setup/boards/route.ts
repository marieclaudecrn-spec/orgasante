import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const { getSupabase } = await import('../../../lib/supabase');
    const supabase = getSupabase();
    const { data: integration } = await supabase
      .from('integrations').select('access_token')
      .eq('organisation_id', '11111111-1111-1111-1111-111111111111')
      .eq('outil', 'monday').single();
    if (!integration?.access_token) return NextResponse.json({ erreur: 'Monday non connecté' }, { status: 400 });

    const response = await fetch('https://api.monday.com/v2', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': integration.access_token },
      body: JSON.stringify({ query: `query { boards(limit: 20) { id name columns { id title type settings_str } } }` }),
    });
    const data = await response.json();
    const boards = (data?.data?.boards || [])
      .filter((b: any) => !b.name.includes('Subitems') && !b.name.includes('Welcome') && !b.name.includes('developer'))
      .map((b: any) => ({
        id: b.id, name: b.name,
        columns: (b.columns || []).map((c: any) => ({
          id: c.id, title: c.title, type: c.type,
          settings: (() => { try { return JSON.parse(c.settings_str || '{}'); } catch { return {}; } })()
        }))
      }));
    return NextResponse.json({ boards });
  } catch (e: any) {
    return NextResponse.json({ erreur: e.message }, { status: 500 });
  }
}
