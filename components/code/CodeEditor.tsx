"use client";

import dynamic from "next/dynamic";

const Monaco = dynamic(() => import("@monaco-editor/react"), { ssr: false });

export function CodeEditor({
  value,
  onChange,
  language = "typescript",
  height = 320,
}: {
  value: string;
  onChange: (v: string | undefined) => void;
  language?: string;
  height?: number;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#05060a] shadow-inner">
      <Monaco
        height={height}
        language={language}
        theme="vs-dark"
        value={value}
        onChange={onChange}
        options={{
          minimap: { enabled: false },
          fontSize: 14,
          fontFamily: "var(--font-mono), monospace",
          smoothScrolling: true,
          padding: { top: 16, bottom: 16 },
        }}
      />
    </div>
  );
}
