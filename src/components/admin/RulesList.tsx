'use client';

import React from 'react';
import { Rule } from '@/types/rule';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface RulesListProps {
  rules: Rule[];
}

export function RulesList({ rules }: RulesListProps) {
  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      diagnosis: 'bg-blue-100 text-blue-800',
      diagnosis_support: 'bg-cyan-100 text-cyan-800',
      risk: 'bg-yellow-100 text-yellow-800',
      treatment: 'bg-green-100 text-green-800',
      differential: 'bg-purple-100 text-purple-800',
      symptom_support: 'bg-orange-100 text-orange-800',
      complication: 'bg-red-100 text-red-800',
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  if (rules.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-center text-muted-foreground">
            Không có quy tắc nào. Vui lòng seed dữ liệu từ file JSON.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {rules.map((rule) => (
        <Card key={rule.id}>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <CardTitle className="text-lg">{rule.name}</CardTitle>
                </div>
                <CardDescription>ID: {rule.id}</CardDescription>
              </div>
              <div className="flex flex-col items-end gap-2">
                <Badge className={getCategoryColor(rule.category)}>
                  {rule.category}
                </Badge>
                <Badge variant={rule.status === 'active' ? 'default' : 'secondary'}>
                  {rule.status}
                </Badge>
                <Badge variant="outline">{rule.logic}</Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <h4 className="font-semibold text-sm mb-1">Giải thích:</h4>
              <p className="text-sm text-muted-foreground">{rule.explanation}</p>
            </div>

            <div>
              <h4 className="font-semibold text-sm mb-1">
                Điều kiện ({rule.conditions.length}):
              </h4>
              <div className="space-y-1">
                {rule.conditions.map((condition, i) => (
                  <div key={i} className="text-xs font-mono bg-muted p-2 rounded">
                    {condition.variable} {condition.operator}{' '}
                    {JSON.stringify(condition.value)}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-sm mb-1">
                Kết luận ({rule.conclusions.length}):
              </h4>
              <div className="space-y-1">
                {rule.conclusions.map((conclusion, i) => (
                  <div key={i} className="text-xs font-mono bg-muted p-2 rounded">
                    {conclusion.variable} = {JSON.stringify(conclusion.value)}
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
