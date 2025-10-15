
"use client";

import { useState, useCallback, useRef, ChangeEvent, useMemo, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";
import { type Message } from '@/components/chat-interface';
import { answerQuestionsFromPdf } from '@/ai/flows/answer-questions-from-pdf';
import { ChatInterface } from '@/components/chat-interface';
import { ChatSidebar, type ChatSession } from '@/components/chat-sidebar';
import { nanoid } from 'nanoid';

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
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

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
  }, []);

  const handleDeleteChat = useCallback((sessionId: string) => {
    setChatSessions(prev => {
      const newSessions = prev.filter(session => session.id !== sessionId);
      if (activeChatId === sessionId) {
        if (newSessions.length > 0) {
          setActiveChatId(newSessions[0].id);
        } else {
          setActiveChatId(null);
          handleNewChat(); // Create a new chat if all are deleted
        }
      }
      return newSessions;
    });
  }, [activeChatId, handleNewChat]);
  
  const handleFileChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    let currentActiveChatId = activeChatId;

    if (!currentActiveChatId || (activeChat && activeChat.messages.length > 0)) {
        const newChatId = nanoid();
        const newChatSession: ChatSession = {
            id: newChatId,
            messages: [],
            pdfFile: null,
            title: 'New Chat'
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
  }, [toast, activeChatId, activeChat]);

  const handleSendMessage = async (message: string) => {
    let currentChatId = activeChatId;
    
    if (!currentChatId) {
        const newChatId = nanoid();
        const newChatSession: ChatSession = {
            id: newChatId,
            messages: [],
            pdfFile: null,
            title: message.substring(0, 30) + "..."
        };
        setChatSessions(prev => [newChatSession, ...prev]);
        setActiveChatId(newChatId);
        currentChatId = newChatId;
    }

    const userMessageId = nanoid();
    const userMessage: Message = { role: 'user', content: message, id: userMessageId };

    setChatSessions(prev =>
      prev.map(session =>
        session.id === currentChatId
          ? { 
              ...session, 
              messages: [...session.messages, userMessage],
              title: session.messages.length === 0 ? message.substring(0, 30) + "..." : session.title,
            }
          : session
      )
    );
    setIsLoading(true);

    try {
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

  return (
      <div className="grid h-screen w-full grid-cols-[1fr_340px]">
        <div className="flex flex-col h-screen bg-background text-foreground">
          <main className="flex-1 overflow-hidden">
              <ChatInterface
                messages={activeChat?.messages ?? []}
                isLoading={isLoading}
                onSendMessage={handleSendMessage}
                onFileChange={handleFileChange}
                fileInputRef={fileInputRef}
                suggestedQuestions={suggestedQuestions}
                activeFile={activeChat?.pdfFile ?? null}
                onRemoveFile={handleRemoveFile}
                key={activeChatId}
              />
          </main>
          <footer className="px-4 py-2 text-xs text-center border-t text-muted-foreground">
            Responses may not be accurate - verify all responses from Pomaa AI before applying any advice
          </footer>
        </div>
        <ChatSidebar 
          sessions={chatSessions} 
          activeChatId={activeChatId} 
          setActiveChatId={setActiveChatId}
          onNewChat={handleNewChat}
          onDeleteChat={handleDeleteChat}
        />
      </div>
  );
}

    