
"use client";

import { useState, useCallback, useRef, ChangeEvent, useMemo } from 'react';
import { useToast } from "@/hooks/use-toast";
import { type Message } from '@/components/chat-interface';
import { answerQuestionsFromPdf } from '@/ai/flows/answer-questions-from-pdf';
import { ChatInterface } from '@/components/chat-interface';
import { ChatHistory, type ChatSession } from '@/components/chat-history';
import { nanoid } from 'nanoid';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';

const suggestedQuestions = [
    "What is the importance of soil pH?",
    "What are the effects of nitrogen deficiency in corn?",
    "What are the different types of fertilizers for soybeans?",
    "How do you interpret a soil test report?",
];

export default function AgriChatPage() {
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const activeChat = useMemo(() => {
    return chatSessions.find(session => session.id === activeChatId);
  }, [chatSessions, activeChatId]);

  const handleNewChat = useCallback(() => {
    const newChatId = nanoid();
    const newChatSession: ChatSession = {
      id: newChatId,
      messages: [],
      pdfFile: null,
      title: 'New Chat'
    };
    setChatSessions(prev => [...prev, newChatSession]);
    setActiveChatId(newChatId);
  }, []);
  
  const handleFileChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    let currentActiveChatId = activeChatId;

    if (!currentActiveChatId) {
        const newChatId = nanoid();
        const newChatSession: ChatSession = {
            id: newChatId,
            messages: [],
            pdfFile: null,
            title: 'New Chat'
        };
        setChatSessions(prev => [...prev, newChatSession]);
        setActiveChatId(newChatId);
        currentActiveChatId = newChatId;
    }

    const file = event.target.files?.[0];
    if (file && (file.type === 'application/pdf' || file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUri = e.target?.result as string;
        const newPdfFile = { name: file.name, dataUri };

        setChatSessions(prev => prev.map(session =>
            session.id === currentActiveChatId
                ? { ...session, pdfFile: newPdfFile, title: file.name }
                : session
        ));
        
        toast({
          title: "File Uploaded",
          description: `"${file.name}" is ready for analysis.`,
        });
      };
      reader.onerror = () => {
        toast({
          variant: "destructive",
          title: "File ReadError",
          description: "There was an error reading your file.",
        });
      };
      reader.readAsDataURL(file);
    } else if (file) {
      toast({
        variant: "destructive",
        title: "Invalid File Type",
        description: "Please upload a valid PDF or DOCX file.",
      });
    }
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [toast, activeChatId, handleNewChat]);

  const handleSendMessage = async (message: string) => {
    let currentChatId = activeChatId;
    let isNewChat = false;

    // Create a new chat if one doesn't exist
    if (!currentChatId) {
        const newChatId = nanoid();
        const newChatSession: ChatSession = {
            id: newChatId,
            messages: [],
            pdfFile: null,
            title: message.substring(0, 30) + "..."
        };
        setChatSessions(prev => [...prev, newChatSession]);
        setActiveChatId(newChatId);
        currentChatId = newChatId;
        isNewChat = true;
    }

    const userMessageId = nanoid();
    const userMessage: Message = { role: 'user', content: message, id: userMessageId };

    // Update messages for the current chat
    setChatSessions(prev =>
      prev.map(session =>
        session.id === currentChatId
          ? { ...session, messages: [...session.messages, userMessage] }
          : session
      )
    );
    setIsLoading(true);

    try {
      // Need to get the latest session state
      const currentSession = await new Promise<ChatSession | undefined>(resolve => {
        setChatSessions(currentSessions => {
            resolve(currentSessions.find(s => s.id === currentChatId));
            return currentSessions;
        });
      });
      
      const response = await answerQuestionsFromPdf({
        question: message,
        pdfDataUri: currentSession?.pdfFile?.dataUri,
      });

      const aiMessage: Message = {
        role: 'assistant',
        content: response.answer,
        source: response.source?.replace('ExamplePDF.pdf', currentSession?.pdfFile?.name ?? "General Knowledge"),
        id: nanoid(),
      };
      
      setChatSessions(prev =>
        prev.map(session =>
          session.id === currentChatId
            ? { ...session, messages: [...session.messages, aiMessage] }
            : session
        )
      );

    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "AI Error",
        description: "Could not get a response from the AI. Please try again.",
      });
      // Remove the optimistic user message on error
      setChatSessions(prev =>
        prev.map(session =>
          session.id === currentChatId
            ? { ...session, messages: session.messages.filter(m => m.id !== userMessageId) }
            : session
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
      <div className="flex flex-col h-screen bg-background text-foreground">
        <header className="flex items-center justify-between p-4 border-b shrink-0">
            <div className="flex items-center gap-4">
                <h1 className="text-2xl font-bold font-headline">AgriChat PDF</h1>
            </div>
            <div className="flex items-center gap-4">
                <ChatHistory sessions={chatSessions} activeChatId={activeChatId} setActiveChatId={setActiveChatId}/>
                <Button variant="outline" onClick={handleNewChat}>
                    <PlusCircle className="w-5 h-5 mr-2"/>
                    New Chat
                </Button>
            </div>
        </header>
        <main className="flex-1 overflow-hidden">
            <div className="h-full">
              <ChatInterface
                messages={activeChat?.messages ?? []}
                isLoading={isLoading}
                onSendMessage={handleSendMessage}
                onFileChange={handleFileChange}
                fileInputRef={fileInputRef}
                suggestedQuestions={suggestedQuestions}
              />
            </div>
        </main>
      </div>
  );
}
