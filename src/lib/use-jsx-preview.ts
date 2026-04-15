import { useState, useEffect } from "react";
import React from "react";
import {
  MockDocument,
  MockPage,
  MockText,
  MockView,
  MockImage,
  MockStyleSheet,
} from "./mock-components";
import { createVarResolver, normalizeVariableSyntax } from "./variables";

/**
 * Hook: takes JSX code + variables, returns { Component, error }.
 * Babel is loaded dynamically. Implements Section 3.3 of the paper.
 */
export function useJsxPreview(
  code: string,
  variables: Record<string, string>
) {
  const [result, setResult] = useState<{
    Component: React.ComponentType | null;
    error: string | null;
  }>({ Component: null, error: null });

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const babelModule = await import("@babel/standalone");
        const Babel = (babelModule as any).default ?? babelModule;

        const normalizedCode = normalizeVariableSyntax(code);

        const transpiled = Babel.transform(normalizedCode, {
          presets: ["react"],
          filename: "template.jsx",
        }).code;

        const fn = new Function(
          "React",
          "Document",
          "Page",
          "Text",
          "View",
          "Image",
          "StyleSheet",
          "$",
          `
          ${transpiled}
          return MyDocument;
          `
        );
        const resolver = createVarResolver(variables);
        const Comp = fn(
          React,
          MockDocument,
          MockPage,
          MockText,
          MockView,
          MockImage,
          MockStyleSheet,
          resolver
        );
        if (!cancelled) {
          setResult({ Component: Comp as React.ComponentType, error: null });
        }
      } catch (e: unknown) {
        if (!cancelled) {
          setResult({
            Component: null,
            error: e instanceof Error ? e.message : String(e),
          });
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [code, variables]);

  return result;
}
