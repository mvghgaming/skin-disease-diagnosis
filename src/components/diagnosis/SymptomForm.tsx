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
  const [symptoms, setSymptoms] = useState<WorkingMemory>({});

  const handleVariableChange = (variable: string, value: any) => {
    setSymptoms((prev) => ({
      ...prev,
      [variable]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(symptoms);
  };

  const handleReset = () => {
    setSymptoms({});
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-5xl mx-auto">
      <div className="space-y-6">
        {/* All sections on one page */}
        {namespaces.map((namespace, index) => (
          <Card key={namespace.namespace}>
            <CardHeader>
              <CardTitle className="text-xl">{namespace.label_vi}</CardTitle>
              <CardDescription className="text-sm">
                {namespace.label_en}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(namespace.variables).map(([fieldName, definition]) => {
                  const variable = `${namespace.namespace}.${fieldName}`;
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
            </CardContent>
          </Card>
        ))}

        {/* Submit buttons - sticky at bottom */}
        <div className="sticky bottom-0 bg-background border-t pt-4 pb-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleReset}
                  disabled={isLoading}
                  size="lg"
                >
                  Đặt lại
                </Button>
                <Button
                  type="submit"
                  disabled={isLoading}
                  size="lg"
                  className="min-w-[150px]"
                >
                  {isLoading ? 'Đang xử lý...' : 'Chẩn đoán'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </form>
  );
}
