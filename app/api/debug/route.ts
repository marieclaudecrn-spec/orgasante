import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const { getSupabase } = await import('../../lib/supabase');
    const supabase = getSupabase();
    const { data: integration } = await supabase
      .from('integrations')
      .select('access_token')
      .eq('organisation_id', '11111111-1111-1111-1111-111111111111')
      .eq('outil', 'monday')
      .single();
    if (!integration?.access_token) return NextResponse.json({ erreur: 'Pas de token' });
    const response = await fetch('https://api.monday.com/v2', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': integration.access_token },
      body: JSON.stringify({ query: `query { me { id name } }` }),
    });
    const data = await response.json();
    return NextResponse.json(data);
  } catch (e: any) {
    return NextResponse.json({ erreur: e.message });
  }
}
