import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/client';
import { Rule } from '@/types/rule';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const result = await db.query(
      `SELECT
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
       WHERE r.id = $1
       GROUP BY r.id`,
      [id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Rule not found' }, { status: 404 });
    }

    const row = result.rows[0];
    const rule: Rule = {
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
    };

    return NextResponse.json({ rule });
  } catch (error) {
    console.error('Error fetching rule:', error);
    return NextResponse.json(
      { error: 'Failed to fetch rule' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const { rule }: { rule: Partial<Rule> } = await request.json();

    // Update rule
    await db.query(
      `UPDATE rules
       SET name = COALESCE($1, name),
           category = COALESCE($2, category),
           logic = COALESCE($3, logic),
           explanation = COALESCE($4, explanation),
           status = COALESCE($5, status),
           priority = COALESCE($6, priority),
           disease_id = COALESCE($7, disease_id)
       WHERE id = $8`,
      [
        rule.name,
        rule.category,
        rule.logic,
        rule.explanation,
        rule.status,
        rule.priority,
        rule.disease_id,
        id,
      ]
    );

    // If conditions are provided, replace them
    if (rule.conditions) {
      await db.query('DELETE FROM conditions WHERE rule_id = $1', [id]);

      for (let i = 0; i < rule.conditions.length; i++) {
        const condition = rule.conditions[i];
        await db.query(
          `INSERT INTO conditions (rule_id, variable, operator, value, position)
           VALUES ($1, $2, $3, $4, $5)`,
          [
            id,
            condition.variable,
            condition.operator,
            JSON.stringify(condition.value),
            i,
          ]
        );
      }
    }

    // If conclusions are provided, replace them
    if (rule.conclusions) {
      await db.query('DELETE FROM conclusions WHERE rule_id = $1', [id]);

      for (let i = 0; i < rule.conclusions.length; i++) {
        const conclusion = rule.conclusions[i];
        await db.query(
          `INSERT INTO conclusions (rule_id, variable, value, position)
           VALUES ($1, $2, $3, $4)`,
          [id, conclusion.variable, JSON.stringify(conclusion.value), i]
        );
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating rule:', error);
    return NextResponse.json(
      { error: 'Failed to update rule' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    await db.query('DELETE FROM rules WHERE id = $1', [id]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting rule:', error);
    return NextResponse.json(
      { error: 'Failed to delete rule' },
      { status: 500 }
    );
  }
}
