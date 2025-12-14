'use client';

import React, { useState, useMemo } from 'react';
import { VariableNamespace, VariableDefinition } from '@/config/variables';
import { WorkingMemory } from '@/types/diagnosis';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Plus, X, Check } from 'lucide-react';

interface DynamicVariableInputProps {
  namespaces: VariableNamespace[];
  formData: WorkingMemory;
  onChange: (variable: string, value: any) => void;
  onRemove: (variable: string) => void;
}

interface VariableOption {
  variable: string;
  namespace: string;
  fieldName: string;
  definition: VariableDefinition;
}

export function DynamicVariableInput({
  namespaces,
  formData,
  onChange,
  onRemove,
}: DynamicVariableInputProps) {
  const [selectedVariable, setSelectedVariable] = useState<string>('');
  const [selectedValue, setSelectedValue] = useState<any>('');

  // Build flat list of all variables
  const allVariables = useMemo(() => {
    const vars: VariableOption[] = [];
    namespaces.forEach((ns) => {
      Object.entries(ns.variables).forEach(([fieldName, definition]) => {
        vars.push({
          variable: `${ns.namespace}.${fieldName}`,
          namespace: ns.namespace,
          fieldName,
          definition,
        });
      });
    });
    return vars;
  }, [namespaces]);

  // Get variables that haven't been added yet
  const availableVariables = useMemo(() => {
    return allVariables.filter((v) => formData[v.variable] === undefined);
  }, [allVariables, formData]);

  // Get added variables
  const addedVariables = useMemo(() => {
    return allVariables.filter((v) => formData[v.variable] !== undefined);
  }, [allVariables, formData]);

  // Get current selected variable definition
  const currentDefinition = useMemo(() => {
    if (!selectedVariable) return null;
    return allVariables.find((v) => v.variable === selectedVariable);
  }, [selectedVariable, allVariables]);

  const handleAdd = () => {
    if (!selectedVariable || selectedValue === '' || selectedValue === null || selectedValue === undefined) {
      return;
    }

    // Convert value based on type
    let finalValue = selectedValue;
    if (currentDefinition?.definition.type === 'boolean') {
      finalValue = selectedValue === 'true';
    } else if (currentDefinition?.definition.type === 'number') {
      finalValue = Number(selectedValue);
    }

    onChange(selectedVariable, finalValue);
    setSelectedVariable('');
    setSelectedValue('');
  };

  const handleVariableSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedVariable(e.target.value);
    setSelectedValue('');
  };

  const handleValueChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    setSelectedValue(e.target.value);
  };

  const renderValueInput = () => {
    if (!currentDefinition) {
      return (
        <Input
          placeholder="Chọn biến trước..."
          disabled
          className="flex-1"
        />
      );
    }

    const def = currentDefinition.definition;

    if (def.type === 'boolean') {
      return (
        <Select
          value={selectedValue}
          onChange={handleValueChange}
          className="flex-1"
        >
          <option value="">-- Chọn giá trị --</option>
          <option value="true">Có</option>
          <option value="false">Không</option>
        </Select>
      );
    }

    if (def.enum && def.enum.length > 0) {
      return (
        <Select
          value={selectedValue}
          onChange={handleValueChange}
          className="flex-1"
        >
          <option value="">-- Chọn giá trị --</option>
          {def.enum.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </Select>
      );
    }

    if (def.type === 'number') {
      return (
        <Input
          type="number"
          placeholder="Nhập số..."
          value={selectedValue}
          onChange={handleValueChange}
          className="flex-1"
        />
      );
    }

    // Default: string input
    return (
      <Input
        placeholder="Nhập giá trị..."
        value={selectedValue}
        onChange={handleValueChange}
        className="flex-1"
      />
    );
  };

  const formatValue = (value: any, definition: VariableDefinition): string => {
    if (definition.type === 'boolean') {
      return value ? 'Có' : 'Không';
    }
    if (Array.isArray(value)) {
      return value.join(', ');
    }
    return String(value);
  };

  // Group variables by namespace for the dropdown
  const groupedVariables = useMemo(() => {
    const groups: { label: string; variables: VariableOption[] }[] = [];
    namespaces.forEach((ns) => {
      const vars = availableVariables.filter((v) => v.namespace === ns.namespace);
      if (vars.length > 0) {
        groups.push({
          label: ns.label_vi,
          variables: vars,
        });
      }
    });
    return groups;
  }, [availableVariables, namespaces]);

  const isAddDisabled = !selectedVariable || selectedValue === '' || selectedValue === null || selectedValue === undefined;

  return (
    <div className="space-y-4">
      {/* Add new variable row */}
      <div className="flex flex-col sm:flex-row gap-3 p-4 border rounded-lg bg-muted/30">
        <div className="flex-1 min-w-0">
          <label className="text-sm font-medium mb-1.5 block">Chọn biến</label>
          <Select value={selectedVariable} onChange={handleVariableSelect}>
            <option value="">-- Chọn biến cần nhập --</option>
            {groupedVariables.map((group) => (
              <optgroup key={group.label} label={group.label}>
                {group.variables.map((v) => (
                  <option key={v.variable} value={v.variable}>
                    {v.definition.label_vi}
                  </option>
                ))}
              </optgroup>
            ))}
          </Select>
        </div>

        <div className="flex-1 min-w-0">
          <label className="text-sm font-medium mb-1.5 block">Giá trị</label>
          {renderValueInput()}
        </div>

        <div className="flex items-end">
          <Button
            type="button"
            onClick={handleAdd}
            disabled={isAddDisabled}
            className="w-full sm:w-auto"
          >
            <Plus className="h-4 w-4 mr-1" />
            Thêm
          </Button>
        </div>
      </div>

      {/* Added variables list */}
      {addedVariables.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-muted-foreground">
              Đã thêm ({addedVariables.length} biến)
            </h4>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                addedVariables.forEach((v) => onRemove(v.variable));
              }}
              className="text-xs text-destructive hover:text-destructive"
            >
              Xóa tất cả
            </Button>
          </div>

          <div className="border rounded-lg divide-y max-h-[400px] overflow-y-auto">
            {addedVariables.map((v) => {
              const ns = namespaces.find((n) => n.namespace === v.namespace);
              return (
                <div
                  key={v.variable}
                  className="flex items-center justify-between p-3 hover:bg-muted/50"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Check className="h-4 w-4 text-green-600 shrink-0" />
                      <span className="font-medium truncate">{v.definition.label_vi}</span>
                      <Badge variant="outline" className="text-xs shrink-0">
                        {ns?.label_vi || v.namespace}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-0.5 ml-6 truncate">
                      {formatValue(formData[v.variable], v.definition)}
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => onRemove(v.variable)}
                    className="shrink-0 text-muted-foreground hover:text-destructive ml-2"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Empty state */}
      {addedVariables.length === 0 && (
        <div className="text-center py-8 text-muted-foreground border rounded-lg border-dashed">
          <p>Chưa có biến nào được thêm</p>
          <p className="text-sm mt-1">Chọn biến và giá trị, sau đó nhấn Thêm</p>
        </div>
      )}

      {/* Stats */}
      <div className="flex justify-between text-xs text-muted-foreground pt-2">
        <span>Còn {availableVariables.length} biến chưa nhập</span>
        <span>Tổng: {allVariables.length} biến</span>
      </div>
    </div>
  );
}
