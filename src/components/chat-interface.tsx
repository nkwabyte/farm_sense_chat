
"use client";

import { useRef, useEffect, ChangeEvent, memo, RefObject } from 'react';
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
    messages: Message[];
    isLoading: boolean;
    onSendMessage: (message: string) => Promise<void>;
    onFileChange: (event: ChangeEvent<HTMLInputElement>) => void;
    fileInputRef: RefObject<HTMLInputElement>;
};

export const ChatInterface = memo(function ChatInterface({ messages, isLoading, onSendMessage, onFileChange, fileInputRef }: ChatInterfaceProps) {
    const chatContainerRef = useRef<HTMLDivElement>(null);
    
    useEffect(() => {
        if (chatContainerRef.current) {
          chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [messages, isLoading]);

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
            <div className="w-full px-4 pt-4 pb-5 border-t bg-background/80 backdrop-blur-sm shrink-0">
                <div className="max-w-4xl mx-auto">
                    <ChatInput 
                        onSendMessage={onSendMessage} 
                        isLoading={isLoading} 
                        onFileChange={onFileChange} 
                        fileInputRef={fileInputRef} 
                    />
                </div>
            </div>
        </div>
    );
});
