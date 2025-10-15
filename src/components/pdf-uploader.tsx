
"use client";

import { type ChangeEvent, forwardRef } from 'react';
import { UploadCloud } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

type PdfUploaderProps = {
    onFileChange: (event: ChangeEvent<HTMLInputElement>) => void;
};

export const PdfUploader = forwardRef<HTMLInputElement, PdfUploaderProps>(({ onFileChange }, ref) => {
    const fileInputId = "pdf-upload";
    return (
        <div className="flex flex-col items-center justify-center w-full max-w-lg p-6 mx-auto text-center border-2 border-dashed rounded-lg shadow-sm border-muted-foreground/20 bg-card">
            <div className="p-3 mb-4 rounded-full bg-accent/20">
              <UploadCloud className="w-8 h-8 text-accent" data-ai-hint="upload icon" />
            </div>
            <h3 className="text-lg font-semibold">Upload a Soil Report</h3>
            <p className="mt-1 text-sm text-muted-foreground">The AI will analyze and extract information from your document.</p>
            <Button asChild size="sm" className="mt-4">
                <Label htmlFor={fileInputId} className="cursor-pointer">
                    Select Document
                </Label>
            </Button>
            <Input id={fileInputId} type="file" accept="application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document" className="sr-only" onChange={onFileChange} ref={ref} />
        </div>
    );
});

PdfUploader.displayName = 'PdfUploader';

    