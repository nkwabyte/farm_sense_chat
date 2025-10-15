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
        <div className="flex flex-col items-center justify-center w-full max-w-lg p-8 mx-auto text-center border-2 border-dashed rounded-lg shadow-sm border-muted-foreground/20 bg-card">
            <div className="p-4 rounded-full bg-accent/20">
              <UploadCloud className="w-12 h-12 text-accent" data-ai-hint="upload icon" />
            </div>
            <p className="mt-6 text-xl text-foreground">Hey there! I'm Pomaa.</p>
            <h2 className="mt-2 text-2xl font-semibold font-headline">Upload your Agriculture Document</h2>
            <p className="mt-2 text-muted-foreground">The AI will answer questions based on its content.</p>
            <Button asChild className="mt-6">
                <Label htmlFor={fileInputId} className="cursor-pointer">
                    Select PDF or DOCX
                </Label>
            </Button>
            <Input id={fileInputId} type="file" accept="application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document" className="sr-only" onChange={onFileChange} ref={ref} />
        </div>
    );
});

PdfUploader.displayName = 'PdfUploader';
