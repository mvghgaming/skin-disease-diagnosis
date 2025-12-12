import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/client';
import { Disease } from '@/types/disease';

export async function GET(request: NextRequest) {
  try {
    const result = await db.query(`
      SELECT
        d.id,
        d.name,
        d.description,
        d.created_at,
        COUNT(r.id) as rule_count
      FROM diseases d
      LEFT JOIN rules r ON d.id = r.disease_id
      GROUP BY d.id
      ORDER BY d.created_at DESC
    `);

    const diseases = result.rows.map((row: any) => ({
      id: row.id,
      name: row.name,
      description: row.description,
      created_at: row.created_at,
      rule_count: parseInt(row.rule_count),
    }));

    return NextResponse.json({ diseases, total: diseases.length });
  } catch (error) {
    console.error('Error fetching diseases:', error);
    return NextResponse.json(
      { error: 'Failed to fetch diseases' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { disease }: { disease: Disease } = await request.json();

    if (!disease || !disease.id || !disease.name) {
      return NextResponse.json(
        { error: 'Missing required fields: id and name' },
        { status: 400 }
      );
    }

    await db.query(
      `INSERT INTO diseases (id, name, description)
       VALUES ($1, $2, $3)`,
      [disease.id, disease.name, disease.description || null]
    );

    return NextResponse.json({ disease });
  } catch (error) {
    console.error('Error creating disease:', error);
    return NextResponse.json(
      { error: 'Failed to create disease' },
      { status: 500 }
    );
  }
}
