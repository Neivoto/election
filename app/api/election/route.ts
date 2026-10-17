import { NextResponse } from 'next/server';
import { kv } from '@vercel/kv';

const DEFAULT_STATE = {
  electionStatus: 'active',
  positions: [
    {
      id: 'pos-1',
      title: 'President',
      candidates: [
        { id: 'c1', name: 'Alex Johnson', votes: 0 },
        { id: 'c2', name: 'Samira Patel', votes: 0 },
      ],
    },
    {
      id: 'pos-2',
      title: 'Vice President',
      candidates: [
        { id: 'c3', name: 'Jordan Lee', votes: 0 },
        { id: 'c4', name: 'Taylor Swift', votes: 0 },
      ],
    },
  ],
  usedStudentIds: [],
};

export async function GET() {
  try {
    let data = await kv.get('election_data');
    if (!data) {
      data = DEFAULT_STATE;
      await kv.set('election_data', DEFAULT_STATE);
    }
    return NextResponse.json(data);
  } catch (e) {
    // Fallback if KV not connected locally
    return NextResponse.json(DEFAULT_STATE);
  }
}
