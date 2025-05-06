import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

interface Message {
  id: string;
  content: string;
  sender: "user" | "ai";
  timestamp: Date;
}

interface MessageListProps {
  messages?: Message[];
  isLoading?: boolean;
}

const MessageList = ({
  messages = [],
  isLoading = false,
}: MessageListProps) => {
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    // Scroll to bottom when messages change
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex flex-col h-full overflow-y-auto p-4 bg-gray-50">
      {messages.length === 0 && !isLoading ? (
        <div className="flex flex-col items-center justify-center h-full text-center">
          <h3 className="text-lg font-medium text-gray-500">No messages yet</h3>
          <p className="text-sm text-gray-400 mt-2">
            Start a conversation by sending a message below
          </p>
        </div>
      ) : (
        <div className="flex flex-col space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] rounded-lg p-4 ${
                  message.sender === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-foreground"
                }`}
              >
                <p className="whitespace-pre-wrap break-words">
                  {message.content}
                </p>
                <div className="text-xs mt-1 opacity-70">
                  {message.timestamp.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="max-w-[80%] rounded-lg p-4 bg-muted">
                <div className="flex items-center space-x-2">
                  <div
                    className="h-2 w-2 bg-gray-400 rounded-full animate-bounce"
                    style={{ animationDelay: "0ms" }}
                  />
                  <div
                    className="h-2 w-2 bg-gray-400 rounded-full animate-bounce"
                    style={{ animationDelay: "300ms" }}
                  />
                  <div
                    className="h-2 w-2 bg-gray-400 rounded-full animate-bounce"
                    style={{ animationDelay: "600ms" }}
                  />
                </div>
                <Skeleton className="h-4 w-[200px] mt-2" />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      )}
    </div>
  );
};

export default MessageList;
