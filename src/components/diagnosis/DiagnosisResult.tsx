'use client';

import React, { useState } from 'react';
import { DiagnosisResult as DiagnosisResultType } from '@/types/diagnosis';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertCircle, CheckCircle, ChevronDown, ChevronUp } from 'lucide-react';

interface DiagnosisResultProps {
  result: DiagnosisResultType;
  onNewDiagnosis: () => void;
}

export function DiagnosisResult({ result, onNewDiagnosis }: DiagnosisResultProps) {
  const [showFiredRules, setShowFiredRules] = useState(false);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Main Diagnosis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-6 w-6 text-green-600" />
            Kết quả chẩn đoán
          </CardTitle>
          <CardDescription>Chẩn đoán dựa trên các triệu chứng đã nhập</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {result.diagnosis.main_diagnosis ? (
            <div>
              <h3 className="font-semibold text-lg mb-2">Chẩn đoán chính:</h3>
              <p className="text-2xl font-bold text-primary">{result.diagnosis.main_diagnosis}</p>
            </div>
          ) : (
            <div className="text-muted-foreground">
              <p>Không có chẩn đoán chính. Vui lòng nhập đầy đủ thông tin triệu chứng.</p>
            </div>
          )}

          {result.diagnosis.differential_list && result.diagnosis.differential_list.length > 0 && (
            <div>
              <h3 className="font-semibold mb-2">Chẩn đoán phân biệt:</h3>
              <div className="flex flex-wrap gap-2">
                {result.diagnosis.differential_list.map((diagnosis, index) => (
                  <Badge key={index} variant="outline">
                    {diagnosis}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {result.diagnosis.complication_flag && (
            <div className="flex items-start gap-2 p-4 bg-destructive/10 border border-destructive/20 rounded-md">
              <AlertCircle className="h-5 w-5 text-destructive mt-0.5" />
              <div>
                <h3 className="font-semibold text-destructive">Cảnh báo biến chứng</h3>
                {result.diagnosis.complication_type && (
                  <p className="text-sm mt-1">{result.diagnosis.complication_type}</p>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Risk Assessment */}
      {result.risk?.overall_infection_risk && (
        <Card>
          <CardHeader>
            <CardTitle>Đánh giá nguy cơ</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <span className="font-medium">Nguy cơ nhiễm trùng:</span>
              <Badge
                variant={
                  result.risk.overall_infection_risk === 'Cao' ||
                  result.risk.overall_infection_risk === 'Tăng'
                    ? 'destructive'
                    : 'secondary'
                }
              >
                {result.risk.overall_infection_risk}
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Treatment Plan */}
      {result.treatment && Object.values(result.treatment).some((v) => v) && (
        <Card>
          <CardHeader>
            <CardTitle>Kế hoạch điều trị</CardTitle>
            <CardDescription>Đề xuất điều trị dựa trên chẩn đoán</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {result.treatment.local_antiseptic && (
              <div>
                <h4 className="font-semibold mb-1">Sát trùng tại chỗ:</h4>
                <div className="flex flex-wrap gap-2">
                  {Array.isArray(result.treatment.local_antiseptic)
                    ? result.treatment.local_antiseptic.map((item, i) => (
                        <Badge key={i} variant="outline">
                          {item}
                        </Badge>
                      ))
                    : <Badge variant="outline">{result.treatment.local_antiseptic}</Badge>}
                </div>
              </div>
            )}

            {result.treatment.topical_antibiotic && (
              <div>
                <h4 className="font-semibold mb-1">Kháng sinh bôi:</h4>
                <p>{result.treatment.topical_antibiotic}</p>
              </div>
            )}

            {result.treatment.systemic_antibiotic && (
              <div>
                <h4 className="font-semibold mb-1">Kháng sinh toàn thân:</h4>
                <p>
                  {Array.isArray(result.treatment.systemic_antibiotic)
                    ? result.treatment.systemic_antibiotic.join(', ')
                    : result.treatment.systemic_antibiotic}
                </p>
              </div>
            )}

            {result.treatment.treatment_duration && (
              <div>
                <h4 className="font-semibold mb-1">Thời gian điều trị:</h4>
                <p>{result.treatment.treatment_duration}</p>
              </div>
            )}

            {result.treatment.antipruritic && (
              <div>
                <h4 className="font-semibold mb-1">Thuốc giảm ngứa:</h4>
                <p>{result.treatment.antipruritic}</p>
              </div>
            )}

            {result.treatment.pain_relief && (
              <div>
                <h4 className="font-semibold mb-1">Giảm đau:</h4>
                <p>{result.treatment.pain_relief}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Fired Rules */}
      {result.firedRules && result.firedRules.length > 0 && (
        <Card>
          <CardHeader>
            <button
              className="w-full flex items-center justify-between cursor-pointer"
              onClick={() => setShowFiredRules(!showFiredRules)}
            >
              <div>
                <CardTitle>Quy tắc đã áp dụng ({result.firedRules.length})</CardTitle>
                <CardDescription>Các quy tắc được sử dụng để đưa ra chẩn đoán</CardDescription>
              </div>
              {showFiredRules ? (
                <ChevronUp className="h-5 w-5" />
              ) : (
                <ChevronDown className="h-5 w-5" />
              )}
            </button>
          </CardHeader>
          {showFiredRules && (
            <CardContent>
              <div className="space-y-3">
                {result.firedRules.map((rule, index) => (
                  <div key={index} className="p-3 border rounded-md">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-semibold">{rule.ruleName}</h4>
                      <Badge variant="secondary" className="text-xs">
                        {rule.ruleId}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{rule.explanation}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          )}
        </Card>
      )}

      {/* Actions */}
      <div className="flex justify-center">
        <Button onClick={onNewDiagnosis} size="lg">
          Chẩn đoán mới
        </Button>
      </div>
    </div>
  );
}
