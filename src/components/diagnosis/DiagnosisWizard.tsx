'use client';

import React, { useState, useMemo } from 'react';
import { WIZARD_STEPS, getInputSteps } from '@/config/steps';
import { VARIABLE_SCHEMAS } from '@/config/variables';
import { WorkingMemory, DiagnosisResult } from '@/types/diagnosis';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { StepInput } from './StepInput';
import { DynamicResults } from './DynamicResults';
import {
  User,
  Stethoscope,
  AlertTriangle,
  FlaskConical,
  ClipboardCheck,
  ChevronLeft,
  ChevronRight,
  Check,
  Loader2,
  RotateCcw,
} from 'lucide-react';

// Icon mapping
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  User,
  Stethoscope,
  AlertTriangle,
  FlaskConical,
  ClipboardCheck,
};

interface DiagnosisWizardProps {
  onComplete?: (result: DiagnosisResult) => void;
}

export function DiagnosisWizard({ onComplete }: DiagnosisWizardProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [formData, setFormData] = useState<WorkingMemory>({});
  const [diagnosisResult, setDiagnosisResult] = useState<DiagnosisResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currentStep = WIZARD_STEPS[currentStepIndex];
  const isInputStep = currentStep.type === 'input';
  const isResultStep = currentStep.type === 'result';
  const isFirstStep = currentStepIndex === 0;
  const isLastInputStep = currentStepIndex === getInputSteps().length - 1;
  const isLastStep = currentStepIndex === WIZARD_STEPS.length - 1;

  // Get variables for current input step
  const currentStepVariables = useMemo(() => {
    if (!isInputStep || !currentStep.inputNamespaces) return [];
    return VARIABLE_SCHEMAS.filter((ns) =>
      currentStep.inputNamespaces!.includes(ns.namespace)
    );
  }, [currentStep, isInputStep]);

  // Count total filled variables across all steps
  const totalFilledCount = useMemo(() => {
    return Object.keys(formData).filter(
      (key) => formData[key] !== undefined && formData[key] !== null && formData[key] !== ''
    ).length;
  }, [formData]);

  // Count filled variables for current step
  const currentStepFilledCount = useMemo(() => {
    if (!isInputStep) return 0;
    let count = 0;
    currentStepVariables.forEach((ns) => {
      Object.keys(ns.variables).forEach((field) => {
        const key = `${ns.namespace}.${field}`;
        if (formData[key] !== undefined && formData[key] !== null && formData[key] !== '') {
          count++;
        }
      });
    });
    return count;
  }, [currentStepVariables, formData, isInputStep]);

  const handleVariableChange = (variable: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [variable]: value,
    }));
  };

  const handleVariableRemove = (variable: string) => {
    setFormData((prev) => {
      const newData = { ...prev };
      delete newData[variable];
      return newData;
    });
  };

  const runDiagnosis = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/diagnosis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symptoms: formData }),
      });

      if (!response.ok) {
        throw new Error('Failed to process diagnosis');
      }

      const data = await response.json();
      setDiagnosisResult(data.result);
      onComplete?.(data.result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleNext = async () => {
    // If this is the last input step, run diagnosis before moving to results
    if (isLastInputStep) {
      await runDiagnosis();
    }

    if (currentStepIndex < WIZARD_STEPS.length - 1) {
      setCurrentStepIndex((prev) => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex((prev) => prev - 1);
    }
  };

  const handleStepClick = (index: number) => {
    // Can navigate to any input step, or to results if we have results
    const targetStep = WIZARD_STEPS[index];
    if (targetStep.type === 'input' || diagnosisResult) {
      setCurrentStepIndex(index);
    }
  };

  const handleReset = () => {
    setFormData({});
    setDiagnosisResult(null);
    setCurrentStepIndex(0);
    setError(null);
  };

  const Icon = iconMap[currentStep.icon] || ClipboardCheck;

  return (
    <div className="max-w-5xl mx-auto">
      {/* Stepper Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between overflow-x-auto pb-4 gap-2">
          {WIZARD_STEPS.map((step, index) => {
            const StepIcon = iconMap[step.icon] || ClipboardCheck;
            const isActive = index === currentStepIndex;
            const isCompleted = step.type === 'input'
              ? index < currentStepIndex
              : diagnosisResult !== null;
            const isDisabled = step.type === 'result' && !diagnosisResult && index !== currentStepIndex;

            return (
              <React.Fragment key={step.id}>
                <button
                  onClick={() => handleStepClick(index)}
                  disabled={isDisabled}
                  className={`flex flex-col items-center min-w-[70px] transition-all ${
                    isDisabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer hover:opacity-80'
                  }`}
                >
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 transition-all border-2 ${
                      isActive
                        ? 'bg-primary text-primary-foreground border-primary ring-4 ring-primary/20'
                        : isCompleted
                        ? 'bg-green-600 text-white border-green-600'
                        : 'bg-muted text-muted-foreground border-muted'
                    }`}
                  >
                    {isCompleted && !isActive ? (
                      <Check className="h-6 w-6" />
                    ) : (
                      <StepIcon className="h-6 w-6" />
                    )}
                  </div>
                  <span
                    className={`text-xs text-center leading-tight ${
                      isActive ? 'font-semibold text-primary' : 'text-muted-foreground'
                    }`}
                  >
                    {step.title_vi}
                  </span>
                </button>

                {index < WIZARD_STEPS.length - 1 && (
                  <div
                    className={`flex-1 h-1 min-w-[20px] rounded ${
                      index < currentStepIndex ? 'bg-green-600' : 'bg-muted'
                    }`}
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive">
          <p className="font-semibold">Lỗi:</p>
          <p>{error}</p>
        </div>
      )}

      {/* Step Content */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-primary/10 rounded-lg">
                <Icon className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-xl">{currentStep.title_vi}</CardTitle>
                <CardDescription>{currentStep.description_vi}</CardDescription>
              </div>
            </div>
            {isInputStep && (
              <Badge variant="secondary" className="text-sm">
                {currentStepFilledCount} đã nhập
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {isInputStep ? (
            <StepInput
              namespaces={currentStepVariables}
              formData={formData}
              onChange={handleVariableChange}
              onRemove={handleVariableRemove}
            />
          ) : (
            <DynamicResults
              result={diagnosisResult}
              isLoading={isLoading}
            />
          )}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={isFirstStep || isLoading}
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          Quay lại
        </Button>

        <div className="flex items-center gap-3">
          {/* Show total filled count */}
          <span className="text-sm text-muted-foreground hidden sm:block">
            Tổng: {totalFilledCount} biến đã nhập
          </span>

          {diagnosisResult && (
            <Button variant="outline" onClick={handleReset}>
              <RotateCcw className="h-4 w-4 mr-2" />
              Chẩn đoán mới
            </Button>
          )}

          {!isLastStep && (
            <Button
              onClick={handleNext}
              disabled={isLoading}
              size="lg"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Đang xử lý...
                </>
              ) : isLastInputStep ? (
                <>
                  Chẩn đoán
                  <ChevronRight className="h-4 w-4 ml-2" />
                </>
              ) : (
                <>
                  Tiếp tục
                  <ChevronRight className="h-4 w-4 ml-2" />
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
