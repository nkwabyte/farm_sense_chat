
"use client"

import * as React from 'react';
import { Button } from '@/components/ui/button';

type ChatHeaderProps = {
    title: string;
    children: React.ReactNode;
};

export function ChatHeader({ title, children }: ChatHeaderProps) {
    return (
        <header className="flex items-center justify-between p-2 border-b">
            <div>{children}</div>
            <h1 className="text-lg font-semibold truncate">{title}</h1>
            <div className='w-10'></div>
        </header>
    );
}
