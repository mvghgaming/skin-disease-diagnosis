import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/client';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Get session
    const sessionResult = await db.query(
      `SELECT id, status, created_at, completed_at
       FROM diagnosis_sessions
       WHERE id = $1`,
      [id]
    );

    if (sessionResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }

    // Get facts
    const factsResult = await db.query(
      `SELECT variable, value, source, created_at
       FROM session_facts
       WHERE session_id = $1
       ORDER BY created_at`,
      [id]
    );

    // Get fired rules
    const rulesResult = await db.query(
      `SELECT fr.rule_id, fr.explanation, fr.fired_at, r.name as rule_name
       FROM fired_rules fr
       LEFT JOIN rules r ON fr.rule_id = r.id
       WHERE fr.session_id = $1
       ORDER BY fr.fired_at`,
      [id]
    );

    return NextResponse.json({
      session: sessionResult.rows[0],
      facts: factsResult.rows,
      firedRules: rulesResult.rows,
    });
  } catch (error) {
    console.error('Error fetching session:', error);
    return NextResponse.json(
      { error: 'Failed to fetch session' },
      { status: 500 }
    );
  }
}
