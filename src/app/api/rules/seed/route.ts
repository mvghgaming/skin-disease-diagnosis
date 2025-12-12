import { NextRequest, NextResponse } from 'next/server';
import { seedRulesFromJSON } from '@/lib/seed/seeder';
import { Rule } from '@/types/rule';

export async function POST(request: NextRequest) {
  try {
    const { jsonData, diseaseId, diseaseName, diseaseDescription } =
      await request.json();

    if (!jsonData || !Array.isArray(jsonData)) {
      return NextResponse.json(
        { error: 'Invalid JSON data - expected an array of rules' },
        { status: 400 }
      );
    }

    if (!diseaseId || !diseaseName) {
      return NextResponse.json(
        { error: 'diseaseId and diseaseName are required' },
        { status: 400 }
      );
    }

    // Validate rule structure
    for (const rule of jsonData) {
      if (!rule.id || !rule.name || !rule.category || !rule.logic) {
        return NextResponse.json(
          { error: 'Invalid rule structure - missing required fields' },
          { status: 400 }
        );
      }
    }

    // Seed the rules
    const result = await seedRulesFromJSON(
      jsonData as Rule[],
      diseaseId,
      diseaseName,
      diseaseDescription
    );

    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error('Seed error:', error);
    return NextResponse.json(
      { error: 'Failed to seed rules' },
      { status: 500 }
    );
  }
}
