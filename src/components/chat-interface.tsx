"use client";

import { useRef, useEffect, ChangeEvent, memo } from 'react';
import { ChatMessage, ChatMessageLoading } from '@/components/chat-message';
import { ChatInput } from '@/components/chat-input';

export type Message = {
  role: 'user' | 'assistant';
  content: string;
  source?: string;
  id: number;
  isReport?: boolean;
};

type ChatInterfaceProps = {
    pdfFileName: string;
    messages: Message[];
    isLoading: boolean;
    onSendMessage: (message: string) => Promise<void>;
    onFileChange: (event: ChangeEvent<HTMLInputElement>) => void;
};

export const ChatInterface = memo(function ChatInterface({ pdfFileName, messages, isLoading, onSendMessage, onFileChange }: ChatInterfaceProps) {
    const chatContainerRef = useRef<HTMLDivElement>(null);
    const hasInitialized = useRef(false);

    useEffect(() => {
        if (!hasInitialized.current && messages.length === 0) {
            onSendMessage(`I've analyzed "${pdfFileName}". What would you like to do with this document?`);
            hasInitialized.current = true;
        }
    }, [pdfFileName, messages, onSendMessage]);
    
    useEffect(() => {
        if (chatContainerRef.current) {
          chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [messages, isLoading]);

    return (
        <div className="flex flex-col flex-1 overflow-hidden">
            <div ref={chatContainerRef} className="flex-1 p-6 overflow-y-auto">
                <div className="flex flex-col max-w-4xl gap-6 mx-auto">
                    {messages.map((msg) => (
                        <ChatMessage key={msg.id} {...msg} />
                    ))}
                    {isLoading && <ChatMessageLoading />}
                </div>
            </div>
            <div className="w-full max-w-4xl p-4 mx-auto border-t bg-background/80 backdrop-blur-sm">
                <ChatInput onSendMessage={onSendMessage} isLoading={isLoading} onFileChange={onFileChange} />
            </div>
        </div>
    );
});
