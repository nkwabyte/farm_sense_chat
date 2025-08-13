"use client";

import { useState, useCallback, useRef, useEffect, ChangeEvent } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from "@/hooks/use-toast";
import { PdfUploader } from '@/components/pdf-uploader';
import { ChatInterface, type Message } from '@/components/chat-interface';
import { ChatInput } from '@/components/chat-input';
import { OptionSelector } from '@/components/option-selector';
import { FarmerReport } from '@/components/farmer-report';
import { answerQuestionsFromPdf } from '@/ai/flows/answer-questions-from-pdf';
import { type FormatFarmerReportOutput } from '@/ai/flows/format-farmer-report';

export default function AgriChatPage() {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfDataUri, setPdfDataUri] = useState<string | null>(null);
  const [view, setView] = useState<'uploader' | 'options' | 'chat' | 'report'>('uploader');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);

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
        setMessages([]);
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
    setMessages([]);
    setView('uploader');
    if (fileInputRef.current) {
        fileInputRef.current.value = '';
    }
  }, []);

  const handleSendMessage = async (message: string, isUserMessage: boolean = true) => {
    if (!pdfFile || !pdfDataUri) {
        toast({
            variant: "destructive",
            title: "Document required",
            description: "Please upload a PDF or DOCX document to start chatting.",
        });
        return;
    }

    if (isUserMessage) {
        const userMessage: Message = { role: 'user', content: message, id: Date.now() };
        setMessages((prev) => [...prev, userMessage]);
    }
    
    setIsLoading(true);

    try {
      const response = await answerQuestionsFromPdf({
        question: message,
        pdfDataUri: pdfDataUri,
      });

      const aiMessage: Message = {
        role: 'assistant',
        content: response.answer,
        source: response.source.replace('ExamplePDF.pdf', pdfFile.name),
        id: Date.now(),
      };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "AI Error",
        description: "Could not get a response from the AI. Please try again.",
      });
      if(isUserMessage) {
        setMessages(prev => prev.slice(0, -1)); // Remove the optimistic user message on error
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleReportFormatted = (report: FormatFarmerReportOutput) => {
    const formattedReportString = `
**Farm Details**
${report.farmDetails}

**What We Checked**
${report.whatWeChecked}

**What We Found**
${report.whatWeFound}

**What You Should Do**
${report.whatYouShouldDo}

**Money Matters**
${report.moneyMatters}

**Extra Tips**
${report.extraTips}
    `.trim();

    setMessages([
      {
        role: 'assistant',
        content: formattedReportString,
        id: Date.now(),
        isReport: true,
      },
    ]);
    setView('chat');
  };

  const renderContent = () => {
    switch (view) {
      case 'uploader':
        return (
          <div className="flex flex-col flex-1 overflow-hidden">
            <div className="flex-1 p-6 overflow-y-auto">
              <div className="flex flex-col max-w-4xl gap-6 mx-auto">
                <PdfUploader onFileChange={handleFileChange} ref={fileInputRef} />
              </div>
            </div>
            <div className="w-full max-w-4xl p-4 mx-auto border-t bg-background/80 backdrop-blur-sm">
              <ChatInput onSendMessage={handleSendMessage} isLoading={false} onFileChange={handleFileChange} />
            </div>
          </div>
        );
      case 'options':
        return pdfFile && <OptionSelector onSelect={setView} pdfFileName={pdfFile.name} />;
      case 'chat':
        return pdfFile && pdfDataUri && (
          <ChatInterface 
            pdfFileName={pdfFile.name}
            messages={messages} 
            isLoading={isLoading} 
            onSendMessage={handleSendMessage}
            onFileChange={handleFileChange} 
          />
        );
      case 'report':
        return pdfFile && <FarmerReport pdfFile={pdfFile} onReportFormatted={handleReportFormatted} />;
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col h-screen bg-background text-foreground">
      <header className="flex items-center justify-between p-4 border-b shrink-0">
        <div className="flex items-center">
          <h1 className="text-2xl font-bold font-headline">FarmSenseChat</h1>
        </div>
        {pdfFile && (
          <Button variant="outline" onClick={handleReset}>Upload New Document</Button>
        )}
      </header>
      
      {renderContent()}
    </div>
  );
}
