'use client';

import React, { useState } from 'react';
import { getInputNamespaces } from '@/config/variables';
import { VariableInput } from './VariableInput';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { WorkingMemory } from '@/types/diagnosis';

interface SymptomFormProps {
  onSubmit: (symptoms: WorkingMemory) => void;
  isLoading?: boolean;
}

export function SymptomForm({ onSubmit, isLoading = false }: SymptomFormProps) {
  const namespaces = getInputNamespaces();
  const [currentStep, setCurrentStep] = useState(0);
  const [symptoms, setSymptoms] = useState<WorkingMemory>({});

  const currentNamespace = namespaces[currentStep];
  const isLastStep = currentStep === namespaces.length - 1;
  const isFirstStep = currentStep === 0;

  const handleVariableChange = (variable: string, value: any) => {
    setSymptoms((prev) => ({
      ...prev,
      [variable]: value,
    }));
  };

  const handleNext = () => {
    if (!isLastStep) {
      setCurrentStep((prev) => prev + 1);
    } else {
      // Submit the form
      onSubmit(symptoms);
    }
  };

  const handlePrevious = () => {
    if (!isFirstStep) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleReset = () => {
    setSymptoms({});
    setCurrentStep(0);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>{currentNamespace.label_vi}</CardTitle>
          <CardDescription>
            {currentNamespace.label_en} (Bước {currentStep + 1} / {namespaces.length})
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Progress indicator */}
          <div className="w-full bg-secondary rounded-full h-2">
            <div
              className="bg-primary h-2 rounded-full transition-all"
              style={{ width: `${((currentStep + 1) / namespaces.length) * 100}%` }}
            />
          </div>

          {/* Variable inputs for current namespace */}
          <div className="space-y-4">
            {Object.entries(currentNamespace.variables).map(([fieldName, definition]) => {
              const variable = `${currentNamespace.namespace}.${fieldName}`;
              return (
                <VariableInput
                  key={variable}
                  variable={variable}
                  definition={definition}
                  value={symptoms[variable]}
                  onChange={(value) => handleVariableChange(variable, value)}
                />
              );
            })}
          </div>

          {/* Navigation buttons */}
          <div className="flex justify-between items-center pt-4">
            <div>
              {!isFirstStep && (
                <Button variant="outline" onClick={handlePrevious} disabled={isLoading}>
                  ← Quay lại
                </Button>
              )}
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" onClick={handleReset} disabled={isLoading}>
                Đặt lại
              </Button>
              <Button onClick={handleNext} disabled={isLoading}>
                {isLoading ? 'Đang xử lý...' : isLastStep ? 'Chẩn đoán' : 'Tiếp theo →'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
