
"use client"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { SidebarFooter, SidebarMenu, SidebarMenuItem, SidebarMenuButton } from "@/components/ui/sidebar";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { MessageSquare, Plus, Trash2 } from "lucide-react";
import { Conversation } from "@/app/page";

interface ChatHistoryProps {
  conversations: Conversation[];
  activeChatId: string | null;
  setActiveChatId: (id: string) => void;
  deleteChat: (id: string) => void;
  clearAllChats: () => void;
}

export function ChatHistory({ conversations, activeChatId, setActiveChatId, deleteChat, clearAllChats }: ChatHistoryProps) {
  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto">
        <SidebarMenu>
          {conversations.map((chat) => (
            <SidebarMenuItem key={chat.id} className="relative">
              <SidebarMenuButton
                variant="ghost"
                onClick={() => setActiveChatId(chat.id)}
                isActive={activeChatId === chat.id}
                className="w-full justify-start"
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                <span className="truncate">{chat.title}</span>
              </SidebarMenuButton>
              {activeChatId === chat.id && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                    onClick={(e) => {
                        e.stopPropagation();
                        deleteChat(chat.id);
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
              )}
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </div>
      <SidebarFooter>
         <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button variant="ghost" className="w-full justify-start">
                    <Trash2 className="w-4 h-4 mr-2" />
                    Clear history
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete your chat history and remove your data from our servers.
                </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={clearAllChats}>
                    Continue
                </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
      </SidebarFooter>
    </div>
  );
}
