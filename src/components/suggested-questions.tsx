
"use client";

import { Button } from "@/components/ui/button";

type SuggestedQuestionsProps = {
    questions: string[];
    onQuestionSelect: (question: string) => void;
};

export function SuggestedQuestions({ questions, onQuestionSelect }: SuggestedQuestionsProps) {
    return (
        <div className="space-y-3">
            {questions.map((question, index) => (
                <Button 
                    key={index} 
                    variant="outline" 
                    className="w-full h-auto py-3 px-4 whitespace-normal text-left justify-start font-normal"
                    onClick={() => onQuestionSelect(question)}
                >
                    {question}
                </Button>
            ))}
        </div>
    );
}

    