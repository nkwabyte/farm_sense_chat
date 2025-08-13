"use client";

import { useState, useCallback, useRef, useEffect } from 'react';
import { Leaf, MessageSquare, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from "@/hooks/use-toast";
import { PdfUploader } from '@/components/pdf-uploader';
import { ChatInterface } from '@/components/chat-interface';
import { ChatInput } from '@/components/chat-input';
import { OptionSelector } from '@/components/option-selector';
import { FarmerReport } from '@/components/farmer-report';

export default function AgriChatPage() {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfDataUri, setPdfDataUri] = useState<string | null>(null);
  const [view, setView] = useState<'uploader' | 'options' | 'chat' | 'report'>('uploader');

  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && (file.type === 'application/pdf' || file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUri = e.target?.result as string;
        setPdfFile(file);
        setPdfDataUri(dataUri);
        setView('options');
      };
      reader.onerror = () => {
        toast({
            variant: "destructive",
            title: "File Read Error",
            description: "There was an error reading your file.",
        });
      };
      reader.readAsDataURL(file);
    } else if (file) {
        toast({
            variant: "destructive",
            title: "Invalid File Type",
            description: "Please upload a valid PDF or DOCX file.",
        });
    }
  }, [toast]);
  
  const handleReset = useCallback(() => {
    setPdfFile(null);
    setPdfDataUri(null);
    setView('uploader');
    if (fileInputRef.current) {
        fileInputRef.current.value = '';
    }
  }, []);

  const handleSendMessage = async (message: string) => {
    if (!pdfFile || !pdfDataUri) {
        toast({
            title: "Document required",
            description: "Please upload a PDF or DOCX document to start chatting.",
        });
        return;
    }
  };

  const renderContent = () => {
    switch (view) {
      case 'uploader':
        return (
          <div className="flex-1 overflow-hidden">
            <div className="flex flex-col h-full">
              <div className="flex-1 p-6 overflow-y-auto">
                <div className="flex flex-col max-w-4xl gap-6 mx-auto">
                  <PdfUploader onFileChange={handleFileChange} ref={fileInputRef} />
                </div>
              </div>
              <div className="w-full max-w-4xl p-4 mx-auto border-t bg-background/80 backdrop-blur-sm">
                <ChatInput onSendMessage={handleSendMessage} isLoading={false} onFileChange={handleFileChange} />
              </div>
            </div>
          </div>
        );
      case 'options':
        return pdfFile && <OptionSelector onSelect={setView} pdfFileName={pdfFile.name} />;
      case 'chat':
        return pdfFile && pdfDataUri && <ChatInterface pdfFile={pdfFile} pdfDataUri={pdfDataUri} onFileChange={handleFileChange} />;
      case 'report':
        return pdfFile && <FarmerReport pdfFile={pdfFile} />;
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col h-screen bg-background text-foreground">
      <header className="flex items-center justify-between p-4 border-b shrink-0">
        <div className="flex items-center">
          <Leaf className="w-8 h-8 mr-2 text-primary" />
          <h1 className="text-2xl font-bold font-headline">AgriChat PDF</h1>
        </div>
        {pdfFile && (
          <Button variant="outline" onClick={handleReset}>Upload New Document</Button>
        )}
      </header>
      
      {renderContent()}
    </div>
  );
}
