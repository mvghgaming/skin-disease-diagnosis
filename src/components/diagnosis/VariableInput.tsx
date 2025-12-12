'use client';

import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { VariableDefinition } from '@/config/variables';

interface VariableInputProps {
  variable: string;
  definition: VariableDefinition;
  value: any;
  onChange: (value: any) => void;
}

export function VariableInput({ variable, definition, value, onChange }: VariableInputProps) {
  const renderInput = () => {
    // Boolean type - render as select with Yes/No options
    if (definition.type === 'boolean') {
      return (
        <Select
          value={value === null || value === undefined ? '' : String(value)}
          onChange={(e) => onChange(e.target.value === 'true')}
        >
          <option value="">-- Chọn --</option>
          <option value="true">Có</option>
          <option value="false">Không</option>
        </Select>
      );
    }

    // String type with enum - render as select
    if (definition.type === 'string' && definition.enum) {
      return (
        <Select value={value || ''} onChange={(e) => onChange(e.target.value)}>
          <option value="">-- Chọn --</option>
          {definition.enum.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </Select>
      );
    }

    // String type without enum - render as text input
    if (definition.type === 'string') {
      return (
        <Input
          type="text"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={definition.label_vi}
        />
      );
    }

    // Number type
    if (definition.type === 'number') {
      return (
        <Input
          type="number"
          value={value || ''}
          onChange={(e) => onChange(Number(e.target.value))}
          placeholder={definition.label_vi}
          min={definition.validation?.min}
          max={definition.validation?.max}
        />
      );
    }

    // Array type - for now, render as text input (comma-separated)
    if (definition.type === 'array') {
      const arrayValue = Array.isArray(value) ? value.join(', ') : '';
      return (
        <Input
          type="text"
          value={arrayValue}
          onChange={(e) => {
            const values = e.target.value.split(',').map((v) => v.trim()).filter((v) => v);
            onChange(values);
          }}
          placeholder="Nhập các giá trị, cách nhau bằng dấu phẩy"
        />
      );
    }

    return <Input type="text" value={value || ''} onChange={(e) => onChange(e.target.value)} />;
  };

  return (
    <div className="space-y-2">
      <Label htmlFor={variable}>
        {definition.label_vi}
        {definition.validation?.required && <span className="text-destructive ml-1">*</span>}
      </Label>
      {renderInput()}
      {definition.label_en !== definition.label_vi && (
        <p className="text-xs text-muted-foreground">{definition.label_en}</p>
      )}
    </div>
  );
}
