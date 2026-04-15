import { useState, useEffect } from "react";
import type { Extension } from "@codemirror/state";

export default function CodeEditor({
  code,
  onChange,
}: {
  code: string;
  onChange: (val: string) => void;
}) {
  const [extensions, setExtensions] = useState<Extension[]>([]);
  const [CodeMirror, setCodeMirror] = useState<any>(null);

  useEffect(() => {
    Promise.all([
      import("@uiw/react-codemirror"),
      import("@codemirror/lang-javascript"),
      import("@codemirror/theme-one-dark"),
    ]).then(([cm, jsModule, themeModule]) => {
      setCodeMirror(() => cm.default);
      setExtensions([jsModule.javascript({ jsx: true }), themeModule.oneDark]);
    });
  }, []);

  if (!CodeMirror) {
    return (
      <textarea
        value={code}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-full bg-bg text-text-app border-0 p-3 font-mono text-[13px] resize-none outline-none"
        spellCheck={false}
      />
    );
  }

  return (
    <CodeMirror
      value={code}
      onChange={onChange}
      extensions={extensions}
      height="100%"
      style={{ flex: 1, overflow: "auto" }}
    />
  );
}
