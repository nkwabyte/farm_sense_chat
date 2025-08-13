"use client";

import { Bot, User, FileText, LoaderCircle } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

type ChatMessageProps = {
    role: 'user' | 'assistant';
    content: string;
    source?: string;
    isReport?: boolean;
};

export function ChatMessage({ role, content, source, isReport }: ChatMessageProps) {
    const isUser = role === 'user';

    const renderContent = () => {
        if (!isReport) {
            return <p className="whitespace-pre-wrap">{content}</p>;
        }

        const sections = content.split('\n\n');
        return sections.map((section, index) => {
            const [title, ...body] = section.split('\n');
            return (
                <div key={index} className="mb-4 last:mb-0">
                    <h4 className="font-bold">{title.replace(/\*\*/g, '')}</h4>
                    <p className="whitespace-pre-wrap">{body.join('\n')}</p>
                </div>
            );
        });
    };

    return (
        <div className={cn('flex items-start gap-4 animate-in fade-in', isUser ? 'justify-end' : '')}>
            {!isUser && (
                <Avatar className="w-10 h-10 border bg-background">
                    <AvatarFallback className="bg-accent text-accent-foreground">
                        <Bot className="w-5 h-5" />
                    </AvatarFallback>
                </Avatar>
            )}
            <div className={cn('max-w-2xl', isUser ? 'text-right' : '')}>
                <Card className={cn('shadow-sm', isUser ? 'bg-primary text-primary-foreground' : 'bg-card')}>
                    {isReport && !isUser && (
                        <CardHeader className="p-4 pb-2">
                            <CardTitle className="text-xl">Farmer-Friendly Report</CardTitle>
                        </CardHeader>
                    )}
                    <CardContent className="p-4">
                        {renderContent()}
                    </CardContent>
                    {!isUser && source && (
                        <CardFooter className="flex items-center gap-2 p-2 pt-0 text-xs border-t text-muted-foreground">
                           <FileText className="w-4 h-4" /> <span>Source: {source}</span>
                        </CardFooter>
                    )}
                </Card>
            </div>
            {isUser && (
                <Avatar className="w-10 h-10 border bg-background">
                    <AvatarFallback>
                        <User className="w-5 h-5" />
                    </AvatarFallback>
                </Avatar>
            )}
        </div>
    );
}

export function ChatMessageLoading() {
    return (
        <div className="flex items-start gap-4 animate-in fade-in">
            <Avatar className="w-10 h-10 border bg-background">
                <AvatarFallback className="bg-accent text-accent-foreground">
                    <Bot className="w-5 h-5" />
                </AvatarFallback>
            </Avatar>
            <div className="max-w-xl">
                <Card className="bg-card">
                    <CardContent className="flex items-center justify-center p-4">
                        <LoaderCircle className="w-5 h-5 animate-spin text-muted-foreground" />
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
