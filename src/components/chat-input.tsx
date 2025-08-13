"use client";

import { useState, useRef, useEffect, type FormEvent, type KeyboardEvent } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { SendHorizonal, LoaderCircle } from 'lucide-react';

type ChatInputProps = {
    onSendMessage: (message: string) => Promise<void>;
    isLoading: boolean;
};

export function ChatInput({ onSendMessage, isLoading }: ChatInputProps) {
    const [message, setMessage] = useState('');
    const textareaRef = useRef<HTMLTextAreaElement>(null);

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
            await onSendMessage(currentMessage);
        }
    };
    
    const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e as unknown as FormEvent);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="relative flex items-start w-full gap-4">
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
