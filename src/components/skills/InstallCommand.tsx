"use client";

import { useState } from "react";

interface InstallCommandProps {
  command: string;
}

export function InstallCommand({ command }: InstallCommandProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(command);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const textArea = document.createElement("textarea");
      textArea.value = command;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="group flex items-center gap-2 rounded-lg border border-border bg-foreground/[0.03] p-3 font-mono text-sm">
      <span className="select-none text-primary/60">$</span>
      <code className="flex-1 overflow-x-auto text-foreground">{command}</code>
      <button
        onClick={handleCopy}
        className={`shrink-0 rounded-md px-3 py-1.5 text-xs font-semibold transition-all ${
          copied
            ? "bg-success text-white"
            : "bg-primary text-white hover:bg-primary-dark"
        }`}
      >
        {copied ? "Copied!" : "Copy"}
      </button>
    </div>
  );
}
