import React, { useState } from 'react';
import { UserCircle, Copy, Download } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Message } from '../types';
import { Toast } from './Toast';

interface ChatMessageProps {
  message: Message;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isUser = message.role === 'user';
  const [toast, setToast] = useState<string | null>(null);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content.trimStart());
      setToast('Message copied to clipboard!');
    } catch (error) {
      console.error('Failed to copy message:', error);
    }
  };

  const handleDownload = () => {
    try {
      const blob = new Blob([message.content.trimStart()], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `message-${message.timestamp}.md`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setToast('Message downloaded successfully!');
    } catch (error) {
      console.error('Failed to download message:', error);
    }
  };

  return (
    <>
      <div className={`${isUser ? 'bg-background' : 'bg-secondary'} group relative`}>
        <div className="flex gap-4 p-6">
          <div className="flex-shrink-0">
            {isUser ? (
              <UserCircle className="w-6 h-6 text-foreground/80" />
            ) : (
              <img
                src="https://raw.githubusercontent.com/yatricloud/yatri-images/refs/heads/main/Logo/yatricloud-round-transparent.png"
                alt="Yatri"
                className="w-6 h-6"
              />
            )}
          </div>
          <div className="flex-1 prose prose-invert relative">
            <ReactMarkdown>{message.content}</ReactMarkdown>
            <div className="absolute bottom-0 right-0 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={handleCopy}
                className="p-1 hover:bg-secondary-hover rounded transition-colors"
                title="Copy message"
              >
                <Copy className="w-4 h-4" />
              </button>
              <button
                onClick={handleDownload}
                className="p-1 hover:bg-secondary-hover rounded transition-colors"
                title="Download as Markdown"
              >
                <Download className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </>
  );
};