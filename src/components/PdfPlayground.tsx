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
    <div className="playground">
      {/* Left: Code + Variables */}
      <div className="playground-left">
        <div className="tabs">
          {!readOnly && (
            <button
              className={`tab ${leftTab === "code" ? "tab-active" : ""}`}
              onClick={() => setLeftTab("code")}
            >
              Code
            </button>
          )}
          <button
            className={`tab ${leftTab === "variables" ? "tab-active" : ""}`}
            onClick={() => setLeftTab("variables")}
          >
            Fields ({variableNames.length})
          </button>
        </div>

        {leftTab === "code" && !readOnly && (
          <div className="tab-content">
            <CodeEditor code={code} onChange={onCodeChange} />
          </div>
        )}

        {leftTab === "variables" && (
          <div className="tab-content tab-content-padded">
            {variableNames.length === 0 ? (
              <div className="variables-empty">
                No variables found. Use <code>$("Field Name")</code> in your
                code to create fillable fields.
              </div>
            ) : (
              <div className="variables-form">
                {variableNames.map((name) => (
                  <div key={name} className="variable-field">
                    <label htmlFor={`var-${name}`}>{name}</label>
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
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Right: PDF Preview */}
      <div className="playground-right">
        <PreviewPanel code={code} variables={mergedVariables} />
      </div>
    </div>
  );
}
