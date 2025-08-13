"use client";

import { useState, useCallback } from 'react';
import { Leaf } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from "@/hooks/use-toast";
import { PdfUploader } from '@/components/pdf-uploader';
import { ChatInterface } from '@/components/chat-interface';

export default function AgriChatPage() {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfDataUri, setPdfDataUri] = useState<string | null>(null);
  const { toast } = useToast();

  const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUri = e.target?.result as string;
        setPdfFile(file);
        setPdfDataUri(dataUri);
      };
      reader.onerror = () => {
        toast({
            variant: "destructive",
            title: "File Read Error",
            description: "There was an error reading your PDF file.",
        });
      };
      reader.readAsDataURL(file);
    } else if (file) {
        toast({
            variant: "destructive",
            title: "Invalid File Type",
            description: "Please upload a valid PDF file.",
        });
    }
  }, [toast]);
  
  const handleReset = useCallback(() => {
    setPdfFile(null);
    setPdfDataUri(null);
  }, []);

  return (
    <div className="flex flex-col h-screen bg-background text-foreground">
      <header className="flex items-center justify-between p-4 border-b shrink-0">
        <div className="flex items-center">
          <Leaf className="w-8 h-8 mr-2 text-primary" />
          <h1 className="text-2xl font-bold font-headline">AgriChat PDF</h1>
        </div>
        {pdfFile && (
          <Button variant="outline" onClick={handleReset}>Upload New PDF</Button>
        )}
      </header>

      <main className="flex-1 overflow-hidden">
        {!pdfDataUri || !pdfFile ? (
          <div className="flex items-center justify-center h-full p-8">
            <PdfUploader onFileChange={handleFileChange} />
          </div>
        ) : (
          <ChatInterface pdfFile={pdfFile} pdfDataUri={pdfDataUri} />
        )}
      </main>
    </div>
  );
}
