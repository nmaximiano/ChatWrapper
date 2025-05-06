import React, { useState, useEffect, useRef } from "react";
import MessageList from "./MessageList";
import MessageInput from "./MessageInput";

interface Message {
  id: string;
  content: string;
  sender: "user" | "ai";
  timestamp: Date;
}

const ChatInterface: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Function to generate a unique ID for messages
  const generateId = () => {
    return (
      Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15)
    );
  };

  // Function to handle sending a message
  const handleSendMessage = async (content: string) => {
    if (!content.trim()) return;

    // Add user message to the chat
    const userMessage: Message = {
      id: generateId(),
      content,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prevMessages) => [...prevMessages, userMessage]);
    setIsLoading(true);

    try {
      // Simulate API call to OpenAI
      // In a real implementation, this would be an actual API call
      setTimeout(() => {
        const aiResponse: Message = {
          id: generateId(),
          content: `This is a simulated AI response to: "${content}". In a real implementation, this would come from the OpenAI API.`,
          sender: "ai",
          timestamp: new Date(),
        };

        setMessages((prevMessages) => [...prevMessages, aiResponse]);
        setIsLoading(false);
      }, 1500);
    } catch (error) {
      console.error("Error getting AI response:", error);
      setIsLoading(false);

      // Add error message
      const errorMessage: Message = {
        id: generateId(),
        content:
          "Sorry, there was an error processing your request. Please try again.",
        sender: "ai",
        timestamp: new Date(),
      };

      setMessages((prevMessages) => [...prevMessages, errorMessage]);
    }
  };

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex flex-col h-screen bg-background">
      <div className="flex-none p-4 border-b bg-card">
        <h1 className="text-xl font-bold text-center">AI Chat Assistant</h1>
      </div>

      <div className="flex-grow overflow-hidden relative">
        <MessageList messages={messages} isLoading={isLoading} />
        <div ref={messagesEndRef} />
      </div>

      <div className="flex-none p-4 border-t bg-card">
        <MessageInput onSendMessage={handleSendMessage} isLoading={isLoading} />
      </div>
    </div>
  );
};

export default ChatInterface;
