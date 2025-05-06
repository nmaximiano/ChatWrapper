import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Send, Loader2 } from "lucide-react";
import { useAuth } from "../../../supabase/auth";
import { supabase } from "../../../supabase/supabase";

interface Message {
  id: string;
  content: string;
  role: "user" | "assistant";
  timestamp: Date;
}

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    // Generate a unique ID for the message
    const messageId = crypto.randomUUID();

    // Add user message to chat
    const userMessage: Message = {
      id: messageId,
      content: input,
      role: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      // Call the OpenAI edge function
      const { data, error } = await supabase.functions.invoke(
        "supabase-functions-chat",
        {
          body: {
            message: input,
            userId: user?.id || "anonymous",
          },
        },
      );

      if (error) throw error;

      // Add AI response to chat
      const aiMessage: Message = {
        id: crypto.randomUUID(),
        content: data.message || "I'm sorry, I couldn't process your request.",
        role: "assistant",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error("Error calling OpenAI API:", error);

      // Add error message
      const errorMessage: Message = {
        id: crypto.randomUUID(),
        content:
          "Sorry, there was an error processing your request. Please try again later.",
        role: "assistant",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] max-w-3xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Chat header */}
      <div className="bg-black text-white p-4 flex items-center">
        <Avatar className="h-8 w-8 mr-2">
          <AvatarImage
            src="https://api.dicebear.com/7.x/bottts/svg?seed=ai-assistant"
            alt="AI Assistant"
          />
          <AvatarFallback>AI</AvatarFallback>
        </Avatar>
        <h2 className="font-semibold">AI Assistant</h2>
      </div>

      {/* Messages container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-500">
            <p>Send a message to start chatting with the AI assistant.</p>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] rounded-lg p-3 ${
                  message.role === "user"
                    ? "bg-black text-white rounded-br-none"
                    : "bg-gray-200 text-gray-800 rounded-bl-none"
                }`}
              >
                {message.content}
              </div>
            </div>
          ))
        )}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-200 text-gray-800 rounded-lg rounded-bl-none p-3 flex items-center space-x-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Thinking...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className="border-t border-gray-200 p-4 bg-white">
        <div className="flex space-x-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your message here..."
            className="flex-1 resize-none"
            rows={1}
            disabled={isLoading}
          />
          <Button
            onClick={handleSendMessage}
            disabled={!input.trim() || isLoading}
            className="bg-black text-white hover:bg-gray-800"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
