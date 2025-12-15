'use client';

import React, { useState, useMemo } from 'react';
import { DiagnosisResult, FiredRule } from '@/types/diagnosis';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Info,
  Loader2,
  FileX,
  Pill,
  Stethoscope,
  BookOpen,
} from 'lucide-react';

interface DynamicResultsProps {
  result: DiagnosisResult | null;
  isLoading?: boolean;
}

// Map group names to icons
const GROUP_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  'default': BookOpen,
};

// Group priority for sorting (lower = higher priority)
const GROUP_PRIORITY: Record<string, number> = {
  'Chẩn đoán': 1,
  'Xác định chẩn đoán – WHO': 2,
  'Nhận diện thương tổn – phân thể': 3,
  'Chẩn đoán thể bệnh': 4,
  'Xác định căn nguyên': 5,
  'Chẩn đoán phân biệt': 10,
  'Đánh giá mức độ': 20,
  'Yếu tố nguy cơ': 21,
  'Nguyên nhân – nguy cơ – cơ chế lây': 22,
  'Thần kinh – biến chứng': 25,
  'Biến chứng': 26,
  'Điều trị': 30,
  'Điều trị MDT': 31,
  'Nguyên tắc điều trị': 32,
  'Điều trị triệu chứng': 33,
  'Điều trị hỗ trợ': 34,
  'Thủ thuật': 35,
  'Cảnh báo': 40,
  'Cảnh báo an toàn': 41,
  'Cảnh báo tương tác thuốc': 42,
  'Cảnh báo tác dụng phụ': 43,
  'Tư vấn': 50,
  'Tư vấn chăm sóc': 51,
  'Phòng bệnh': 60,
  'Phòng ngừa/tái phát': 61,
  'Tiên lượng': 70,
  'Tiên lượng – phòng bệnh': 71,
};

// Group categories for coloring
const GROUP_CATEGORIES: Record<string, string> = {
  'Chẩn đoán': 'diagnosis',
  'Xác định chẩn đoán – WHO': 'diagnosis',
  'Nhận diện thương tổn – phân thể': 'diagnosis',
  'Chẩn đoán thể bệnh': 'diagnosis',
  'Xác định căn nguyên': 'diagnosis',
  'Chẩn đoán phân biệt': 'differential',
  'Đánh giá mức độ': 'severity',
  'Yếu tố nguy cơ': 'risk',
  'Nguyên nhân – nguy cơ – cơ chế lây': 'risk',
  'Thần kinh – biến chứng': 'complication',
  'Biến chứng': 'complication',
  'Điều trị': 'treatment',
  'Điều trị MDT': 'treatment',
  'Nguyên tắc điều trị': 'treatment',
  'Điều trị triệu chứng': 'treatment',
  'Điều trị hỗ trợ': 'treatment',
  'Thủ thuật': 'treatment',
  'Cảnh báo': 'warning',
  'Cảnh báo an toàn': 'warning',
  'Cảnh báo tương tác thuốc': 'warning',
  'Cảnh báo tác dụng phụ': 'warning',
  'Tư vấn': 'advice',
  'Tư vấn chăm sóc': 'advice',
  'Phòng bệnh': 'prevention',
  'Phòng ngừa/tái phát': 'prevention',
  'Tiên lượng': 'prognosis',
  'Tiên lượng – phòng bệnh': 'prognosis',
};

