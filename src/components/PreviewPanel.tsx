import { usePdfPreview } from "../lib/use-pdf-preview";

interface PreviewPanelProps {
  code: string;
  variables: Record<string, string>;
}

export default function PreviewPanel({ code, variables }: PreviewPanelProps) {
  const { pdfUrl, error, generating } = usePdfPreview(code, variables);

  return (
    <div className="preview-panel">
      {error && <div className="preview-error">{error}</div>}
      {pdfUrl ? (
        <iframe src={pdfUrl} className="preview-iframe" title="PDF Preview" />
      ) : !error ? (
        <div className="preview-placeholder">
          {generating ? "Generating PDF…" : "No preview available"}
        </div>
      ) : null}
    </div>
  );
}
