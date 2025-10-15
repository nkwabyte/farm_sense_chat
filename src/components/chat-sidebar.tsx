
"use client";

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { PlusCircle, X, Pencil, Check, Dot } from 'lucide-react';
import { type Message } from './chat-interface';
import { ScrollArea } from './ui/scroll-area';
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
import { Input } from './ui/input';
import { cn } from '@/lib/utils';

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
    onRenameChat: (id: string, newTitle: string) => void;
};

export function ChatSidebar({ sessions, activeChatId, setActiveChatId, onNewChat, onDeleteChat, onRenameChat }: ChatSidebarProps) {
    const [renamingId, setRenamingId] = React.useState<string | null>(null);
    const [renameValue, setRenameValue] = React.useState('');
    const renameInputRef = React.useRef<HTMLInputElement>(null);

    React.useEffect(() => {
        if (renamingId && renameInputRef.current) {
            renameInputRef.current.focus();
        }
    }, [renamingId]);
    
    const handleStartRename = (session: ChatSession) => {
        setRenamingId(session.id);
        setRenameValue(session.title);
    }

    const handleConfirmRename = () => {
        if (renamingId && renameValue.trim()) {
            onRenameChat(renamingId, renameValue.trim());
        }
        setRenamingId(null);
        setRenameValue('');
    }

    const handleCancelRename = () => {
        setRenamingId(null);
        setRenameValue('');
    }

    const handleRenameKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleConfirmRename();
        } else if (e.key === 'Escape') {
            handleCancelRename();
        }
    }

    return (
        <div className="flex flex-col h-screen p-4 border-r pt-14 bg-muted/20">
            <Button variant="outline" onClick={onNewChat} className='w-full'>
                <PlusCircle className="w-5 h-5 mr-2"/>
                New Chat
            </Button>
            <h2 className='mt-6 mb-2 text-sm font-semibold text-muted-foreground'>Your Conversations</h2>
            <ScrollArea className="flex-1 -mx-4">
                <div className='px-4 space-y-2'>
                    {sessions.map(session => (
                        <div key={session.id} className='relative group'>
                            {renamingId === session.id ? (
                                <div className="flex items-center gap-2 pr-2">
                                    <Input
                                        ref={renameInputRef}
                                        value={renameValue}
                                        onChange={(e) => setRenameValue(e.target.value)}
                                        onKeyDown={handleRenameKeyDown}
                                        onBlur={handleConfirmRename}
                                        className="h-9"
                                    />
                                    <Button size="icon" variant="ghost" className="w-9 h-9" onClick={handleConfirmRename}>
                                        <Check className="w-4 h-4" />
                                    </Button>
                                </div>
                            ) : (
                                <Button
                                    variant={session.id === activeChatId ? "secondary" : "ghost"}
                                    className="justify-start w-full h-auto py-2 pl-3 pr-10 text-left"
                                    onClick={() => setActiveChatId(session.id)}
                                >
                                    <span className='truncate'>{session.title}</span>
                                </Button>
                            )}
                            
                            {renamingId !== session.id && (
                               <div className='absolute flex items-center gap-0.5 -right-0 top-1/2 -translate-y-1/2'>
                                    <RenameChatButton onRename={() => handleStartRename(session)} />
                                    <DeleteChatButton onDelete={() => onDeleteChat(session.id)} />
                               </div>
                            )}
                        </div>
                    ))}
                </div>
            </ScrollArea>
        </div>
    );
}

function RenameChatButton({ onRename }: { onRename: () => void }) {
    return (
        <Button
            variant="ghost" 
            size="icon" 
            className='w-8 h-8 transition-opacity opacity-0 group-hover:opacity-100'
            onClick={onRename}
        >
            <Pencil className='w-4 h-4'/>
            <span className='sr-only'>Rename Chat</span>
        </Button>
    )
}

function DeleteChatButton({ onDelete }: { onDelete: () => void }) {
    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button 
                    variant="ghost" 
                    size="icon" 
                    className='w-8 h-8 transition-opacity opacity-0 group-hover:opacity-100'
                    >
                    <X className='w-4 h-4'/>
                    <span className='sr-only'>Delete Chat</span>
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete your
                    chat session and remove your data from local storage.
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
