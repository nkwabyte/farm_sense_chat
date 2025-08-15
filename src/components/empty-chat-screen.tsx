
"use client";

import { ChangeEvent, RefObject } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UploadCloud } from "lucide-react";
import { ChatInput } from "./chat-input";

type EmptyChatScreenProps = {
  onSendMessage: (message: string) => Promise<void>;
  onFileChange: (event: ChangeEvent<HTMLInputElement>) => void;
  fileInputRef: RefObject<HTMLInputElement>;
  isLoading: boolean;
};

const exampleMessages = [
  {
    heading: 'Understand soil nutrients',
    message: `What is the importance of nitrogen in soil?`,
  },
  {
    heading: 'Get crop recommendations',
    message: 'What are the recommended nutrients for soybeans?',
  },
  {
    heading: 'Learn about fertilizers',
    message: `What is the difference between NPK and urea fertilizers?`,
  },
  {
    heading: 'Interpret a soil report',
    message: `If a soil test shows low pH, what does that mean for my crops?`,
  },
];

export function EmptyChatScreen({ onSendMessage, onFileChange, fileInputRef, isLoading }: EmptyChatScreenProps) {
    const fileInputId = "empty-chat-file-upload";

    return (
        <div className="flex flex-col h-full">
            <div className="flex-1 overflow-y-auto p-6">
                <div className="max-w-4xl mx-auto">
                    <div className="text-center mb-12">
                        <h1 className="text-4xl font-bold font-headline mb-2">FarmSenseChat</h1>
                        <p className="text-muted-foreground">Your AI assistant for smart agriculture.</p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
                        {exampleMessages.map((item, index) => (
                            <Card key={index} className="cursor-pointer hover:bg-accent/50" onClick={() => onSendMessage(item.message)}>
                                <CardHeader>
                                    <CardTitle className="text-base">{item.heading}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-muted-foreground">{item.message}</p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    <div className="text-center">
                        <p className="text-muted-foreground mb-4">Or upload a document to get started</p>
                        <Button asChild>
                            <Label htmlFor={fileInputId} className="cursor-pointer">
                                <UploadCloud className="w-5 h-5 mr-2" />
                                Select PDF or DOCX
                            </Label>
                        </Button>
                        <Input id={fileInputId} type="file" accept="application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document" className="sr-only" onChange={onFileChange} ref={fileInputRef} />
                    </div>
                </div>
            </div>
             <div className="w-full px-4 pt-4 pb-5 border-t bg-background/80 backdrop-blur-sm shrink-0">
                <div className="max-w-4xl mx-auto">
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
}
