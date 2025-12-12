'use client';

import { useState } from 'react';
import { SymptomForm } from '@/components/diagnosis/SymptomForm';
import { DiagnosisResult } from '@/components/diagnosis/DiagnosisResult';
import { WorkingMemory } from '@/types/diagnosis';
import { DiagnosisResult as DiagnosisResultType } from '@/types/diagnosis';

export default function DiagnosisPage() {
  const [result, setResult] = useState<DiagnosisResultType | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmitSymptoms = async (symptoms: WorkingMemory) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/diagnosis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ symptoms }),
      });

      if (!response.ok) {
        throw new Error('Failed to process diagnosis');
      }

      const data = await response.json();
      setResult(data.result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewDiagnosis = () => {
    setResult(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold tracking-tight mb-2">
            Chẩn đoán bệnh
          </h1>
          <p className="text-xl text-muted-foreground">
            Nhập các triệu chứng để nhận chẩn đoán sơ bộ
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-md text-destructive">
            <p className="font-semibold">Lỗi:</p>
            <p>{error}</p>
          </div>
        )}

        {!result ? (
          <SymptomForm onSubmit={handleSubmitSymptoms} isLoading={isLoading} />
        ) : (
          <DiagnosisResult result={result} onNewDiagnosis={handleNewDiagnosis} />
        )}
      </div>
    </div>
  );
}
