"use client";

import { useState, useRef, useEffect, useCallback, ChangeEvent } from 'react';
import { answerQuestionsFromPdf } from '@/ai/flows/answer-questions-from-pdf';
import { useToast } from "@/hooks/use-toast";
import { ChatMessage, ChatMessageLoading } from '@/components/chat-message';
import { ChatInput } from '@/components/chat-input';

type Message = {
  role: 'user' | 'assistant';
  content: string;
  source?: string;
  id: number;
};

type ChatInterfaceProps = {
    pdfFile: File;
    pdfDataUri: string;
    onFileChange: (event: ChangeEvent<HTMLInputElement>) => void;
};

export function ChatInterface({ pdfFile, pdfDataUri, onFileChange }: ChatInterfaceProps) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();
    const chatContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setMessages([
          {
            role: 'assistant',
            content: `I've analyzed "${pdfFile.name}". Ask me anything about its content.`,
            id: Date.now(),
          },
        ]);
    }, [pdfFile.name]);

    useEffect(() => {
        if (chatContainerRef.current) {
          chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [messages, isLoading]);

    const handleSendMessage = useCallback(async (message: string) => {
        const userMessage: Message = { role: 'user', content: message, id: Date.now() };
        setMessages((prev) => [...prev, userMessage]);
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
          setMessages(prev => prev.slice(0, -1)); // Remove the optimistic user message on error
        } finally {
          setIsLoading(false);
        }
    }, [pdfDataUri, pdfFile.name, toast]);
    
    return (
        <div className="flex flex-col h-full">
            <div ref={chatContainerRef} className="flex-1 p-6 overflow-y-auto">
                <div className="flex flex-col max-w-4xl gap-6 mx-auto">
                    {messages.map((msg) => (
                        <ChatMessage key={msg.id} {...msg} />
                    ))}
                    {isLoading && <ChatMessageLoading />}
                </div>
            </div>
            <div className="w-full max-w-4xl p-4 mx-auto border-t bg-background/80 backdrop-blur-sm">
                <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading} onFileChange={onFileChange} />
            </div>
        </div>
    );
}
