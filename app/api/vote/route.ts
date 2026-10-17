import { NextResponse } from 'next/server';
import { kv } from '@vercel/kv';

export async function POST(req: Request) {
  try {
    const { studentId, selections } = await req.json();

    if (!studentId || !selections) {
      return NextResponse.json({ error: 'Missing student ID or selections.' }, { status: 400 });
    }

    const cleanId = studentId.trim().toUpperCase();

    // Fetch election data from Vercel KV
    let data: any = await kv.get('election_data');
    if (!data) {
      return NextResponse.json({ error: 'Election not initialized.' }, { status: 400 });
    }

    if (data.electionStatus !== 'active') {
      return NextResponse.json({ error: 'Voting is currently closed.' }, { status: 400 });
    }

    if (data.usedStudentIds.includes(cleanId)) {
      return NextResponse.json({ error: 'This Student ID has already voted.' }, { status: 400 });
    }

    // Apply votes
    for (const [posId, candId] of Object.entries(selections)) {
      const pos = data.positions.find((p: any) => p.id === posId);
      if (pos) {
        const cand = pos.candidates.find((c: any) => c.id === candId);
        if (cand) {
          cand.votes = (cand.votes || 0) + 1;
        }
      }
    }

    // Mark ID as used
    data.usedStudentIds.push(cleanId);

    // Save back to KV
    await kv.set('election_data', data);

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to process vote.' }, { status: 500 });
  }
}
