import React, { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Send, Square, ChevronDown } from 'lucide-react';
import { ChatMessage } from './components/ChatMessage';
import { Sidebar } from './components/Sidebar';
import { Message, ChatState } from './types';
import { HomeContent } from './components/HomeContent';
import { ThemeToggle } from './components/ThemeToggle';

interface ConversationData {
  id: string;
  preview: string;
  messages: Message[];
}

function App() {
  const [conversations, setConversations] = useState<ConversationData[]>([]);
  const [activeConversation, setActiveConversation] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [input, setInput] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'light';
  });
  const [abortController, setAbortController] = useState<AbortController | null>(null);
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
      setShouldAutoScroll(true);
    }
  };

  useEffect(() => {
    if (isLoading && shouldAutoScroll) {
      scrollToBottom();
    }
  }, [conversations, isLoading, shouldAutoScroll]);

  const handleScroll = () => {
    if (messagesContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
      const isAtBottom = scrollHeight - scrollTop - clientHeight < 100;
      const shouldShowButton = !isAtBottom && scrollHeight > clientHeight;
      
      setShouldAutoScroll(isAtBottom);
      setShowScrollButton(shouldShowButton);
    }
  };

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const handleNewChat = () => {
    const newId = Date.now().toString();
    const newConversation: ConversationData = {
      id: newId,
      preview: 'New conversation',
      messages: []
    };
    setConversations(prev => [newConversation, ...prev]);
    setActiveConversation(newId);
  };

  const handleDeleteChat = (id: string) => {
    setConversations(prev => prev.filter(conv => conv.id !== id));
    if (activeConversation === id) {
      setActiveConversation(null);
    }
  };

  const handleClearHistory = () => {
    if (window.confirm('Are you sure you want to clear all chat history? This action cannot be undone.')) {
      setConversations([]);
      setActiveConversation(null);
    }
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(prev => !prev);
  };

  const getCurrentMessages = () => {
    if (!activeConversation) return [];
    const conversation = conversations.find(conv => conv.id === activeConversation);
    return conversation?.messages || [];
  };

  const handleStopGeneration = () => {
    if (abortController) {
      abortController.abort();
      setIsLoading(false);
      setAbortController(null);
    }
  };

  const updateConversationContent = (conversationId: string, messageId: string, chunk: string) => {
    setConversations(prev => {
      const newConversations = prev.map(conv => {
        if (conv.id !== conversationId) return conv;
        
        return {
          ...conv,
          messages: conv.messages.map(msg => {
            if (msg.id !== messageId) return msg;
            return { ...msg, content: msg.content + chunk };
          })
        };
      });
      return newConversations;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: input,
      role: 'user',
      timestamp: Date.now()
    };

    const assistantMessage: Message = {
      id: (Date.now() + 1).toString(),
      content: '',
      role: 'assistant',
      timestamp: Date.now() + 1
    };

    let currentConversationId = activeConversation;
    
    if (!currentConversationId) {
      currentConversationId = Date.now().toString();
      const newConversation: ConversationData = {
        id: currentConversationId,
        preview: input.slice(0, 30) + (input.length > 30 ? '...' : ''),
        messages: [userMessage, assistantMessage]
      };
      setConversations(prev => [newConversation, ...prev]);
      setActiveConversation(currentConversationId);
    } else {
      setConversations(prev =>
        prev.map(conv =>
          conv.id === currentConversationId
            ? {
                ...conv,
                preview: input.slice(0, 30) + (input.length > 30 ? '...' : ''),
                messages: [...conv.messages, userMessage, assistantMessage]
              }
            : conv
        )
      );
    }

    setInput('');
    setIsLoading(true);
    setShouldAutoScroll(true);

    const controller = new AbortController();
    setAbortController(controller);

    try {
      const response = await fetch('https://chat.yatricloud.com/api/chat/stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: input }),
        signal: controller.signal,
      });

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No response body');
      }

      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') {
              setIsLoading(false);
              setAbortController(null);
              continue;
            }

            try {
              const parsed = JSON.parse(data);
              if (parsed.chunk) {
                setConversations(prev =>
                  prev.map(conv =>
                    conv.id === currentConversationId
                      ? {
                          ...conv,
                          messages: conv.messages.map(msg =>
                            msg.id === assistantMessage.id
                              ? { ...msg, content: msg.content + parsed.chunk }
                              : msg
                          )
                        }
                      : conv
                  )
                );
              }
            } catch (e) {
              console.error('Failed to parse chunk:', e);
            }
          }
        }
      }

    } catch (error) {
      if (error.name === 'AbortError') {
        console.log('Request aborted');
      } else {
        console.error('Error:', error);
        setConversations(prev =>
          prev.map(conv =>
            conv.id === currentConversationId
              ? {
                  ...conv,
                  messages: conv.messages.map(msg =>
                    msg.id === assistantMessage.id
                      ? { ...msg, content: 'Error: Failed to get response from server.' }
                      : msg
                  )
                }
              : conv
          )
        );
      }
      setIsLoading(false);
      setAbortController(null);
    }
  };

  return (
    <div className="flex h-screen bg-background relative">
      {/* Sidebar with overlay for mobile */}
      <div 
        className={`fixed md:relative z-50 transition-transform duration-300 ease-in-out ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
        style={{ width: '16rem' }}
      >
        <Sidebar
          conversations={conversations.map(({ id, preview }) => ({ id, preview }))}
          activeConversation={activeConversation}
          onNewChat={handleNewChat}
          onSelectChat={setActiveConversation}
          onDeleteChat={handleDeleteChat}
          onClearHistory={handleClearHistory}
        />
      </div>

      {/* Overlay for mobile */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <div className="flex-1 flex flex-col min-w-0 relative">
        <header className="sticky top-0 z-30 border-b border-border p-4 flex items-center bg-background">
          <button
            onClick={toggleSidebar}
            className="p-2 hover:bg-secondary rounded-lg transition-colors md:hidden"
            aria-label={isSidebarOpen ? 'Close sidebar' : 'Open sidebar'}
          >
            {isSidebarOpen ? (
              <ChevronLeft className="w-5 h-5 text-foreground" />
            ) : (
              <ChevronRight className="w-5 h-5 text-foreground" />
            )}
          </button>
          <div className="flex items-center gap-2 flex-1 justify-center">
            <img
              src="https://raw.githubusercontent.com/yatricloud/yatri-images/refs/heads/main/Logo/yatricloud-round-transparent.png"
              alt="Chat Yatri"
              className="w-8 h-8"
            />
            <h1 className="text-xl font-semibold">DeppSeek-R1 + Chat Yatri</h1>
          </div>
          <div className="ml-2">
            <ThemeToggle theme={theme} onToggle={toggleTheme} />
          </div>
        </header>

        <div 
          ref={messagesContainerRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto"
        >
          {getCurrentMessages().length === 0 ? (
            <HomeContent />
          ) : (
            <div className="divide-y divide-border">
              {getCurrentMessages().map((message) => (
                <ChatMessage key={message.id} message={message} />
              ))}
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {showScrollButton && (
          <button
            onClick={scrollToBottom}
            className="fixed bottom-24 right-4 p-2 bg-primary text-white rounded-full shadow-lg hover:bg-primary-hover transition-colors z-20"
            aria-label="Scroll to bottom"
          >
            <ChevronDown className="w-5 h-5" />
          </button>
        )}

        <form 
          onSubmit={handleSubmit} 
          className="sticky bottom-0 border-t border-border p-4 bg-background z-30"
        >
          <div className="flex gap-4 max-w-4xl mx-auto">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 p-2 bg-secondary border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent text-foreground placeholder-foreground/60"
              disabled={isLoading}
            />
            <button
              type={isLoading ? 'button' : 'submit'}
              onClick={isLoading ? handleStopGeneration : undefined}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover disabled:bg-secondary disabled:text-foreground/60 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? (
                <Square className="w-5 h-5" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default App;
