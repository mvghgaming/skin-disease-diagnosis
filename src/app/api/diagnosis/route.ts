import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/client';
import { runInference } from '@/lib/inference/engine';
import { Rule } from '@/types/rule';
import { DiagnosisInput } from '@/types/diagnosis';

export async function POST(request: NextRequest) {
  try {
    const body: DiagnosisInput = await request.json();
    const { symptoms, sessionId } = body;

    if (!symptoms || typeof symptoms !== 'object') {
      return NextResponse.json(
        { error: 'Invalid symptoms data' },
        { status: 400 }
      );
    }

    // Create or retrieve session
    let currentSessionId = sessionId;

    if (!currentSessionId) {
      // Create new session
      const sessionResult = await db.query<{ id: string }>(
        `INSERT INTO diagnosis_sessions (status) VALUES ($1) RETURNING id`,
        ['active']
      );
      currentSessionId = sessionResult.rows[0].id;
    }

    // Store user facts
    for (const [variable, value] of Object.entries(symptoms)) {
      await db.query(
        `INSERT INTO session_facts (session_id, variable, value, source)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (session_id, variable)
         DO UPDATE SET value = $3`,
        [currentSessionId, variable, JSON.stringify(value), 'user']
      );
    }

    // Fetch all active rules with conditions and conclusions
    const rulesResult = await db.query(`
      SELECT
        r.id, r.name, r.category, r.logic, r.explanation, r.status, r.priority, r.rule_group,
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
      WHERE r.status = 'active'
      GROUP BY r.id
      ORDER BY r.id
    `);

    const rules: Rule[] = rulesResult.rows.map((row: any) => ({
      id: row.id,
      name: row.name,
      category: row.category,
      logic: row.logic,
      explanation: row.explanation,
      status: row.status,
      priority: row.priority,
      group: row.rule_group,
      conditions: row.conditions || [],
      conclusions: row.conclusions || [],
    }));

    // Run inference engine
    const { workingMemory, firedRules } = runInference(symptoms, rules);

    // Store inferred facts
    for (const [variable, value] of Object.entries(workingMemory)) {
      if (!(variable in symptoms)) {
        await db.query(
          `INSERT INTO session_facts (session_id, variable, value, source)
           VALUES ($1, $2, $3, $4)
           ON CONFLICT (session_id, variable)
           DO UPDATE SET value = $3`,
          [currentSessionId, variable, JSON.stringify(value), 'inferred']
        );
      }
    }

    // Store fired rules
    for (const firedRule of firedRules) {
      await db.query(
        `INSERT INTO fired_rules (session_id, rule_id, explanation)
         VALUES ($1, $2, $3)`,
        [currentSessionId, firedRule.ruleId, firedRule.explanation]
      );
    }

    // Update session status
    await db.query(
      `UPDATE diagnosis_sessions
       SET status = $1, completed_at = CURRENT_TIMESTAMP
       WHERE id = $2`,
      ['completed', currentSessionId]
    );

    // Format diagnosis result (using correct CONCEPT.attribute format)
    const result = {
      sessionId: currentSessionId,
      diagnosis: {
        main_diagnosis: workingMemory['DIAGNOSIS_ASSESSMENT.main_diagnosis'],
        differential_list: workingMemory['DIAGNOSIS_ASSESSMENT.differential_list'],
        complication_flag: workingMemory['DIAGNOSIS_ASSESSMENT.complication_flag'],
        complication_type: workingMemory['DIAGNOSIS_ASSESSMENT.complication_type'],
        diagnostic_certainty: workingMemory['DIAGNOSIS_ASSESSMENT.diagnostic_certainty'],
        subtype: workingMemory['DIAGNOSIS_ASSESSMENT.subtype'],
      },
      treatment: {
        local_antiseptic: workingMemory['TREATMENT_PLAN.local_antiseptic'],
        topical_antibiotic: workingMemory['TREATMENT_PLAN.topical_antibiotic'],
        systemic_antibiotic: workingMemory['TREATMENT_PLAN.systemic_antibiotic'],
        treatment_duration: workingMemory['TREATMENT_PLAN.treatment_duration'],
        antipruritic: workingMemory['TREATMENT_PLAN.antipruritic'],
        pain_relief: workingMemory['TREATMENT_PLAN.pain_relief'],
        regimen: workingMemory['TREATMENT_PLAN.regimen'],
        prevention_advice: workingMemory['TREATMENT_PLAN.prevention_advice'],
      },
      severity: {
        overall_severity: workingMemory['SEVERITY_ASSESSMENT.overall_severity'],
        extent_of_lesions: workingMemory['SEVERITY_ASSESSMENT.extent_of_lesions'],
        systemic_involvement: workingMemory['SEVERITY_ASSESSMENT.systemic_involvement'],
      },
      risk: {
        overall_infection_risk: workingMemory['RISK_FACTOR_ASSESSMENT.overall_infection_risk'],
      },
      firedRules,
      workingMemory,
    };

    return NextResponse.json({ result });
  } catch (error) {
    console.error('Diagnosis error:', error);
    return NextResponse.json(
      { error: 'Failed to process diagnosis' },
      { status: 500 }
    );
  }
}
