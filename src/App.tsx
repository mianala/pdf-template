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

export default function App() {
  const [mode, setMode] = useState<Mode>("create");
  const [name, setName] = useState(DEFAULT_TEMPLATE_NAME);
  const [code, setCode] = useState(DEFAULT_TEMPLATE_CODE);
  const [variables, setVariables] =
    useState<Record<string, string>>(DEFAULT_VARIABLES);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Check URL for template on mount and on hash changes (Section 3.4)
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
    <div className="app">
      {/* Header */}
      <header className="header">
        <div className="header-left">
          <h1 className="logo" onClick={handleNewTemplate}>
            PDF Template
          </h1>
          {mode === "create" && (
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="name-input"
              placeholder="Template name"
            />
          )}
          {mode === "fill" && <span className="template-name">{name}</span>}
        </div>
        <div className="header-right">
          {mode === "fill" && (
            <button className="btn btn-secondary" onClick={handleNewTemplate}>
              New Template
            </button>
          )}
          <button className="btn btn-secondary" onClick={handleShare}>
            {copied ? "Copied!" : "Share URL"}
          </button>
          <button className="btn btn-primary" onClick={handleDownload}>
            Download PDF
          </button>
        </div>
      </header>

      {/* Share URL display */}
      {shareUrl && (
        <div className="share-bar">
          <input
            type="text"
            value={shareUrl}
            readOnly
            className="share-input"
            onClick={(e) => (e.target as HTMLInputElement).select()}
          />
          <button
            className="btn btn-small"
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

      {/* Main content */}
      <main className="main">
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
