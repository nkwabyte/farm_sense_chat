
"use client";

import { useState, useCallback, useRef, useEffect, ChangeEvent } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from "@/hooks/use-toast";
import { type Message } from '@/components/chat-interface';
import { answerQuestionsFromPdf } from '@/ai/flows/answer-questions-from-pdf';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { ChatHistory } from '@/components/chat-history';
import { ChatInterface } from '@/components/chat-interface';
import { nanoid } from 'nanoid';
import { EmptyChatScreen } from '@/components/empty-chat-screen';

export type Conversation = {
  id: string;
  title: string;
  messages: Message[];
  pdfFile?: {
    name: string;
    dataUri: string;
  };
};

export default function AgriChatPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const savedConversations = localStorage.getItem('chatHistory');
    if (savedConversations) {
      setConversations(JSON.parse(savedConversations));
    }
  }, []);

  useEffect(() => {
    if (conversations.length > 0) {
      localStorage.setItem('chatHistory', JSON.stringify(conversations));
    }
  }, [conversations]);

  const activeConversation = conversations.find(c => c.id === activeChatId);

  const createNewChat = (pdfFile?: { name: string, dataUri: string }) => {
    const newId = nanoid();
    const newConversation: Conversation = {
      id: newId,
      title: pdfFile ? `Chat with ${pdfFile.name}` : 'New Chat',
      messages: [],
      ...(pdfFile && { pdfFile })
    };
    if (pdfFile) {
        const initialMessage: Message = {
            role: 'assistant',
            content: `I've analyzed "${pdfFile.name}". What would you like me to do with this document?`,
            id: Date.now()
        };
        newConversation.messages.push(initialMessage);
    }
    setConversations(prev => [newConversation, ...prev]);
    setActiveChatId(newId);
    return newId;
  };
  
  const handleFileChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && (file.type === 'application/pdf' || file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUri = e.target?.result as string;
        createNewChat({ name: file.name, dataUri });
      };
      reader.onerror = () => {
        toast({
          variant: "destructive",
          title: "File Read Error",
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
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [toast]);

  const handleSendMessage = async (message: string) => {
    let currentChatId = activeChatId;

    if (!currentChatId) {
      currentChatId = createNewChat();
    }
    
    const userMessage: Message = { role: 'user', content: message, id: Date.now() };

    setConversations(prev => prev.map(conv => {
      if (conv.id === currentChatId) {
        const updatedMessages = [...conv.messages, userMessage];
        // Update title for new chats
        const newTitle = conv.title === 'New Chat' ? message.substring(0, 30) : conv.title;
        return { ...conv, messages: updatedMessages, title: newTitle };
      }
      return conv;
    }));
    
    setIsLoading(true);
    
    const currentConversation = conversations.find(c => c.id === currentChatId) || {
        id: currentChatId,
        messages: [userMessage],
        title: message.substring(0,30),
    };


    try {
      const response = await answerQuestionsFromPdf({
        question: message,
        pdfDataUri: currentConversation.pdfFile?.dataUri,
      });

      const aiMessage: Message = {
        role: 'assistant',
        content: response.answer,
        source: response.source?.replace('ExamplePDF.pdf', currentConversation.pdfFile?.name ?? "General Knowledge"),
        id: Date.now(),
      };
      
      setConversations(prev => prev.map(conv => 
        conv.id === currentChatId ? { ...conv, messages: [...conv.messages, aiMessage] } : conv
      ));

    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "AI Error",
        description: "Could not get a response from the AI. Please try again.",
      });
      // Remove the optimistic user message on error
      setConversations(prev => prev.map(conv => {
          if (conv.id === currentChatId) {
              return { ...conv, messages: conv.messages.slice(0, -1) };
          }
          return conv;
      }));

    } finally {
      setIsLoading(false);
    }
  };

  const deleteChat = (chatId: string) => {
    setConversations(prev => prev.filter(c => c.id !== chatId));
    if (activeChatId === chatId) {
        setActiveChatId(null);
    }
  };

  const clearAllChats = () => {
    setConversations([]);
    setActiveChatId(null);
    localStorage.removeItem('chatHistory');
  }

  return (
    <SidebarProvider>
      <div className="flex flex-col h-screen bg-background text-foreground">
        <header className="flex items-center justify-between p-2 border-b shrink-0">
          <div className="flex items-center gap-2">
            <SidebarTrigger />
            <h1 className="text-2xl font-bold font-headline">FarmSenseChat</h1>
          </div>
        </header>
        <div className="flex flex-1 overflow-hidden">
          <Sidebar>
            <SidebarHeader>
              <Button onClick={() => createNewChat()}>New Chat</Button>
            </SidebarHeader>
            <SidebarContent className="p-0">
              <ChatHistory 
                conversations={conversations} 
                activeChatId={activeChatId}
                setActiveChatId={setActiveChatId}
                deleteChat={deleteChat}
                clearAllChats={clearAllChats}
              />
            </SidebarContent>
          </Sidebar>
          <SidebarInset className="max-h-full">
            {activeConversation ? (
              <ChatInterface
                key={activeConversation.id}
                messages={activeConversation.messages}
                isLoading={isLoading}
                onSendMessage={handleSendMessage}
                onFileChange={handleFileChange}
                fileInputRef={fileInputRef}
              />
            ) : (
                <EmptyChatScreen 
                    onSendMessage={handleSendMessage} 
                    onFileChange={handleFileChange} 
                    fileInputRef={fileInputRef} 
                    isLoading={isLoading}
                />
            )}
          </SidebarInset>
        </div>
      </div>
    </SidebarProvider>
  );
}
