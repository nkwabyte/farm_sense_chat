
"use client";

import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";

type SuggestedQuestionsProps = {
    questions: string[];
    onQuestionSelect: (question: string) => void;
};

export function SuggestedQuestions({ questions, onQuestionSelect }: SuggestedQuestionsProps) {
    return (
        <div className="relative mb-4">
            <ScrollArea className="w-full whitespace-nowrap">
                <div className="flex w-max space-x-4 pb-4">
                    {questions.map((question, index) => (
                        <Button 
                            key={index} 
                            variant="outline" 
                            className="h-auto py-2 px-4 whitespace-normal text-left"
                            onClick={() => onQuestionSelect(question)}
                        >
                            {question}
                        </Button>
                    ))}
                </div>
                <ScrollBar orientation="horizontal" />
            </ScrollArea>
        </div>
    );
}
