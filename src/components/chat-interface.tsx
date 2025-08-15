
"use client";

import { useRef, useEffect, ChangeEvent, memo, RefObject } from 'react';
import { ChatMessage, ChatMessageLoading } from '@/components/chat-message';
import { ChatInput } from '@/components/chat-input';
import { SuggestedQuestions } from '@/components/suggested-questions';
import { PdfUploader } from './pdf-uploader';
import { FileBubble } from './file-bubble';

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
    showFileBubble: boolean;
    onRemoveFile: () => void;
};

export const ChatInterface = memo(function ChatInterface({ messages, isLoading, onSendMessage, onFileChange, fileInputRef, suggestedQuestions, activeFile, showFileBubble, onRemoveFile }: ChatInterfaceProps) {
    const chatContainerRef = useRef<HTMLDivElement>(null);
    
    useEffect(() => {
        if (chatContainerRef.current) {
          chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [messages, isLoading]);

    const showUploader = messages.length === 0 && !activeFile;

    return (
        <div className="flex flex-col h-full">
            <div ref={chatContainerRef} className="flex-1 p-6 overflow-y-auto">
                <div className="flex flex-col min-h-full max-w-4xl gap-6 mx-auto justify-center">
                    {showUploader ? (
                        <PdfUploader onFileChange={onFileChange} ref={fileInputRef} />
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
                    {showUploader && (
                        <SuggestedQuestions 
                            questions={suggestedQuestions}
                            onQuestionSelect={onSendMessage}
                        />
                    )}
                    {activeFile && showFileBubble && (
                      <FileBubble fileName={activeFile.name} onDismiss={onRemoveFile} />
                    )}
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
