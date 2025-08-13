"use client";

import { useState, useCallback, useRef, useEffect } from 'react';
import { Leaf } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from "@/hooks/use-toast";
import { PdfUploader } from '@/components/pdf-uploader';
import { ChatInterface } from '@/components/chat-interface';
import { ChatInput } from '@/components/chat-input';
import { ChatMessage, ChatMessageLoading } from '@/components/chat-message';

type Message = {
    role: 'user' | 'assistant';
    content: string;
    source?: string;
    id: number;
};


export default function AgriChatPage() {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfDataUri, setPdfDataUri] = useState<string | null>(null);
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);


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
    setMessages([]);
    if (fileInputRef.current) {
        fileInputRef.current.value = '';
    }
  }, []);

  const handleSendMessage = async (message: string) => {
    if (!pdfFile || !pdfDataUri) {
        toast({
            title: "PDF required",
            description: "Please upload a PDF document to start chatting.",
        });
        return;
    }
  };

  const showUploader = !pdfDataUri || !pdfFile;

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
      
      {showUploader ? (
        <div className="flex-1 overflow-hidden">
             <div className="flex flex-col h-full">
                <div className="flex-1 p-6 overflow-y-auto">
                    <div className="flex flex-col max-w-4xl gap-6 mx-auto">
                        <PdfUploader onFileChange={handleFileChange} ref={fileInputRef} />
                    </div>
                </div>
                <div className="w-full max-w-4xl p-4 mx-auto border-t bg-background/80 backdrop-blur-sm">
                    <ChatInput onSendMessage={handleSendMessage} isLoading={false} />
                </div>
            </div>
        </div>
      ) : (
        <ChatInterface pdfFile={pdfFile} pdfDataUri={pdfDataUri} />
      )}
    </div>
  );
}
