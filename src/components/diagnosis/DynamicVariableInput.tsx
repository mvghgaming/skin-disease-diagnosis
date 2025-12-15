'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { VariableNamespace, VariableDefinition } from '@/config/variables';
import { WorkingMemory } from '@/types/diagnosis';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Plus, X, Check, Filter } from 'lucide-react';

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

interface Disease {
  id: string;
  name: string;
}

interface VariableDiseaseMapping {
  variable: string;
  diseases: Disease[];
}

export function DynamicVariableInput({
  namespaces,
  formData,
  onChange,
  onRemove,
}: DynamicVariableInputProps) {
  const [selectedVariable, setSelectedVariable] = useState<string>('');
  const [selectedValue, setSelectedValue] = useState<any>('');
  const [selectedDiseaseFilter, setSelectedDiseaseFilter] = useState<string>('');
  const [diseases, setDiseases] = useState<Disease[]>([]);
  const [variableMappings, setVariableMappings] = useState<Map<string, Disease[]>>(new Map());
  const [isLoadingMappings, setIsLoadingMappings] = useState(true);

  // Fetch disease mappings on mount
  useEffect(() => {
    async function fetchMappings() {
      try {
        const response = await fetch('/api/variables');
        if (response.ok) {
          const data = await response.json();
          setDiseases(data.diseases || []);

          // Build mapping
          const mappingMap = new Map<string, Disease[]>();
          for (const mapping of data.mappings || []) {
            mappingMap.set(mapping.variable, mapping.diseases);
          }
          setVariableMappings(mappingMap);
        }
      } catch (error) {
        console.error('Failed to fetch variable mappings:', error);
      } finally {
        setIsLoadingMappings(false);
      }
    }
    fetchMappings();
  }, []);

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

  // Filter available variables by disease
  const filteredAvailableVariables = useMemo(() => {
    if (!selectedDiseaseFilter) {
      return availableVariables;
    }
    return availableVariables.filter((v) => {
      const diseases = variableMappings.get(v.variable);
      return diseases?.some((d) => d.id === selectedDiseaseFilter);
    });
  }, [availableVariables, selectedDiseaseFilter, variableMappings]);

  // Get added variables
  const addedVariables = useMemo(() => {
    return allVariables.filter((v) => formData[v.variable] !== undefined);
  }, [allVariables, formData]);

  // Get current selected variable definition
  const currentDefinition = useMemo(() => {
    if (!selectedVariable) return null;
    return allVariables.find((v) => v.variable === selectedVariable);
  }, [selectedVariable, allVariables]);

  // Get disease names for a variable
  const getDiseasesForVariable = (variable: string): Disease[] => {
    return variableMappings.get(variable) || [];
  };

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

  const handleDiseaseFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedDiseaseFilter(e.target.value);
    setSelectedVariable('');
    setSelectedValue('');
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
      const vars = filteredAvailableVariables.filter((v) => v.namespace === ns.namespace);
      if (vars.length > 0) {
        groups.push({
          label: ns.label_vi,
          variables: vars,
        });
      }
    });
    return groups;
  }, [filteredAvailableVariables, namespaces]);

  const isAddDisabled = !selectedVariable || selectedValue === '' || selectedValue === null || selectedValue === undefined;

  // Format disease badges for display
  const formatDiseaseLabel = (variable: string): string => {
    const diseases = getDiseasesForVariable(variable);
    if (diseases.length === 0) return '';
    if (diseases.length === 1) return ` [${diseases[0].name}]`;
    if (diseases.length <= 3) return ` [${diseases.map(d => d.name).join(', ')}]`;
    return ` [${diseases.slice(0, 2).map(d => d.name).join(', ')} +${diseases.length - 2}]`;
  };

  return (
    <div className="space-y-4">
      {/* Disease Filter */}
      <div className="flex items-center gap-3 p-3 border rounded-lg bg-blue-50/50">
        <Filter className="h-4 w-4 text-blue-600 shrink-0" />
        <div className="flex-1">
          <label className="text-sm font-medium text-blue-900 mb-1 block">
            Lọc theo bệnh
          </label>
          <Select
            value={selectedDiseaseFilter}
            onChange={handleDiseaseFilterChange}
            className="w-full"
          >
            <option value="">-- Tất cả bệnh --</option>
            {diseases.map((disease) => (
              <option key={disease.id} value={disease.id}>
                {disease.name}
              </option>
            ))}
          </Select>
        </div>
        {selectedDiseaseFilter && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setSelectedDiseaseFilter('')}
            className="shrink-0"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Add new variable row */}
      <div className="flex flex-col sm:flex-row gap-3 p-4 border rounded-lg bg-muted/30">
        <div className="flex-1 min-w-0">
          <label className="text-sm font-medium mb-1.5 block">Chọn biến</label>
          <Select value={selectedVariable} onChange={handleVariableSelect}>
            <option value="">-- Chọn biến cần nhập --</option>
            {groupedVariables.map((group) => (
              <optgroup key={group.label} label={group.label}>
                {group.variables.map((v) => {
                  const diseaseLabel = formatDiseaseLabel(v.variable);
                  return (
                    <option key={v.variable} value={v.variable}>
                      {v.definition.label_vi}{diseaseLabel}
                    </option>
                  );
                })}
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
              const varDiseases = getDiseasesForVariable(v.variable);
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
                    <div className="flex items-center gap-2 mt-1 ml-6 flex-wrap">
                      <span className="text-sm text-muted-foreground truncate">
                        {formatValue(formData[v.variable], v.definition)}
                      </span>
                      {varDiseases.length > 0 && (
                        <div className="flex gap-1 flex-wrap">
                          {varDiseases.slice(0, 3).map((d) => (
                            <Badge key={d.id} variant="secondary" className="text-xs">
                              {d.name}
                            </Badge>
                          ))}
                          {varDiseases.length > 3 && (
                            <Badge variant="secondary" className="text-xs">
                              +{varDiseases.length - 3}
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>
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
        <span>
          {selectedDiseaseFilter
            ? `Hiển thị ${filteredAvailableVariables.length} biến (lọc theo bệnh)`
            : `Còn ${availableVariables.length} biến chưa nhập`}
        </span>
        <span>Tổng: {allVariables.length} biến</span>
      </div>
    </div>
  );
}
