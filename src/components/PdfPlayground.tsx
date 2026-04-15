import { useState, useMemo, useCallback } from "react";
import { extractVariables } from "../lib/variables";
import PreviewPanel from "./PreviewPanel";
import CodeEditor from "./CodeEditor";

interface PdfPlaygroundProps {
  code: string;
  onCodeChange: (code: string) => void;
  variables: Record<string, string>;
  onVariablesChange: (variables: Record<string, string>) => void;
  readOnly?: boolean;
}

const tabBase =
  "px-4 py-2 text-[13px] font-semibold bg-transparent border-0 cursor-pointer border-b-2 transition-colors";
const tabInactive = `${tabBase} text-text-muted border-transparent hover:text-text-app`;
const tabActive = `${tabBase} text-text-app border-primary bg-bg`;

export default function PdfPlayground({
  code,
  onCodeChange,
  variables,
  onVariablesChange,
  readOnly = false,
}: PdfPlaygroundProps) {
  const [leftTab, setLeftTab] = useState<"code" | "variables">(
    readOnly ? "variables" : "code"
  );

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

  return (
    <div className="flex flex-col md:flex-row h-full w-full">
      <div className="flex flex-col w-full h-1/2 md:w-1/2 md:h-full border-b md:border-b-0 md:border-r border-border-app">
        <div className="flex border-b border-border-app bg-surface shrink-0">
          {!readOnly && (
            <button
              className={leftTab === "code" ? tabActive : tabInactive}
              onClick={() => setLeftTab("code")}
            >
              Code
            </button>
          )}
          <button
            className={leftTab === "variables" ? tabActive : tabInactive}
            onClick={() => setLeftTab("variables")}
          >
            Fields ({variableNames.length})
          </button>
        </div>

        {leftTab === "code" && !readOnly && (
          <div className="flex-1 overflow-auto flex flex-col">
            <CodeEditor code={code} onChange={onCodeChange} />
          </div>
        )}

        {leftTab === "variables" && (
          <div className="flex-1 overflow-auto p-4">
            {variableNames.length === 0 ? (
              <div className="p-8 text-center text-text-muted text-sm">
                No variables found. Use{" "}
                <code className="bg-surface-2 px-1.5 py-0.5 rounded text-xs">
                  $("Field Name")
                </code>{" "}
                in your code to create fillable fields.
              </div>
            ) : (
              <div className="flex flex-col gap-3.5">
                {variableNames.map((name) => (
                  <div key={name}>
                    <label
                      htmlFor={`var-${name}`}
                      className="block text-xs font-semibold text-text-muted mb-1 uppercase tracking-wider"
                    >
                      {name}
                    </label>
                    <textarea
                      id={`var-${name}`}
                      value={mergedVariables[name] ?? ""}
                      onChange={(e) => updateVariable(name, e.target.value)}
                      rows={Math.max(
                        2,
                        Math.min(
                          6,
                          (mergedVariables[name]?.split("\n").length ?? 1) + 1
                        )
                      )}
                      className="w-full bg-surface-2 border border-border-app rounded-[6px] px-2.5 py-2 text-text-app text-sm resize-y outline-none transition-colors focus:border-primary"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="flex flex-col w-full h-1/2 md:w-1/2 md:h-full">
        <PreviewPanel code={code} variables={mergedVariables} />
      </div>
    </div>
  );
}
