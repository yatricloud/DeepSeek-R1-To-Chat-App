import React from 'react';
import { MessageSquare, Zap, Shield } from 'lucide-react';

export const HomeContent: React.FC = () => {
  return (
    <div className="min-h-full flex flex-col items-center justify-center p-4 md:p-8">
      <img
        src="https://raw.githubusercontent.com/yatricloud/yatri-images/refs/heads/main/Logo/yatricloud-round-transparent.png"
        alt="Chat Yatri"
        className="w-16 h-16 md:w-24 md:h-24 mb-6"
      />
      <h1 className="text-2xl md:text-4xl font-bold mb-6 text-center">Hello Yatris 👋</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8 max-w-4xl w-full mb-8">
        <div className="flex flex-col items-center text-center p-4 md:p-6 bg-secondary rounded-lg">
          <MessageSquare className="w-6 h-6 md:w-8 md:h-8 text-primary mb-3" />
          <h2 className="text-base md:text-lg font-semibold mb-2">Natural Conversations</h2>
          <p className="text-sm md:text-base text-foreground/70">Engage in fluid, context-aware conversations with advanced AI</p>
        </div>
        
        <div className="flex flex-col items-center text-center p-4 md:p-6 bg-secondary rounded-lg">
          <Zap className="w-6 h-6 md:w-8 md:h-8 text-primary mb-3" />
          <h2 className="text-base md:text-lg font-semibold mb-2">Lightning Fast</h2>
          <p className="text-sm md:text-base text-foreground/70">Get instant responses powered by cutting-edge technology</p>
        </div>
        
        <div className="flex flex-col items-center text-center p-4 md:p-6 bg-secondary rounded-lg">
          <Shield className="w-6 h-6 md:w-8 md:h-8 text-primary mb-3" />
          <h2 className="text-base md:text-lg font-semibold mb-2">Secure & Private</h2>
          <p className="text-sm md:text-base text-foreground/70">Your conversations are protected with enterprise-grade security</p>
        </div>
      </div>

      <p className="text-sm md:text-base text-center text-foreground/60 max-w-sm md:max-w-2xl px-4">
        Start a new chat by clicking the "New chat" button in the sidebar. 
        Chat Yatri is ready to assist you with any questions or tasks you have.
      </p>
    </div>
  );
};