import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/client';

export const dynamic = 'force-dynamic';

interface VariableDiseaseMapping {
  variable: string;
  diseases: {
    id: string;
    name: string;
  }[];
}

export async function GET(request: NextRequest) {
  try {
    // Get all variables used in conditions and which diseases they belong to
    // Exclude basic patient info from disease filtering (always available)
    const result = await db.query(`
      SELECT DISTINCT
        c.variable,
        d.id as disease_id,
        d.name as disease_name
      FROM conditions c
      JOIN rules r ON c.rule_id = r.id
      JOIN diseases d ON r.disease_id = d.id
      WHERE c.variable IS NOT NULL
        AND c.variable NOT IN ('PATIENT_INFO.age', 'PATIENT_INFO.sex')
      ORDER BY c.variable, d.name
    `);

    // Group by variable
    const mappingMap = new Map<string, { id: string; name: string }[]>();

    for (const row of result.rows) {
      const variable = row.variable;
      const disease = { id: row.disease_id, name: row.disease_name };

      if (!mappingMap.has(variable)) {
        mappingMap.set(variable, []);
      }

      const diseases = mappingMap.get(variable)!;
      // Avoid duplicates
      if (!diseases.some(d => d.id === disease.id)) {
        diseases.push(disease);
      }
    }

    // Convert to array
    const mappings: VariableDiseaseMapping[] = [];
    mappingMap.forEach((diseases, variable) => {
      mappings.push({ variable, diseases });
    });

    // Also get all diseases for the filter dropdown
    const diseasesResult = await db.query(`
      SELECT id, name FROM diseases ORDER BY name
    `);

    return NextResponse.json({
      mappings,
      diseases: diseasesResult.rows,
    });
  } catch (error) {
    console.error('Error fetching variable mappings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch variable mappings' },
      { status: 500 }
    );
  }
}
