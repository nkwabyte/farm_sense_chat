"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageSquare, FileText, FileUp } from 'lucide-react';

type OptionSelectorProps = {
    onSelect: (option: 'chat' | 'report') => void;
    pdfFileName: string;
};

export function OptionSelector({ onSelect, pdfFileName }: OptionSelectorProps) {
    return (
        <div className="flex-1 p-6 overflow-y-auto">
            <div className="flex flex-col items-center max-w-4xl gap-8 mx-auto">
                <div className="flex items-center gap-3 p-4 text-lg border rounded-lg bg-card text-card-foreground">
                    <FileUp className="w-6 h-6 text-primary" />
                    <p>Successfully uploaded <span className="font-semibold">{pdfFileName}</span></p>
                </div>

                <h2 className="text-2xl font-bold text-center font-headline">What would you like to do?</h2>
                
                <div className="grid w-full grid-cols-1 gap-6 md:grid-cols-2">
                    <Card className="flex flex-col transition-all duration-300 shadow-md hover:shadow-xl hover:-translate-y-1">
                        <CardHeader>
                            <div className="flex items-center gap-4">
                                <div className="p-3 rounded-full bg-accent/20">
                                    <MessageSquare className="w-8 h-8 text-accent" />
                                </div>
                                <CardTitle className="text-xl">Chat with Document</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent className="flex flex-col flex-grow">
                            <CardDescription className="mb-4">
                                Ask questions, get summaries, and find specific information within your uploaded PDF.
                            </CardDescription>
                            <Button onClick={() => onSelect('chat')} className="w-full mt-auto">Start Chatting</Button>
                        </CardContent>
                    </Card>
                    <Card className="flex flex-col transition-all duration-300 shadow-md hover:shadow-xl hover:-translate-y-1">
                        <CardHeader>
                            <div className="flex items-center gap-4">
                                <div className="p-3 rounded-full bg-accent/20">
                                    <FileText className="w-8 h-8 text-accent" />
                                </div>
                                <CardTitle className="text-xl">Format Report</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent className="flex flex-col flex-grow">
                            <CardDescription className="mb-4">
                                Automatically format the document into a clean, structured, and farmer-friendly report.
                            </CardDescription>
                            <Button onClick={() => onSelect('report')} className="w-full mt-auto">Format Report</Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
