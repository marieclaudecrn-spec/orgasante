import { syncMonday, genererUrlAutorisationMonday } from '../../../mondayConnector';

// GET /api/monday — Retourne l'URL d'autorisation OAuth
export async function GET() {
  const url = genererUrlAutorisationMonday('demo-org');
  return NextResponse.json({ authUrl: url });
}

// POST /api/monday — Sync les données Monday avec un token
export async function POST(request: Request) {
  try {
    const { accessToken } = await request.json();

    if (!accessToken) {
      return NextResponse.json(
        { erreur: 'Token manquant' },
        { status: 400 }
      );
    }

    const resultat = await syncMonday(accessToken);
    return NextResponse.json(resultat);

  } catch (erreur: any) {
    return NextResponse.json(
      { erreur: erreur.message || 'Erreur de synchronisation' },
      { status: 500 }
    );
  }
}
