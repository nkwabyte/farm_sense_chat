
"use client";

import * as React from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { ChevronDown, MessageSquare } from 'lucide-react';
import { type Message } from './chat-interface';

export type ChatSession = {
    id: string;
    title: string;
    messages: Message[];
    pdfFile: { name: string; dataUri: string } | null;
};

type ChatHistoryProps = {
    sessions: ChatSession[];
    activeChatId: string | null;
    setActiveChatId: (id: string) => void;
};

export function ChatHistory({ sessions, activeChatId, setActiveChatId }: ChatHistoryProps) {
    const activeChat = sessions.find(s => s.id === activeChatId);

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost">
                    {activeChat ? activeChat.title : "Chat History"}
                    <ChevronDown className="w-4 h-4 ml-2" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-64 max-h-96 overflow-y-auto">
                <DropdownMenuLabel>Your Conversations</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {sessions.length > 0 ? (
                    sessions.map(session => (
                        <DropdownMenuItem key={session.id} onSelect={() => setActiveChatId(session.id)} disabled={session.id === activeChatId}>
                            <MessageSquare className="w-4 h-4 mr-2"/>
                            <span>{session.title}</span>
                        </DropdownMenuItem>
                    ))
                ) : (
                    <DropdownMenuItem disabled>No history yet</DropdownMenuItem>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
