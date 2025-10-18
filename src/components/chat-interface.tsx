
"use client";

import { useRef, useEffect, ChangeEvent, memo, RefObject } from 'react';
import { ChatMessage, ChatMessageLoading } from '@/components/chat-message';
import { ChatInput } from '@/components/chat-input';
import { SuggestedQuestions } from '@/components/suggested-questions';
import { PdfUploader } from './pdf-uploader';

export type Message = {
  role: 'user' | 'assistant';
  content: string;
  source?: string;
  id: string;
  isReport?: boolean;
};

type ChatInterfaceProps = {
    messages: Message[];
    isLoading: boolean;
    onSendMessage: (message: string) => Promise<void>;
    onFileChange: (event: ChangeEvent<HTMLInputElement>) => void;
    fileInputRef: RefObject<HTMLInputElement>;
    suggestedQuestions: string[];
    activeFile: { name: string; dataUri: string } | null;
    onRemoveFile: () => void;
};

export const ChatInterface = memo(function ChatInterface({ messages, isLoading, onSendMessage, onFileChange, fileInputRef, suggestedQuestions, activeFile, onRemoveFile }: ChatInterfaceProps) {
    const chatContainerRef = useRef<HTMLDivElement>(null);
    
    useEffect(() => {
        if (chatContainerRef.current) {
          chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [messages, isLoading]);

    const showUploader = messages.length === 0;

    return (
        <div className="flex flex-col h-full">
            <div ref={chatContainerRef} className="flex-1 p-6 overflow-y-auto">
                <div className="flex flex-col min-h-full max-w-4xl gap-6 mx-auto justify-center">
                    {showUploader ? (
                        <div className="text-center">
                            <p className="mt-2 text-base text-muted-foreground">
                                An agricultural AI assistant to help you interpret soil reports and answer your agronomy questions, summarize background, and more
                            </p>
                            <div className="max-w-xl mx-auto mt-4">
                                <SuggestedQuestions 
                                    questions={suggestedQuestions}
                                    onQuestionSelect={onSendMessage}
                                />
                                <div className="mt-4">
                                  <PdfUploader onFileChange={onFileChange} ref={fileInputRef} />
                                </div>
                            </div>
                        </div>
                    ) : (
                        <>
                            <div className="flex-grow" />
                            {messages.map((msg) => (
                                <ChatMessage key={msg.id} {...msg} />
                            ))}
                            {isLoading && <ChatMessageLoading />}
                        </>
                    )}
                </div>
            </div>
            <div className="w-full px-4 pt-4 pb-5 border-t bg-background/80 backdrop-blur-sm shrink-0">
                <div className="max-w-4xl mx-auto">
                    <ChatInput 
                        onSendMessage={onSendMessage} 
                        isLoading={isLoading} 
                        onFileChange={onFileChange} 
                        fileInputRef={fileInputRef}
                        activeFile={activeFile}
                        onRemoveFile={onRemoveFile}
                    />
                </div>
            </div>
        </div>
    );
});
