'use client';

import React from 'react';
import { VariableNamespace } from '@/config/variables';
import { WorkingMemory } from '@/types/diagnosis';
import { DynamicVariableInput } from './DynamicVariableInput';

interface StepInputProps {
  namespaces: VariableNamespace[];
  formData: WorkingMemory;
  onChange: (variable: string, value: any) => void;
  onRemove?: (variable: string) => void;
}

export function StepInput({ namespaces, formData, onChange, onRemove }: StepInputProps) {
  if (namespaces.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-8">
        Không có biến nào cho bước này
      </div>
    );
  }

  const handleRemove = (variable: string) => {
    if (onRemove) {
      onRemove(variable);
    }
  };

  return (
    <DynamicVariableInput
      namespaces={namespaces}
      formData={formData}
      onChange={onChange}
      onRemove={handleRemove}
    />
  );
}
