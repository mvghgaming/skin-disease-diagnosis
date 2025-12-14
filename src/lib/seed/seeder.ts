import { Rule } from '@/types/rule';
import { db } from '../db/client';

export interface SeedResult {
  diseaseId: string;
  rulesInserted: number;
  conditionsInserted: number;
  conclusionsInserted: number;
}

/**
 * Seed rules from JSON into the database
 * @param rules Array of rules from JSON file
 * @param diseaseId ID of the disease these rules belong to
 * @param diseaseName Name of the disease
 * @param diseaseDescription Optional description
 * @returns Result of seeding operation
 */
export async function seedRulesFromJSON(
  rules: Rule[],
  diseaseId: string,
  diseaseName: string,
  diseaseDescription?: string
): Promise<SeedResult> {
  let rulesInserted = 0;
  let conditionsInserted = 0;
  let conclusionsInserted = 0;

  try {
    // First, insert or update the disease
    await db.query(
      `INSERT INTO diseases (id, name, description)
       VALUES ($1, $2, $3)
       ON CONFLICT (id) DO UPDATE
       SET name = $2, description = $3`,
      [diseaseId, diseaseName, diseaseDescription || null]
    );

    // Process each rule
    for (const rule of rules) {
      // Insert rule
      await db.query(
        `INSERT INTO rules (id, disease_id, name, category, logic, explanation, status, priority, rule_group)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         ON CONFLICT (id) DO UPDATE
         SET disease_id = $2, name = $3, category = $4, logic = $5,
             explanation = $6, status = $7, priority = $8, rule_group = $9`,
        [
          rule.id,
          diseaseId,
          rule.name,
          rule.category,
          rule.logic,
          rule.explanation,
          rule.status || 'active',
          rule.priority || 0,
          rule.group || null,
        ]
      );
      rulesInserted++;

      // Delete existing conditions and conclusions for this rule (if updating)
      await db.query('DELETE FROM conditions WHERE rule_id = $1', [rule.id]);
      await db.query('DELETE FROM conclusions WHERE rule_id = $1', [rule.id]);

      // Insert conditions
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
        conditionsInserted++;
      }

      // Insert conclusions
      for (let i = 0; i < rule.conclusions.length; i++) {
        const conclusion = rule.conclusions[i];
        await db.query(
          `INSERT INTO conclusions (rule_id, variable, value, position)
           VALUES ($1, $2, $3, $4)`,
          [
            rule.id,
            conclusion.variable,
            JSON.stringify(conclusion.value),
            i,
          ]
        );
        conclusionsInserted++;
      }
    }

    return {
      diseaseId,
      rulesInserted,
      conditionsInserted,
      conclusionsInserted,
    };
  } catch (error) {
    console.error('Seeding error:', error);
    throw error;
  }
}

/**
 * Delete all data for a specific disease
 * @param diseaseId ID of the disease to delete
 */
export async function deleteDiseaseData(diseaseId: string): Promise<void> {
  try {
    // Delete disease (will cascade to rules, conditions, conclusions)
    await db.query('DELETE FROM diseases WHERE id = $1', [diseaseId]);
  } catch (error) {
    console.error('Error deleting disease data:', error);
    throw error;
  }
}

/**
 * Get all rules for a disease from the database
 * @param diseaseId ID of the disease
 * @returns Array of rules with conditions and conclusions
 */
export async function getRulesByDisease(diseaseId: string): Promise<Rule[]> {
  try {
    const result = await db.query(
      `SELECT
        r.id, r.name, r.category, r.logic, r.explanation, r.status, r.priority,
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
       WHERE r.disease_id = $1
       GROUP BY r.id
       ORDER BY r.id`,
      [diseaseId]
    );

    return result.rows.map((row: any) => ({
      id: row.id,
      name: row.name,
      category: row.category,
      logic: row.logic,
      explanation: row.explanation,
      status: row.status,
      priority: row.priority,
      conditions: row.conditions || [],
      conclusions: row.conclusions || [],
      disease_id: diseaseId,
    }));
  } catch (error) {
    console.error('Error fetching rules:', error);
    throw error;
  }
}
