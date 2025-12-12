import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/client';
import { Rule } from '@/types/rule';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const diseaseId = searchParams.get('disease_id');
    const status = searchParams.get('status');
    const category = searchParams.get('category');

    // Build query with filters
    let query = `
      SELECT
        r.id, r.disease_id, r.name, r.category, r.logic, r.explanation, r.status, r.priority,
        COALESCE(
          json_agg(
            DISTINCT jsonb_build_object(
              'variable', c.variable,
              'operator', c.operator,
              'value', c.value
            ) ORDER BY jsonb_build_object(
              'variable', c.variable,
              'operator', c.operator,
              'value', c.value
            )
          ) FILTER (WHERE c.id IS NOT NULL),
          '[]'
        ) as conditions,
        COALESCE(
          json_agg(
            DISTINCT jsonb_build_object(
              'variable', co.variable,
              'value', co.value
            ) ORDER BY jsonb_build_object(
              'variable', co.variable,
              'value', co.value
            )
          ) FILTER (WHERE co.id IS NOT NULL),
          '[]'
        ) as conclusions
      FROM rules r
      LEFT JOIN conditions c ON r.id = c.rule_id
      LEFT JOIN conclusions co ON r.id = co.rule_id
      WHERE 1=1
    `;

    const params: any[] = [];
    let paramCount = 1;

    if (diseaseId) {
      query += ` AND r.disease_id = $${paramCount}`;
      params.push(diseaseId);
      paramCount++;
    }

    if (status) {
      query += ` AND r.status = $${paramCount}`;
      params.push(status);
      paramCount++;
    }

    if (category) {
      query += ` AND r.category = $${paramCount}`;
      params.push(category);
      paramCount++;
    }

    query += ` GROUP BY r.id ORDER BY r.category, r.priority DESC, r.id`;

    const result = await db.query(query, params);

    const rules: Rule[] = result.rows.map((row: any) => ({
      id: row.id,
      disease_id: row.disease_id,
      name: row.name,
      category: row.category,
      logic: row.logic,
      explanation: row.explanation,
      status: row.status,
      priority: row.priority,
      conditions: row.conditions || [],
      conclusions: row.conclusions || [],
    }));

    return NextResponse.json({ rules, total: rules.length });
  } catch (error) {
    console.error('Error fetching rules:', error);
    return NextResponse.json(
      { error: 'Failed to fetch rules' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { rule }: { rule: Rule } = await request.json();

    if (!rule || !rule.id || !rule.name || !rule.category) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Insert rule
    await db.query(
      `INSERT INTO rules (id, disease_id, name, category, logic, explanation, status, priority)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [
        rule.id,
        rule.disease_id || null,
        rule.name,
        rule.category,
        rule.logic,
        rule.explanation,
        rule.status || 'active',
        rule.priority || 0,
      ]
    );

    // Insert conditions
    if (rule.conditions && rule.conditions.length > 0) {
      for (let i = 0; i < rule.conditions.length; i++) {
        const condition = rule.conditions[i];
        await db.query(
          `INSERT INTO conditions (rule_id, variable, operator, value, position)
           VALUES ($1, $2, $3, $4, $5)`,
          [
            rule.id,
            condition.variable,
            condition.operator,
            JSON.stringify(condition.value),
            i,
          ]
        );
      }
    }

    // Insert conclusions
    if (rule.conclusions && rule.conclusions.length > 0) {
      for (let i = 0; i < rule.conclusions.length; i++) {
        const conclusion = rule.conclusions[i];
        await db.query(
          `INSERT INTO conclusions (rule_id, variable, value, position)
           VALUES ($1, $2, $3, $4)`,
          [rule.id, conclusion.variable, JSON.stringify(conclusion.value), i]
        );
      }
    }

    return NextResponse.json({ rule, id: rule.id });
  } catch (error) {
    console.error('Error creating rule:', error);
    return NextResponse.json(
      { error: 'Failed to create rule' },
      { status: 500 }
    );
  }
}
