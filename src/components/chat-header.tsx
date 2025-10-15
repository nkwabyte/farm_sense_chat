
"use client"

import * as React from 'react';

type ChatHeaderProps = {
    children: React.ReactNode;
};

export function ChatHeader({ children }: ChatHeaderProps) {
    return (
        <header className="flex items-center justify-between p-2 border-b">
            <div>{children}</div>
            <div className='w-10'></div>
        </header>
    );
}
