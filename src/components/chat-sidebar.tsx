
"use client";

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { PlusCircle, X } from 'lucide-react';
import { type Message } from './chat-interface';
import { ScrollArea } from './ui/scroll-area';
import { cn } from '@/lib/utils';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

export type ChatSession = {
    id: string;
    title: string;
    messages: Message[];
    pdfFile: { name: string; dataUri: string } | null;
};

type ChatSidebarProps = {
    sessions: ChatSession[];
    activeChatId: string | null;
    setActiveChatId: (id: string) => void;
    onNewChat: () => void;
    onDeleteChat: (id: string) => void;
};

export function ChatSidebar({ sessions, activeChatId, setActiveChatId, onNewChat, onDeleteChat }: ChatSidebarProps) {
    
    return (
        <div className="flex flex-col h-screen p-4 border-l bg-muted/20">
            <Button variant="outline" onClick={onNewChat} className='w-full'>
                <PlusCircle className="w-5 h-5 mr-2"/>
                New Chat
            </Button>
            <h2 className='mt-6 mb-2 text-sm font-semibold text-muted-foreground'>Your Conversations</h2>
            <ScrollArea className="flex-1 -mx-4">
                <div className='px-4 space-y-2'>
                    {sessions.map(session => (
                        <div key={session.id} className='relative'>
                            <Button
                                variant={session.id === activeChatId ? "secondary" : "ghost"}
                                className="justify-start w-full h-auto px-3 py-2 text-left truncate"
                                onClick={() => setActiveChatId(session.id)}
                            >
                                <span className='truncate'>{session.title}</span>
                            </Button>
                            {session.id !== activeChatId && (
                                <DeleteChatButton onDelete={() => onDeleteChat(session.id)} />
                            )}
                        </div>
                    ))}
                </div>
            </ScrollArea>
        </div>
    );
}

function DeleteChatButton({ onDelete }: { onDelete: () => void }) {
    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button 
                    variant="ghost" 
                    size="icon" 
                    className='absolute w-8 h-8 transition-opacity opacity-0 -right-1 top-1/2 -translate-y-1/2 group-hover:opacity-100'
                    >
                    <X className='w-4 h-4'/>
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete your
                    chat session and remove your data from our servers.
                </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={onDelete}>Continue</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
      </AlertDialog>
    );
}

    