import { useMemo, useCallback } from "react";
import { extractVariables } from "../lib/variables";

interface VariablesFormProps {
  code: string;
  variables: Record<string, string>;
  onVariablesChange: (variables: Record<string, string>) => void;
}

export default function VariablesForm({
  code,
  variables,
  onVariablesChange,
}: VariablesFormProps) {
  const variableNames = useMemo(() => extractVariables(code), [code]);

  const mergedVariables = useMemo(() => {
    const merged: Record<string, string> = {};
    for (const name of variableNames) {
      merged[name] = variables[name] ?? "";
    }
    return merged;
  }, [variableNames, variables]);

  const updateVariable = useCallback(
    (name: string, value: string) => {
      onVariablesChange({ ...variables, [name]: value });
    },
    [variables, onVariablesChange]
  );

  if (variableNames.length === 0) {
    return (
      <div className="variables-empty">
        No variables found. Use <code>$("Field Name")</code> in your code to
        create fillable fields.
      </div>
    );
  }

  return (
    <div className="variables-form">
      {variableNames.map((name) => {
        const value = mergedVariables[name] ?? "";
        return (
          <div key={name} className="variable-field">
            <label htmlFor={`var-${name}`}>{name}</label>
            <textarea
              id={`var-${name}`}
              value={value}
              onChange={(e) => updateVariable(name, e.target.value)}
              rows={Math.max(
                2,
                Math.min(6, (value.split("\n").length ?? 1) + 1)
              )}
            />
          </div>
        );
      })}
    </div>
  );
}