const CATEGORY_COLORS: Record<string, { bg: string; border: string; text: string; icon: string }> = {
  diagnosis: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-800', icon: 'text-blue-600' },
  differential: { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-800', icon: 'text-purple-600' },
  severity: { bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-800', icon: 'text-orange-600' },
  risk: { bg: 'bg-yellow-50', border: 'border-yellow-200', text: 'text-yellow-800', icon: 'text-yellow-600' },
  complication: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-800', icon: 'text-red-600' },
  treatment: { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-800', icon: 'text-green-600' },
  warning: { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-800', icon: 'text-amber-600' },
  advice: { bg: 'bg-cyan-50', border: 'border-cyan-200', text: 'text-cyan-800', icon: 'text-cyan-600' },
  prevention: { bg: 'bg-teal-50', border: 'border-teal-200', text: 'text-teal-800', icon: 'text-teal-600' },
  prognosis: { bg: 'bg-indigo-50', border: 'border-indigo-200', text: 'text-indigo-800', icon: 'text-indigo-600' },
  default: { bg: 'bg-gray-50', border: 'border-gray-200', text: 'text-gray-800', icon: 'text-gray-600' },
};

export function DynamicResults({ result, isLoading }: DynamicResultsProps) {
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

  // Group fired rules by their group field
  const groupedRules = useMemo(() => {
    if (!result?.firedRules) return new Map<string, FiredRule[]>();

    const groups = new Map<string, FiredRule[]>();

    result.firedRules.forEach((rule) => {
      const groupName = rule.group || 'Khác';
      if (!groups.has(groupName)) {
        groups.set(groupName, []);
      }
      groups.get(groupName)!.push(rule);
    });

    // Sort groups by priority
    const sortedEntries = Array.from(groups.entries()).sort((a, b) => {
      const priorityA = GROUP_PRIORITY[a[0]] ?? 999;
      const priorityB = GROUP_PRIORITY[b[0]] ?? 999;
      return priorityA - priorityB;
    });

    return new Map(sortedEntries);
  }, [result?.firedRules]);

  const toggleGroup = (groupName: string) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(groupName)) {
        next.delete(groupName);
      } else {
        next.add(groupName);
      }
      return next;
    });
  };

  const expandAll = () => {
    setExpandedGroups(new Set(groupedRules.keys()));
  };

  const collapseAll = () => {
    setExpandedGroups(new Set());
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-lg font-medium">Đang phân tích và chẩn đoán...</p>
        <p className="text-sm text-muted-foreground mt-1">Vui lòng đợi trong giây lát</p>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
        <FileX className="h-12 w-12 mb-4" />
        <p className="text-lg">Chưa có kết quả chẩn đoán</p>
        <p className="text-sm">Vui lòng hoàn thành các bước nhập liệu</p>
      </div>
    );
  }

  const mainDiagnosis = result.workingMemory['DIAGNOSIS_ASSESSMENT.main_diagnosis'];
  const severity = result.workingMemory['SEVERITY_ASSESSMENT.overall_severity'];
  const diagnosticCertainty = result.workingMemory['DIAGNOSIS_ASSESSMENT.diagnostic_certainty'];

  return (
    <div className="space-y-6">
      {/* Main Diagnosis Summary */}
      <Card className={mainDiagnosis ? 'border-green-300 bg-white' : 'bg-white'}>
        <CardContent className="pt-6">
          {mainDiagnosis ? (
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <h2 className="text-sm font-medium text-gray-600 mb-1">Chẩn đoán chính</h2>
              <p className="text-3xl font-bold text-green-700 mb-2">
                {mainDiagnosis}
              </p>
              <div className="flex items-center justify-center gap-2 flex-wrap">
                {severity && (
                  <Badge
                    variant={severity === 'Nặng' ? 'destructive' : severity === 'Trung bình' ? 'default' : 'secondary'}
                  >
                    Mức độ: {severity}
                  </Badge>
                )}
                {diagnosticCertainty && (
                  <Badge variant="outline">{diagnosticCertainty}</Badge>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
                <Info className="h-8 w-8 text-muted-foreground" />
              </div>
              <h2 className="text-lg font-medium mb-1">Không đủ thông tin</h2>
              <p className="text-sm text-muted-foreground">
                Không đủ thông tin để đưa ra chẩn đoán chính.<br />
                Vui lòng kiểm tra lại các triệu chứng đã nhập.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Statistics & Controls */}
      {groupedRules.size > 0 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground">{result.firedRules.length}</span> luật đã áp dụng trong{' '}
            <span className="font-medium text-foreground">{groupedRules.size}</span> nhóm
          </p>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={expandAll}>
              Mở tất cả
            </Button>
            <Button variant="ghost" size="sm" onClick={collapseAll}>
              Đóng tất cả
            </Button>
          </div>
        </div>
      )}

      {/* Grouped Rules */}
      {groupedRules.size > 0 ? (
        <div className="space-y-3">
          {Array.from(groupedRules.entries()).map(([groupName, rules]) => {
            const isExpanded = expandedGroups.has(groupName);
            const category = GROUP_CATEGORIES[groupName] || 'default';
            const colors = CATEGORY_COLORS[category];

            return (
              <div
                key={groupName}
                className={`border rounded-lg overflow-hidden ${colors.border}`}
              >
                <button
                  onClick={() => toggleGroup(groupName)}
                  className={`w-full flex items-center justify-between p-4 text-left transition-colors hover:bg-muted/50 ${colors.bg}`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg bg-white shadow-sm`}>
                      <Stethoscope className={`h-5 w-5 ${colors.icon}`} />
                    </div>
                    <div>
                      <h3 className={`font-semibold ${colors.text}`}>{groupName}</h3>
                      <p className="text-sm text-muted-foreground">
                        {rules.length} luật đã áp dụng
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">{rules.length}</Badge>
                    {isExpanded ? (
                      <ChevronUp className="h-5 w-5 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-muted-foreground" />
                    )}
                  </div>
                </button>

                {isExpanded && (
                  <div className="border-t divide-y bg-white">
                    {rules.map((rule, index) => (
                      <div key={`${rule.ruleId}-${index}`} className="p-4 bg-white">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <h4 className="font-medium text-sm text-gray-900">{rule.ruleName}</h4>
                          <Badge variant="outline" className="text-xs shrink-0">
                            {rule.ruleId}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 leading-relaxed">
                          {rule.explanation}
                        </p>
                        {rule.conclusions && rule.conclusions.length > 0 && (
                          <div className="mt-3 pt-3 border-t">
                            <p className="text-xs font-medium text-muted-foreground mb-2">Kết luận:</p>
                            <div className="flex flex-wrap gap-1">
                              {rule.conclusions.map((conclusion, i) => (
                                <Badge key={i} variant="secondary" className="text-xs">
                                  {conclusion.variable.split('.')[1]}: {String(conclusion.value)}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="py-8">
            <div className="text-center text-muted-foreground">
              <Info className="h-8 w-8 mx-auto mb-2" />
              <p>Không có luật nào được áp dụng với thông tin đã nhập</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Treatment Summary */}
      {result.treatment && Object.values(result.treatment).some((v) => v) && (
        <Card className="border-green-200 bg-white">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-green-700">
              <Pill className="h-5 w-5" />
              Tóm tắt điều trị
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {result.treatment.local_antiseptic && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Sát trùng tại chỗ</p>
                  <p className="font-medium">{Array.isArray(result.treatment.local_antiseptic) ? result.treatment.local_antiseptic.join(', ') : result.treatment.local_antiseptic}</p>
                </div>
              )}
              {result.treatment.topical_antibiotic && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Kháng sinh bôi</p>
                  <p className="font-medium">{result.treatment.topical_antibiotic}</p>
                </div>
              )}
              {result.treatment.systemic_antibiotic && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Kháng sinh toàn thân</p>
                  <p className="font-medium">{Array.isArray(result.treatment.systemic_antibiotic) ? result.treatment.systemic_antibiotic.join(', ') : result.treatment.systemic_antibiotic}</p>
                </div>
              )}
              {result.treatment.treatment_duration && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Thời gian điều trị</p>
                  <p className="font-medium">{result.treatment.treatment_duration}</p>
                </div>
              )}
              {result.treatment.pain_relief && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Giảm đau</p>
                  <p className="font-medium">{result.treatment.pain_relief}</p>
                </div>
              )}
              {result.treatment.antipruritic && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Giảm ngứa</p>
                  <p className="font-medium">{result.treatment.antipruritic}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

    </div>
  );
}
