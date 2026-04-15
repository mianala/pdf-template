import { useEffect, useRef, useState } from "react";

/**
 * Generates a real PDF blob URL from template code + variables
 * using @react-pdf/renderer. Debounced to avoid thrashing.
 */
export function usePdfPreview(
  code: string,
  variables: Record<string, string>,
  debounceMs = 2000
) {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const prevUrlRef = useRef<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);

    timerRef.current = setTimeout(() => {
      let cancelled = false;
      setGenerating(true);

      (async () => {
        try {
          const { generatePdf } = await import("./generate-pdf");
          const blob = await generatePdf(code, variables);
          if (cancelled) return;

          if (prevUrlRef.current) URL.revokeObjectURL(prevUrlRef.current);

          const url = URL.createObjectURL(blob);
          prevUrlRef.current = url;
          setPdfUrl(url);
          setError(null);
        } catch (e: unknown) {
          if (cancelled) return;
          setError(
            e instanceof Error ? e.message : "PDF generation error"
          );
          setPdfUrl(null);
        } finally {
          if (!cancelled) setGenerating(false);
        }
      })();

      return () => {
        cancelled = true;
      };
    }, debounceMs);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [code, variables, debounceMs]);

  useEffect(() => {
    return () => {
      if (prevUrlRef.current) URL.revokeObjectURL(prevUrlRef.current);
    };
  }, []);

  return { pdfUrl, error, generating };
}
