
"use client";

import { useState, useCallback, useRef, ChangeEvent, useMemo, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useToast } from "@/hooks/use-toast";
import { type Message } from '@/components/chat-interface';
import { answerQuestionsFromPdf } from '@/ai/flows/answer-questions-from-pdf';
import { ChatInterface } from '@/components/chat-interface';
import { ChatSidebar, type ChatSession } from '@/components/chat-sidebar';
import { nanoid } from 'nanoid';
import { useIsMobile } from '@/hooks/use-mobile';
import { ChatHeader } from '@/components/chat-header';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { PanelLeft } from 'lucide-react';

const suggestedQuestions = [
    "What is the importance of soil pH?",
    "What are the signs of nitrogen deficiency in maize?",
    "What are the different types of fertilizers for soybeans?",
    "Explain this soil report in very simple english for a farmer.",
];

export default function AgriChatPage() {
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isMobile = useIsMobile();
  const searchParams = useSearchParams();
  const bgColor = searchParams.get('bgcolor');

  const activeChat = useMemo(() => {
    return chatSessions.find(session => session.id === activeChatId);
  }, [chatSessions, activeChatId]);

  useEffect(() => {
    try {
      const savedSessions = window.localStorage.getItem('chatSessions');
      const savedActiveChatId = window.localStorage.getItem('activeChatId');

      if (savedSessions) {
        const parsedSessions = JSON.parse(savedSessions);
        setChatSessions(parsedSessions);
        if (savedActiveChatId && parsedSessions.some((s: ChatSession) => s.id === JSON.parse(savedActiveChatId))) {
          setActiveChatId(JSON.parse(savedActiveChatId));
        } else if (parsedSessions.length > 0) {
          setActiveChatId(parsedSessions[0].id);
        }
      } else {
        handleNewChat();
      }
    } catch (error) {
      console.error("Failed to load from local storage", error);
      handleNewChat();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    try {
      if (chatSessions.length > 0) {
        window.localStorage.setItem('chatSessions', JSON.stringify(chatSessions));
      } else {
        window.localStorage.removeItem('chatSessions');
      }
    } catch (error) {
      console.error("Failed to save sessions to local storage", error);
    }
  }, [chatSessions]);

  useEffect(() => {
    try {
      if (activeChatId) {
        window.localStorage.setItem('activeChatId', JSON.stringify(activeChatId));
      } else {
        window.localStorage.removeItem('activeChatId');
      }
    } catch (error) {
      console.error("Failed to save active chat ID to local storage", error);
    }
  }, [activeChatId]);

  const handleNewChat = useCallback(() => {
    const newChatId = nanoid();
    const newChatSession: ChatSession = {
      id: newChatId,
      messages: [],
      pdfFile: null,
      title: 'New Chat'
    };
    setChatSessions(prev => [newChatSession, ...prev]);
    setActiveChatId(newChatId);
    if(isMobile) setIsSidebarOpen(false);
  }, [isMobile]);

  const handleDeleteChat = useCallback((sessionId: string) => {
    setChatSessions(prev => {
      const newSessions = prev.filter(session => session.id !== sessionId);
      if (activeChatId === sessionId) {
        if (newSessions.length > 0) {
          setActiveChatId(newSessions[0].id);
        } else {
          // If all chats are deleted, create a new one
          const newChatId = nanoid();
          const newChatSession: ChatSession = {
            id: newChatId,
            messages: [],
            pdfFile: null,
            title: 'New Chat'
          };
          setActiveChatId(newChatId);
          return [newChatSession];
        }
      }
      return newSessions;
    });
  }, [activeChatId]);

  const handleRenameChat = useCallback((sessionId: string, newTitle: string) => {
    setChatSessions(prev => 
      prev.map(session => 
        session.id === sessionId ? { ...session, title: newTitle } : session
      )
    );
  }, []);
  
  const handleFileChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    let currentActiveChatId = activeChatId;
    let shouldCreateNewChat = !currentActiveChatId || (activeChat && activeChat.messages.length > 0);

    if (shouldCreateNewChat) {
        const newChatId = nanoid();
        const file = event.target.files?.[0];
        const newChatSession: ChatSession = {
            id: newChatId,
            messages: [],
            pdfFile: null, 
            title: file ? file.name : 'New Chat'
        };
        setChatSessions(prev => [newChatSession, ...prev]);
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
                ? { ...session, pdfFile: newPdfFile, title: session.title === 'New Chat' || !session.pdfFile ? file.name : session.title }
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
  }, [toast, activeChatId, activeChat]);

  const handleSendMessage = async (message: string) => {
    if (!message.trim()) return;

    let currentChatId = activeChatId;
    
    if (!currentChatId) {
      const newChatId = nanoid();
      const newChatSession: ChatSession = {
        id: newChatId,
        messages: [],
        pdfFile: null,
        title: 'New Chat'
      };
      setChatSessions(prev => [newChatSession, ...prev]);
      setActiveChatId(newChatId);
      currentChatId = newChatId;
    }

    const userMessageId = nanoid();
    const userMessage: Message = { role: 'user', content: message, id: userMessageId };

    const currentSession = chatSessions.find(s => s.id === currentChatId);
    const pdfDataUri = currentSession?.pdfFile?.dataUri;
    const pdfName = currentSession?.pdfFile?.name;

    setChatSessions(prev =>
      prev.map(session =>
        session.id === currentChatId
          ? { 
              ...session, 
              messages: [...session.messages, userMessage],
              title: session.messages.length === 0 && session.title === 'New Chat' ? message.substring(0, 30) + "..." : session.title,
            }
          : session
      )
    );
    setIsLoading(true);
    setInputValue('');

    try {
      const response = await answerQuestionsFromPdf({
        question: message,
        pdfDataUri: pdfDataUri,
      });

      const aiMessage: Message = {
        role: 'assistant',
        content: response.answer,
        source: response.source?.replace('ExamplePDF.pdf', pdfName ?? "General Knowledge"),
        id: nanoid(),
      };
      
      setChatSessions(prev =>
        prev.map(session =>
          session.id === currentChatId
            ? { ...session, messages: [...session.messages, aiMessage], pdfFile: null } // Clear file after sending
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

  const handleRemoveFile = useCallback(() => {
    if (activeChatId) {
      setChatSessions(prev =>
        prev.map(session =>
          session.id === activeChatId ? { ...session, pdfFile: null } : session
        )
      );
    }
  }, [activeChatId]);
  
  const onSelectChat = (id: string) => {
    setActiveChatId(id);
    if (isMobile) {
      setIsSidebarOpen(false);
    }
  }

  const handleSuggestedQuestion = (question: string) => {
    setInputValue(question);
  }

  const sidebar = (
    <ChatSidebar 
      sessions={chatSessions} 
      activeChatId={activeChatId} 
      setActiveChatId={onSelectChat}
      onNewChat={handleNewChat}
      onDeleteChat={handleDeleteChat}
      onRenameChat={handleRenameChat}
    />
  );

  const chatInterface = (
    <ChatInterface
      messages={activeChat?.messages ?? []}
      isLoading={isLoading}
      onSendMessage={handleSendMessage}
      onFileChange={handleFileChange}
      fileInputRef={fileInputRef}
      suggestedQuestions={suggestedQuestions}
      activeFile={activeChat?.pdfFile ?? null}
      onRemoveFile={handleRemoveFile}
      onSuggestedQuestion={handleSuggestedQuestion}
      inputValue={inputValue}
      setInputValue={setInputValue}
      key={activeChatId}
    />
  );

  return (
    <div 
      className="flex h-screen bg-background text-foreground"
      style={bgColor ? { backgroundColor: bgColor } : {}}
    >
        {isMobile ? (
             <div className="flex-1 flex flex-col overflow-hidden">
                <ChatHeader>
                    <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
                    <SheetTrigger asChild>
                        <Button variant="ghost" size="icon">
                        <PanelLeft />
                        <span className="sr-only">Toggle Menu</span>
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="p-0">
                        <SheetHeader className="p-4 border-b">
                        <SheetTitle>Conversations</SheetTitle>
                        </SheetHeader>
                        {sidebar}
                    </SheetContent>
                    </Sheet>
                </ChatHeader>
                <main className="flex-1 overflow-hidden">
                    {chatInterface}
                </main>
                <footer className="px-4 py-2 text-[10px] text-center border-t text-muted-foreground">
                    Responses may not be accurate - verify all responses from Pomaa AI before applying any advice
                </footer>
             </div>
        ) : (
            <div className='flex w-full h-full'>
                <div className="flex flex-col flex-1 overflow-hidden">
                    <div className='flex-1 overflow-auto'>
                      {chatInterface}
                    </div>
                    <footer className="px-4 py-2 text-[10px] text-center border-t text-muted-foreground shrink-0">
                        Responses may not be accurate - verify all responses from Pomaa AI before applying any advice
                    </footer>
                </div>
                <aside className="w-80 lg:w-96 bg-muted/40 border-l">
                    {sidebar}
                </aside>
            </div>
        )}
    </div>
  );
}
