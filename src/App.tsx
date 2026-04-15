import { useState, useEffect, useCallback } from "react";
import PdfPlayground from "./components/PdfPlayground";
import {
  parseTemplateFromUrl,
  buildTemplateUrl,
} from "./lib/url-template";
import {
  DEFAULT_TEMPLATE_CODE,
  DEFAULT_TEMPLATE_NAME,
  DEFAULT_VARIABLES,
} from "./lib/default-template";

type Mode = "create" | "fill";

const btnBase =
  "px-3.5 py-1.5 rounded-[6px] border text-[13px] font-medium cursor-pointer whitespace-nowrap transition-colors";
const btnPrimary = `${btnBase} bg-primary border-primary text-white hover:bg-primary-hover`;
const btnSecondary = `${btnBase} border-border-app bg-surface-2 text-text-app hover:border-[#444]`;
const btnSmall =
  "px-2.5 py-1 rounded-[6px] border border-border-app text-xs font-medium cursor-pointer whitespace-nowrap transition-colors bg-surface-2 text-text-app hover:border-[#444]";

export default function App() {
  const [mode, setMode] = useState<Mode>("create");
  const [name, setName] = useState(DEFAULT_TEMPLATE_NAME);
  const [code, setCode] = useState(DEFAULT_TEMPLATE_CODE);
  const [variables, setVariables] =
    useState<Record<string, string>>(DEFAULT_VARIABLES);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    function loadFromHash() {
      const template = parseTemplateFromUrl();
      if (template) {
        setMode("fill");
        setName(template.name);
        setCode(template.code);
        setVariables(template.variables);
        setShareUrl(null);
      }
    }
    loadFromHash();
    window.addEventListener("hashchange", loadFromHash);
    return () => window.removeEventListener("hashchange", loadFromHash);
  }, []);

  const handleShare = useCallback(() => {
    const url = buildTemplateUrl(name, code, variables);
    setShareUrl(url);
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [name, code, variables]);

  const handleDownload = useCallback(async () => {
    try {
      const { generatePdf } = await import("./lib/generate-pdf");
      const blob = await generatePdf(code, variables);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${name || "document"}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error("Download failed:", e);
    }
  }, [code, variables, name]);

  const handleNewTemplate = useCallback(() => {
    window.location.hash = "";
    setMode("create");
    setName(DEFAULT_TEMPLATE_NAME);
    setCode(DEFAULT_TEMPLATE_CODE);
    setVariables(DEFAULT_VARIABLES);
    setShareUrl(null);
  }, []);

  return (
    <div className="flex flex-col h-full">
      <header className="flex flex-col md:flex-row items-stretch md:items-center md:justify-between gap-2 md:gap-0 px-4 py-2 border-b border-border-app bg-surface shrink-0">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-1 md:gap-4">
          <h1
            className="text-base font-bold cursor-pointer whitespace-nowrap"
            onClick={handleNewTemplate}
          >
            PDF Template
          </h1>
          {mode === "create" && (
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-surface-2 border border-border-app rounded-[6px] px-3 py-1.5 text-text-app text-sm w-full md:w-60"
              placeholder="Template name"
            />
          )}
          {mode === "fill" && (
            <span className="text-sm text-text-muted">{name}</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {mode === "fill" && (
            <button className={btnSecondary} onClick={handleNewTemplate}>
              New Template
            </button>
          )}
          <button className={btnSecondary} onClick={handleShare}>
            {copied ? "Copied!" : "Share URL"}
          </button>
          <button className={btnPrimary} onClick={handleDownload}>
            Download PDF
          </button>
        </div>
      </header>

      {shareUrl && (
        <div className="flex items-center gap-2 px-4 py-2 bg-surface border-b border-border-app shrink-0">
          <input
            type="text"
            value={shareUrl}
            readOnly
            className="flex-1 bg-bg border border-border-app rounded-[6px] px-2.5 py-1.5 text-text-muted text-xs font-mono"
            onClick={(e) => (e.target as HTMLInputElement).select()}
          />
          <button
            className={btnSmall}
            onClick={() => {
              navigator.clipboard.writeText(shareUrl);
              setCopied(true);
              setTimeout(() => setCopied(false), 2000);
            }}
          >
            {copied ? "Copied!" : "Copy"}
          </button>
        </div>
      )}

      <main className="flex-1 overflow-hidden">
        <PdfPlayground
          code={code}
          onCodeChange={setCode}
          variables={variables}
          onVariablesChange={setVariables}
          readOnly={mode === "fill"}
        />
      </main>
    </div>
  );
}
