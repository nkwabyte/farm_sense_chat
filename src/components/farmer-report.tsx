"use client";

import { useState, useEffect } from "react";
import { formatFarmerReport, type FormatFarmerReportOutput } from "@/ai/flows/format-farmer-report";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Terminal, MessageSquare } from "lucide-react";

type FarmerReportProps = {
    pdfFile: File;
    onReportFormatted: (report: FormatFarmerReportOutput) => void;
};

async function extractTextFromDataUri(dataUri: string): Promise<string> {
    const response = await fetch(dataUri);
    const blob = await response.blob();
    // This is a simplified text extraction. 
    // For real PDFs, a library like pdf-js would be needed on the client or server.
    // For DOCX, a library like mammoth.js would be needed.
    // We will simulate by reading blob as text, which works for text-based PDFs.
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsText(blob);
    });
}

export function FarmerReport({ pdfFile, onReportFormatted }: FarmerReportProps) {
    const [report, setReport] = useState<FormatFarmerReportOutput | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { toast } = useToast();

    useEffect(() => {
        const generateReport = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const reader = new FileReader();
                reader.readAsDataURL(pdfFile);
                reader.onload = async (e) => {
                    const dataUri = e.target?.result as string;
                    // This is a placeholder for actual text extraction from PDF/DOCX
                    // In a real app, you'd use a library to parse the file content.
                    // For this example, we'll send a dummy string. A real implementation
                    // would extract the text and send it. We are sending a simple string
                    // because we cannot implement a full text extraction here.
                    const textContent = `Simulated text content from ${pdfFile.name}. This would be the full text extracted from the uploaded document.`;

                    try {
                        const result = await formatFarmerReport({ reportText: textContent });
                        setReport(result);
                    } catch (aiError) {
                        console.error(aiError);
                        setError("Could not format the report using AI. Please try again.");
                        toast({
                            variant: "destructive",
                            title: "AI Error",
                            description: "Could not format the report.",
                        });
                    } finally {
                        setIsLoading(false);
                    }
                };
                reader.onerror = () => {
                    setError("There was an error reading your file.");
                    toast({
                        variant: "destructive",
                        title: "File Read Error",
                        description: "There was an error reading your file.",
                    });
                    setIsLoading(false);
                };

            } catch (e) {
                console.error(e);
                setError("An unexpected error occurred.");
                setIsLoading(false);
            }
        };

        generateReport();
    }, [pdfFile, toast]);

    const handleContinue = () => {
        if (report) {
            onReportFormatted(report);
        }
    }

    const renderSkeleton = () => (
        <div className="space-y-6">
            <div className="space-y-2">
                <Skeleton className="h-6 w-1/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
            </div>
            <div className="space-y-2">
                <Skeleton className="h-6 w-1/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
            </div>
            <div className="space-y-2">
                <Skeleton className="h-6 w-1/4" />
                <Skeleton className="h-4 w-1/2" />
            </div>
        </div>
    );

    return (
        <div className="flex-1 p-6 overflow-y-auto">
            <div className="max-w-4xl mx-auto">
                <Card>
                    <CardHeader>
                        <CardTitle>Your Farmer-Friendly Report for: {pdfFile.name}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {isLoading && renderSkeleton()}
                        {error && (
                             <Alert variant="destructive">
                                <Terminal className="w-4 h-4" />
                                <AlertTitle>Error</AlertTitle>
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}
                        {report && !isLoading && (
                            <div className="space-y-4 text-base">
                                <ReportSection title="Farm Details" content={report.farmDetails} />
                                <ReportSection title="What We Checked" content={report.whatWeChecked} />
                                <ReportSection title="What We Found" content={report.whatWeFound} />
                                <ReportSection title="What You Should Do" content={report.whatYouShouldDo} />
                                <ReportSection title="Money Matters" content={report.moneyMatters} />
                                <ReportSection title="Extra Tips" content={report.extraTips} />
                            </div>
                        )}
                    </CardContent>
                    {report && !isLoading && !error && (
                        <CardFooter className="justify-end pt-6 border-t">
                             <Button onClick={handleContinue}>
                                <MessageSquare className="w-5 h-5 mr-2" />
                                Continue to Chat
                            </Button>
                        </CardFooter>
                    )}
                </Card>
            </div>
        </div>
    );
}


function ReportSection({ title, content }: { title: string, content: string }) {
    if (!content) return null;
    return (
        <div>
            <h3 className="mb-2 text-xl font-bold font-headline">{title}</h3>
            <p className="whitespace-pre-wrap">{content}</p>
        </div>
    )
}
