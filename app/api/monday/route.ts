import { NextResponse } from 'next/server';
import { syncMonday, genererUrlAutorisationMonday } from '../../mondayConnector';

export async function GET() {
  const url = genererUrlAutorisationMonday('demo-org');
  return NextResponse.json({ authUrl: url });
}

export async function POST(request: Request) {
  try {
    const { accessToken } = await request.json();
    if (!accessToken) {
      return NextResponse.json({ erreur: 'Token manquant' }, { status: 400 });
    }
    const resultat = await syncMonday(accessToken);
    return NextResponse.json(resultat);
  } catch (erreur: any) {
    return NextResponse.json({ erreur: erreur.message || 'Erreur' }, { status: 500 });
  }
}
