"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Loader2, Compass, Bot, User, BrainCircuit } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function GuidanceAgentPage() {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Hello! I am your AI Career Guidance Agent. I have analyzed your uploaded resumes, your past mock interview performances, and market intelligence data.\n\nHow can I help you today? You can ask me to build a study plan, review your weaknesses, or suggest the best next steps for your career."
    }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = { role: "user", content: input.trim() };
    const newMessages = [...messages, userMessage];
    
    setMessages(newMessages);
    setInput("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/guidance/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages }),
      });

      if (!res.ok) {
        throw new Error("Failed to communicate with Guidance Agent");
      }

      const data = await res.json();
      setMessages(prev => [...prev, data.message]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [
        ...prev,
        { role: "assistant", content: "**Error:** I'm having trouble connecting to my database right now. Please try again later." }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-6rem)] flex flex-col pb-6">
      
      {/* Header */}
      <div className="flex items-center gap-4 mb-6 shrink-0">
        <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
          <BrainCircuit className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="font-heading text-2xl font-bold text-primary-text">AI Guidance Agent</h1>
          <p className="text-secondary-text text-sm">
            Your personalized career coach powered by your historical data.
          </p>
        </div>
      </div>

      {/* Chat Container */}
      <div className="flex-1 bg-surface border border-border rounded-2xl shadow-sm overflow-hidden flex flex-col relative">
        
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <AnimatePresence initial={false}>
            {messages.map((msg, idx) => {
              const isAI = msg.role === "assistant";
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex gap-4 max-w-[85%] ${isAI ? 'mr-auto' : 'ml-auto flex-row-reverse'}`}
                >
                  <div className={`w-8 h-8 shrink-0 rounded-full flex items-center justify-center ${
                    isAI ? 'bg-indigo-500/20 text-indigo-500' : 'bg-secondary/20 text-secondary'
                  }`}>
                    {isAI ? <Compass className="w-4 h-4" /> : <User className="w-4 h-4" />}
                  </div>
                  
                  <div className={`p-4 rounded-2xl text-sm leading-relaxed shadow-sm ${
                    isAI 
                      ? 'bg-background border border-border text-primary-text rounded-tl-sm prose prose-sm dark:prose-invert max-w-none' 
                      : 'bg-primary text-white rounded-tr-sm'
                  }`}>
                    {isAI ? (
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {msg.content}
                      </ReactMarkdown>
                    ) : (
                      msg.content
                    )}
                  </div>
                </motion.div>
              );
            })}

            {isLoading && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex gap-4 max-w-[85%] mr-auto"
              >
                <div className="w-8 h-8 shrink-0 rounded-full bg-indigo-500/20 text-indigo-500 flex items-center justify-center">
                  <Compass className="w-4 h-4" />
                </div>
                <div className="p-4 rounded-2xl bg-background border border-border rounded-tl-sm flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-indigo-500/50 animate-bounce" style={{ animationDelay: "0ms" }}></span>
                  <span className="w-2 h-2 rounded-full bg-indigo-500/50 animate-bounce" style={{ animationDelay: "150ms" }}></span>
                  <span className="w-2 h-2 rounded-full bg-indigo-500/50 animate-bounce" style={{ animationDelay: "300ms" }}></span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-background border-t border-border">
          <form onSubmit={handleSendMessage} className="flex items-end gap-3">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage(e);
                }
              }}
              placeholder="Ask for a study plan, interview review, or career advice..."
              className="flex-1 max-h-32 min-h-[50px] resize-none bg-surface border border-border rounded-button py-3 px-4 text-primary-text text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
              rows={1}
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="p-3 shrink-0 bg-indigo-500 text-white rounded-button hover:bg-indigo-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
            </button>
          </form>
          <div className="text-center mt-2">
            <p className="text-xs text-muted">The agent has full access to your resumes and interview history.</p>
          </div>
        </div>

      </div>
    </div>
  );
}
