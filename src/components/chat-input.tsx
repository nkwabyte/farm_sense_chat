
"use client";

import { useState, useRef, useEffect, type FormEvent, type KeyboardEvent, ChangeEvent, RefObject } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { SendHorizonal, LoaderCircle, Paperclip, ArrowUp } from 'lucide-react';
import { FileBubble } from './file-bubble';

type ChatInputProps = {
    onSendMessage: (message: string) => Promise<void>;
    isLoading: boolean;
    onFileChange: (event: ChangeEvent<HTMLInputElement>) => void;
    fileInputRef: RefObject<HTMLInputElement>;
    activeFile: { name: string, dataUri: string } | null;
    onRemoveFile: () => void;
};

export function ChatInput({ onSendMessage, isLoading, onFileChange, fileInputRef, activeFile, onRemoveFile }: ChatInputProps) {
    const [message, setMessage] = useState('');
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const fileInputId = 'chat-file-upload';

    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto'; // Reset height
            const scrollHeight = textareaRef.current.scrollHeight;
            textareaRef.current.style.height = `${scrollHeight}px`;
        }
    }, [message]);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (message.trim() && !isLoading) {
            const currentMessage = message.trim();
            setMessage('');
            if (textareaRef.current) {
                // Reset height after sending
                textareaRef.current.style.height = 'auto';
            }
            await onSendMessage(currentMessage);
        }
    };
    
    const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e as unknown as FormEvent);
        }
    };

    const handleFileButtonClick = () => {
        fileInputRef.current?.click();
    };

    return (
        <div className='space-y-3'>
             {activeFile && (
                <FileBubble fileName={activeFile.name} onDismiss={onRemoveFile} />
            )}
            <form onSubmit={handleSubmit} className="relative w-full">
                <Textarea
                    ref={textareaRef}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask me any question about agronomy, or upload your soil report and ask a question related to it."
                    className="py-3 pl-12 text-base resize-none pr-14 max-h-48 min-h-[52px]"
                    disabled={isLoading}
                    rows={1}
                    aria-label="Chat input"
                />
                 <Button type="button" variant="ghost" size="icon" className="absolute shrink-0 bottom-2 left-2" onClick={handleFileButtonClick} disabled={isLoading}>
                    <Paperclip className="w-5 h-5" />
                    <span className="sr-only">Attach file</span>
                 </Button>

                <Button type="submit" size="icon" className="absolute shrink-0 bottom-2 right-2.5" disabled={isLoading || !message.trim()} aria-label="Send message">
                    {isLoading ? <LoaderCircle className="w-5 h-5 animate-spin" /> : <ArrowUp className="w-5 h-5" />}
                </Button>
                <input id={fileInputId} type="file" accept="application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document" className="hidden" onChange={onFileChange} ref={fileInputRef} />
            </form>
        </div>
    );
}
