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
      <div className="p-8 text-center text-text-muted text-sm">
        No variables found. Use{" "}
        <code className="bg-surface-2 px-1.5 py-0.5 rounded text-xs">
          $("Field Name")
        </code>{" "}
        in your code to create fillable fields.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3.5">
      {variableNames.map((name) => {
        const value = mergedVariables[name] ?? "";
        return (
          <div key={name}>
            <label
              htmlFor={`var-${name}`}
              className="block text-xs font-semibold text-text-muted mb-1 uppercase tracking-wider"
            >
              {name}
            </label>
            <textarea
              id={`var-${name}`}
              value={value}
              onChange={(e) => updateVariable(name, e.target.value)}
              rows={Math.max(
                2,
                Math.min(6, (value.split("\n").length ?? 1) + 1)
              )}
              className="w-full bg-surface-2 border border-border-app rounded-[6px] px-2.5 py-2 text-text-app text-sm resize-y outline-none transition-colors focus:border-primary"
            />
          </div>
        );
      })}
    </div>
  );
}
