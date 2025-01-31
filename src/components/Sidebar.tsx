import React from 'react';
import { Plus, MessageSquare, Github, Trash2, History } from 'lucide-react';
import { cn } from '../utils/cn';

interface SidebarProps {
  conversations: Array<{ id: string; preview: string }>;
  activeConversation: string | null;
  onNewChat: () => void;
  onSelectChat: (id: string) => void;
  onDeleteChat: (id: string) => void;
  onClearHistory: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  conversations,
  activeConversation,
  onNewChat,
  onSelectChat,
  onDeleteChat,
  onClearHistory,
}) => {
  return (
    <div className="h-full bg-sidebar border-r border-border flex flex-col">
      <button
        onClick={onNewChat}
        className="m-4 p-2 flex items-center justify-center gap-2 bg-primary hover:bg-primary-hover text-white rounded-lg transition-colors"
      >
        <Plus className="w-4 h-4" />
        New chat
      </button>

      <div className="flex-1 overflow-y-auto">
        {conversations.map((chat) => (
          <div
            key={chat.id}
            className={cn(
              "w-full p-3 text-left hover:bg-secondary-hover flex items-center gap-2 group",
              activeConversation === chat.id && "bg-secondary"
            )}
          >
            <div
              className="flex items-center gap-2 flex-1 cursor-pointer"
              onClick={() => onSelectChat(chat.id)}
            >
              <MessageSquare className="w-4 h-4 flex-shrink-0" />
              <span className="truncate text-sm">{chat.preview}</span>
            </div>
            <button
              onClick={() => onDeleteChat(chat.id)}
              className="opacity-0 group-hover:opacity-100 hover:text-red-400 transition-opacity"
              aria-label="Delete conversation"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      <div className="p-4 border-t border-border flex flex-col gap-2">
        <button
          onClick={onClearHistory}
          className="w-full p-2 flex items-center gap-2 hover:bg-secondary rounded-lg transition-colors text-red-400 hover:text-red-500"
        >
          <History className="w-4 h-4" />
          <span>Clear History</span>
        </button>
        <a
          href="https://github.com/yatricloud/DeepSeek-R1-To-Chat-App/"
          target="_blank"
          rel="noopener noreferrer"
          className="w-full p-2 flex items-center gap-2 hover:bg-secondary rounded-lg transition-colors"
        >
          <Github className="w-4 h-4" />
          <span>Contribute on GitHub</span>
        </a>
      </div>
    </div>
  );
}