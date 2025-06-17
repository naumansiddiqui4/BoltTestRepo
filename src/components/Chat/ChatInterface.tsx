import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Bot, User } from 'lucide-react';
import { ChatMessage } from '../../types';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import Button from '../ui/Button';

interface ChatInterfaceProps {
  messages: ChatMessage[];
  onSendMessage: (message: string) => void;
  isLoading: boolean;
}

export default function ChatInterface({ messages, onSendMessage, isLoading }: ChatInterfaceProps) {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      onSendMessage(input.trim());
      setInput('');
    }
  };

  return (
    <Card variant="glass" className="h-96 flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Bot className="w-5 h-5 text-purple-600" />
          <span>AI Assistant</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col space-y-4">
        <div className="flex-1 overflow-y-auto space-y-3 pr-2">
          <AnimatePresence>
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className={`flex space-x-3 ${
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {message.role === 'assistant' && (
                  <div className="bg-gradient-to-br from-purple-500 to-indigo-600 p-2 rounded-full flex-shrink-0">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                )}
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    message.role === 'user'
                      ? 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  <p className="text-sm">{message.content}</p>
                  {message.context?.timePosition && (
                    <p className="text-xs opacity-75 mt-1">
                      At {Math.floor(message.context.timePosition / 60)}:
                      {Math.floor(message.context.timePosition % 60).toString().padStart(2, '0')}
                    </p>
                  )}
                </div>
                {message.role === 'user' && (
                  <div className="bg-gray-300 p-2 rounded-full flex-shrink-0">
                    <User className="w-4 h-4 text-gray-600" />
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
          {isLoading && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex space-x-3"
            >
              <div className="bg-gradient-to-br from-purple-500 to-indigo-600 p-2 rounded-full">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div className="bg-gray-100 px-4 py-2 rounded-lg">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                </div>
              </div>
            </motion.div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSubmit} className="flex space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a question about the content..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            disabled={isLoading}
          />
          <Button
            type="submit"
            size="sm"
            disabled={!input.trim() || isLoading}
          >
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}