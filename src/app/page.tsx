
"use client";

import { useState, useCallback, useRef, ChangeEvent } from 'react';
import { useToast } from "@/hooks/use-toast";
import { type Message } from '@/components/chat-interface';
import { answerQuestionsFromPdf } from '@/ai/flows/answer-questions-from-pdf';
import { ChatInterface } from '@/components/chat-interface';
import { nanoid } from 'nanoid';

export default function AgriChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [pdfFile, setPdfFile] = useState<{ name: string; dataUri: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && (file.type === 'application/pdf' || file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUri = e.target?.result as string;
        setPdfFile({ name: file.name, dataUri });
        setMessages(prev => [
          ...prev,
          {
            role: 'assistant',
            content: `I've analyzed "${file.name}". Ask me anything about it.`,
            id: nanoid()
          }
        ]);
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
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [toast]);

  const handleSendMessage = async (message: string) => {
    const userMessageId = nanoid();
    const userMessage: Message = { role: 'user', content: message, id: userMessageId };
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const response = await answerQuestionsFromPdf({
        question: message,
        pdfDataUri: pdfFile?.dataUri,
      });

      const aiMessage: Message = {
        role: 'assistant',
        content: response.answer,
        source: response.source?.replace('ExamplePDF.pdf', pdfFile?.name ?? "General Knowledge"),
        id: nanoid(),
      };
      
      setMessages(prev => [...prev, aiMessage]);

    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "AI Error",
        description: "Could not get a response from the AI. Please try again.",
      });
      // Remove the optimistic user message on error
      setMessages(prev => prev.filter(m => m.id !== userMessageId));
    } finally {
      setIsLoading(false);
    }
  };
  
  const initialMessages: Message[] =  messages.length === 0 && !pdfFile ? [
      {
        role: 'assistant',
        content: `Welcome to AgriChat! You can ask me general questions about farming or upload a document for analysis.`,
        id: 'initial-welcome'
      }
    ] : messages;


  return (
      <div className="flex flex-col h-screen bg-background text-foreground">
        <header className="flex items-center justify-between p-4 border-b shrink-0">
          <h1 className="text-2xl font-bold font-headline">AgriChat PDF</h1>
        </header>
        <main className="flex-1 overflow-hidden">
            <div className="h-full">
              <ChatInterface
                messages={initialMessages}
                isLoading={isLoading}
                onSendMessage={handleSendMessage}
                onFileChange={handleFileChange}
                fileInputRef={fileInputRef}
              />
            </div>
        </main>
      </div>
  );
}
