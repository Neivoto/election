import { NextResponse } from 'next/server';
import { kv } from '@vercel/kv';

export const dynamic = 'force-dynamic'; // Disables caching

const EMPTY_STATE = {
  electionStatus: 'active',
  positions: [],
  usedStudentIds: [],
};

export async function GET() {
  try {
    let data = await kv.get('election_data');
    if (!data) {
      data = EMPTY_STATE;
      await kv.set('election_data', EMPTY_STATE);
    }
    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json(EMPTY_STATE);
  }
}