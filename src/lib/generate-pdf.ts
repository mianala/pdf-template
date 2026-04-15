import React from "react";
import { createPdfVarResolver, normalizeVariableSyntax } from "./variables";

let fontsRegistered = false;

async function ensureFonts() {
  if (fontsRegistered) return;
  const { Font } = await import("@react-pdf/renderer");

  // Tinos from Google Fonts — metrically identical to Times New Roman
  Font.register({
    family: "Times New Roman",
    fonts: [
      {
        src: "https://fonts.gstatic.com/s/tinos/v25/buE4poGnedXvwgX8.ttf",
        fontWeight: "normal",
        fontStyle: "normal",
      },
      {
        src: "https://fonts.gstatic.com/s/tinos/v25/buE1poGnedXvwj1AW0Fp.ttf",
        fontWeight: "bold",
        fontStyle: "normal",
      },
      {
        src: "https://fonts.gstatic.com/s/tinos/v25/buE2poGnedXvwjX-fmE.ttf",
        fontWeight: "normal",
        fontStyle: "italic",
      },
      {
        src: "https://fonts.gstatic.com/s/tinos/v25/buEzpoGnedXvwjX-Rt1s0Co.ttf",
        fontWeight: "bold",
        fontStyle: "italic",
      },
    ],
  });

  fontsRegistered = true;
}

/**
 * Transpile template code with real @react-pdf/renderer components
 * and return a PDF blob.
 *
 * Implements Section 3.3 of the paper: Babel Standalone runtime transpilation.
 */
export async function generatePdf(
  code: string,
  variables: Record<string, string>
): Promise<Blob> {
  const [babelModule, pdfModule] = await Promise.all([
    import("@babel/standalone"),
    import("@react-pdf/renderer"),
    ensureFonts(),
  ]);

  const Babel = babelModule.default ?? babelModule;
  const { Document, Page, Text, View, Image, StyleSheet, pdf } = pdfModule;

  // Normalize ${`var`} → $("var") before transpilation
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

  const resolver = createPdfVarResolver(variables);
  const MyDocument = fn(
    React,
    Document,
    Page,
    Text,
    View,
    Image,
    StyleSheet,
    resolver
  );

  const element = React.createElement(MyDocument);
  const blob = await pdf(element).toBlob();
  return blob;
}
