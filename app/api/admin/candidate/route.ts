import { NextResponse } from 'next/server';
import { kv } from '@vercel/kv';

export async function POST(req: Request) {
  const { positionId, name, password } = await req.json();
  if (password !== (process.env.ADMIN_PASSWORD || 'admin')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let data: any = await kv.get('election_data');
  if (data) {
    const pos = data.positions.find((p: any) => p.id === positionId);
    if (pos) {
      pos.candidates.push({
        id: 'cand-' + Date.now(),
        name,
        votes: 0,
      });
      await kv.set('election_data', data);
    }
  }

  return NextResponse.json({ success: true });
}
