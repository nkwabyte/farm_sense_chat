
"use client";

import { Button } from "@/components/ui/button";
import { FileText, X } from "lucide-react";

type FileBubbleProps = {
  fileName: string;
  onDismiss: () => void;
};

export function FileBubble({ fileName, onDismiss }: FileBubbleProps) {
  return (
    <div className="flex items-center justify-between p-2 pl-4 mb-3 text-sm rounded-lg bg-muted text-muted-foreground animate-in fade-in">
      <div className="flex items-center gap-3 truncate">
        <FileText className="w-5 h-5" />
        <span className="truncate">{fileName}</span>
      </div>
      <Button variant="ghost" size="icon" className="w-8 h-8 rounded-full" onClick={onDismiss}>
        <X className="w-4 h-4" />
        <span className="sr-only">Remove file</span>
      </Button>
    </div>
  );
}
