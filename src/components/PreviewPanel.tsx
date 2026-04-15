import { usePdfPreview } from "../lib/use-pdf-preview";

interface PreviewPanelProps {
  code: string;
  variables: Record<string, string>;
}

export default function PreviewPanel({ code, variables }: PreviewPanelProps) {
  const { pdfUrl, error, generating } = usePdfPreview(code, variables);

  return (
    <div className="flex flex-col h-full bg-surface">
      {error && (
        <div className="px-3 py-2 bg-error/10 border-b border-error/30 text-error text-xs font-mono shrink-0">
          {error}
        </div>
      )}
      {pdfUrl ? (
        <iframe
          src={pdfUrl}
          className="flex-1 w-full border-0"
          title="PDF Preview"
        />
      ) : !error ? (
        <div className="flex items-center justify-center h-full text-text-muted text-sm">
          {generating ? "Generating PDF…" : "No preview available"}
        </div>
      ) : null}
    </div>
  );
}
