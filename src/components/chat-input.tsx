"use client";

import { useState, useRef, useEffect, type FormEvent, type KeyboardEvent, ChangeEvent } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { SendHorizonal, LoaderCircle, Paperclip } from 'lucide-react';
import { Label } from './ui/label';
import { Input } from './ui/input';

type ChatInputProps = {
    onSendMessage: (message: string, isUserMessage?: boolean) => Promise<void>;
    isLoading: boolean;
    onFileChange: (event: ChangeEvent<HTMLInputElement>) => void;
};

export function ChatInput({ onSendMessage, isLoading, onFileChange }: ChatInputProps) {
    const [message, setMessage] = useState('');
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const fileInputId = 'chat-file-upload';

    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
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
                textareaRef.current.style.height = 'auto';
            }
            await onSendMessage(currentMessage, true);
        }
    };
    
    const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e as unknown as FormEvent);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="relative flex items-start w-full gap-2 md:gap-4">
            <Button asChild variant="ghost" size="icon" className="shrink-0">
                <Label htmlFor={fileInputId} className="cursor-pointer">
                    <Paperclip className="w-5 h-5" />
                    <span className="sr-only">Attach file</span>
                </Label>
            </Button>
            <Input id={fileInputId} type="file" accept="application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document" className="sr-only" onChange={onFileChange} />
            <Textarea
                ref={textareaRef}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask a question about the document..."
                className="py-3 pl-4 text-base resize-none pr-14 max-h-48"
                disabled={isLoading}
                rows={1}
                aria-label="Chat input"
            />
            <Button type="submit" size="icon" className="absolute shrink-0 bottom-2.5 right-2.5" disabled={isLoading || !message.trim()} aria-label="Send message">
                {isLoading ? <LoaderCircle className="w-5 h-5 animate-spin" /> : <SendHorizonal className="w-5 h-5" />}
            </Button>
        </form>
    );
}
