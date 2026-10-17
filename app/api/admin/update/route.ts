import { NextResponse } from 'next/server';
import { kv } from '@vercel/kv';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { positions, electionStatus } = body;

    let currentData: any = (await kv.get('election_data')) || {};
    
    currentData.positions = positions;
    if (electionStatus) {
      currentData.electionStatus = electionStatus;
    }

    await kv.set('election_data', currentData);

    return NextResponse.json({ success: true, data: currentData });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to update election data' }, { status: 500 });
  }
}