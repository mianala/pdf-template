import LZString from "lz-string";

/**
 * URL-Encoded Template Distribution (Section 3.4 of the paper).
 *
 * The entire template definition (code, default variables, metadata)
 * is serialized into a compressed URL fragment. No server or database
 * is required. Sharing a template equals sharing a hyperlink.
 *
 * Format: https://domain/#/t/<compressed-data>
 */

export interface TemplatePayload {
  /** Template name */
  name: string;
  /** React-PDF JSX code */
  code: string;
  /** Default variable values */
  variables: Record<string, string>;
  /** Version for forward compatibility */
  v: number;
}

const CURRENT_VERSION = 1;

/**
 * Serialize a template into a URL-safe compressed string.
 */
export function encodeTemplate(
  name: string,
  code: string,
  variables: Record<string, string>
): string {
  const payload: TemplatePayload = {
    name,
    code,
    variables,
    v: CURRENT_VERSION,
  };
  const json = JSON.stringify(payload);
  return LZString.compressToEncodedURIComponent(json);
}

/**
 * Deserialize a template from a compressed string.
 */
export function decodeTemplate(
  compressed: string
): TemplatePayload | null {
  try {
    const json = LZString.decompressFromEncodedURIComponent(compressed);
    if (!json) return null;
    const payload = JSON.parse(json) as TemplatePayload;
    if (!payload.code || typeof payload.code !== "string") return null;
    return payload;
  } catch {
    return null;
  }
}

/**
 * Build a full shareable URL for a template.
 */
export function buildTemplateUrl(
  name: string,
  code: string,
  variables: Record<string, string>
): string {
  const compressed = encodeTemplate(name, code, variables);
  const base = window.location.origin + window.location.pathname;
  return `${base}#/t/${compressed}`;
}

/**
 * Extract template data from the current URL hash, if present.
 */
export function parseTemplateFromUrl(): TemplatePayload | null {
  const hash = window.location.hash;
  const prefix = "#/t/";
  if (!hash.startsWith(prefix)) return null;
  const compressed = hash.slice(prefix.length);
  return decodeTemplate(compressed);
}
