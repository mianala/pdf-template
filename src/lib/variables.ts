import React from "react";

/**
 * Extract variable names from template code.
 *
 * Supports two syntaxes conforming to the paper's grammar:
 *   - Template-literal: ${`variableName`}
 *   - Function-call:    $("variableName") or $('variableName')
 *
 * Grammar (Section 3.2):
 *   VariableExpr ::= '${`' Identifier '`}' | '$(' QuotedIdentifier ')'
 *   Identifier   ::= [a-zA-Z_\s][a-zA-Z0-9_\s]*
 */
export function extractVariables(code: string): string[] {
  const names = new Set<string>();

  // Paper syntax: ${`variableName`}
  const templateLiteralRe = /\$\{`([^`]+)`\}/g;
  let match;
  while ((match = templateLiteralRe.exec(code)) !== null) {
    names.add(match[1].trim());
  }

  // Function-call syntax: $("variableName") or $('variableName')
  const fnCallRe = /\$\(["']([^"']+)["']\)/g;
  while ((match = fnCallRe.exec(code)) !== null) {
    names.add(match[1].trim());
  }

  return Array.from(names);
}

/**
 * Pre-process template code: convert ${`varName`} syntax to $("varName")
 * so Babel can transpile it cleanly as a function call.
 */
export function normalizeVariableSyntax(code: string): string {
  return code.replace(/\$\{`([^`]+)`\}/g, '$$("$1")');
}

/** Creates a $() resolver for HTML mock preview — uses <br> for line breaks */
export function createVarResolver(vars: Record<string, string>) {
  return (name: string) => {
    const val = vars[name];
    if (val === undefined || val === "") {
      return "\u200B";
    }
    const lines = val.split("\n");
    if (lines.length === 1) return val;
    return lines.map((line: string, i: number) =>
      React.createElement(
        React.Fragment,
        { key: i },
        i > 0 && React.createElement("br"),
        line
      )
    );
  };
}

/**
 * Creates a $() resolver for @react-pdf/renderer — returns plain strings.
 * react-pdf's <Text> handles "\n" natively.
 */
export function createPdfVarResolver(vars: Record<string, string>) {
  return (name: string) => {
    const val = vars[name];
    if (val === undefined || val === "") {
      return " ";
    }
    return val;
  };
}
