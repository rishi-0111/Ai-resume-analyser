import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Mic, MicOff, StopCircle, User, Bot, Loader2, Volume2, VolumeX } from "lucide-react";

export default function ChatRoom({ messages, onSendMessage, onEndInterview, isGenerating, forceVoiceMode = false, interviewerPersona = "Male" }) {
  const [input, setInput] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isVoiceMode, setIsVoiceMode] = useState(forceVoiceMode);
  const [elapsedTime, setElapsedTime] = useState(0);
  const messagesEndRef = useRef(null);
  const silenceTimerRef = useRef(null);

  // Timer Effect
  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedTime(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isGenerating]);

  // Handle Speech Recognition (Web Speech API)
  const initialInputRef = useRef("");

  useEffect(() => {
    let recognition = null;
    let finalTranscript = "";

    if (isListening) {
      finalTranscript = input; // start with existing text
      
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US'; // explicitly set language to improve accuracy
        
        recognition.onresult = (event) => {
          let interimTranscript = "";
          let newFinalTranscript = "";
          
          // Only process NEW results starting from resultIndex
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
              newFinalTranscript += event.results[i][0].transcript;
            } else {
              interimTranscript += event.results[i][0].transcript;
            }
          }
          
          // If we got final words, lock them in
          if (newFinalTranscript) {
             finalTranscript = (finalTranscript + " " + newFinalTranscript).trim();
          }
          
          // Display the locked-in words plus whatever it's currently guessing
          setInput((finalTranscript + " " + interimTranscript).trim());
        };

        recognition.onend = () => {
          if (isListening) {
            // The browser paused processing. We restart it. 
            // `finalTranscript` is already accurately tracking the final words.
            // When start() is called, event.resultIndex will reset for the new session.
            recognition.start();
          }
        };

        recognition.start();
      } else {
        alert("Speech Recognition is not supported in this browser.");
        setIsListening(false);
      }
    }
    return () => {
      if (recognition) {
        recognition.onend = null;
        recognition.stop();
      }
    };
  }, [isListening]);

  // Handle Text-to-Speech for AI responses
  useEffect(() => {
    // Only trigger when NOT generating (i.e., when AI response is fully finished)
    // and when there are messages
    if (!isVoiceMode || isGenerating || messages.length === 0) return;
    
    const lastMessage = messages[messages.length - 1];
    
    // If the last message is from the assistant, speak it
    if (lastMessage.role === 'assistant') {
      const synth = window.speechSynthesis;
      synth.cancel(); // Stop anything currently playing
      
      const utterance = new SpeechSynthesisUtterance(lastMessage.content);
      
      // Voice Selection
      const voices = synth.getVoices();
      if (voices.length > 0) {
        let selectedVoice = null;
        const maleKeywords = ['david', 'mark', 'daniel', 'alex', 'male', 'guy', 'arthur', 'aaron'];
        const femaleKeywords = ['zira', 'hazel', 'samantha', 'victoria', 'female', 'girl', 'catherine', 'karen', 'moira', 'tessa'];
        
        if (interviewerPersona === 'Female') {
          selectedVoice = voices.find(v => femaleKeywords.some(k => v.name.toLowerCase().includes(k))) || voices.find(v => v.name.toLowerCase().includes('female'));
        } else {
          selectedVoice = voices.find(v => maleKeywords.some(k => v.name.toLowerCase().includes(k))) || voices.find(v => v.name.toLowerCase().includes('male'));
        }
        
        // Fallback to first available English voice if no specific match
        if (!selectedVoice) {
          selectedVoice = voices.find(v => v.lang.startsWith('en')) || voices[0];
        }
        
        if (selectedVoice) {
          utterance.voice = selectedVoice;
        }
      }
      
      utterance.onend = () => {
        // When AI finishes speaking, automatically turn on the microphone
        if (isVoiceMode) {
          setIsListening(true);
        }
      };
      
      utterance.onerror = (e) => {
        console.error("SpeechSynthesis error", e);
        if (isVoiceMode) setIsListening(true);
      };
      
      // Slight delay to ensure UI updates smoothly before TTS blocks thread
      setTimeout(() => {
        try {
          synth.speak(utterance);
        } catch (e) {
          console.error("Speak failed", e);
        }
      }, 300);
    }
    
    return () => {
      // Cleanup on unmount or mode switch
      window.speechSynthesis.cancel();
    };
  }, [messages, isGenerating, isVoiceMode, interviewerPersona]);

  // Clean up speech synthesis when component unmounts
  useEffect(() => {
    return () => {
      window.speechSynthesis.cancel();
    };
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim() || isGenerating) return;
    
    if (isListening) setIsListening(false);
    
    onSendMessage(input.trim());
    setInput("");
  };

  const visibleMessages = messages.filter(m => m.role !== 'system');

  return (
    <div className="flex flex-col min-h-[450px] h-[calc(100vh-180px)] md:h-[75vh] bg-surface border border-border rounded-card shadow-sm overflow-hidden relative">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border bg-background">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center relative">
            <Bot className="w-5 h-5 text-primary" />
            {isGenerating && (
              <span className="absolute -bottom-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
              </span>
            )}
          </div>
          <div>
            <h3 className="font-heading font-semibold text-primary-text text-sm flex items-center gap-2">
              AI Interviewer
              <span className="text-xs font-mono bg-surface border border-border px-2 py-0.5 rounded text-muted">
                {formatTime(elapsedTime)}
              </span>
              {!forceVoiceMode && (
                <button 
                  onClick={() => setIsVoiceMode(!isVoiceMode)}
                  className={`p-1 rounded-md transition-colors ${isVoiceMode ? 'bg-primary/20 text-primary' : 'bg-surface border border-border text-muted hover:text-primary'}`}
                  title="Toggle Voice Mode (Live Conversation)"
                >
                  {isVoiceMode ? <Volume2 className="w-3 h-3" /> : <VolumeX className="w-3 h-3" />}
                </button>
              )}
            </h3>
            <p className="text-xs text-secondary-text">
              {isGenerating ? "Typing..." : "Online"}
            </p>
          </div>
        </div>
        <button
          onClick={() => {
            window.speechSynthesis.cancel();
            onEndInterview();
          }}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-danger border border-danger/30 hover:bg-danger/10 rounded-button transition-colors"
        >
          <StopCircle className="w-4 h-4" />
          End Interview
        </button>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
        <AnimatePresence initial={false}>
          {visibleMessages.map((msg, idx) => {
            const isAI = msg.role === "assistant";
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex gap-4 max-w-[85%] ${isAI ? 'mr-auto' : 'ml-auto flex-row-reverse'}`}
              >
                <div className={`w-8 h-8 shrink-0 rounded-full flex items-center justify-center ${isAI ? 'bg-primary/20 text-primary' : 'bg-secondary/20 text-secondary'}`}>
                  {isAI ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                </div>
                <div className={`p-4 rounded-2xl text-sm leading-relaxed shadow-sm ${
                  isAI 
                    ? 'bg-background border border-border text-primary-text rounded-tl-sm' 
                    : 'bg-primary text-white rounded-tr-sm'
                }`}>
                  {msg.content}
                </div>
              </motion.div>
            );
          })}
          
          {isGenerating && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex gap-4 max-w-[85%] mr-auto"
            >
              <div className="w-8 h-8 shrink-0 rounded-full bg-primary/20 text-primary flex items-center justify-center">
                <Bot className="w-4 h-4" />
              </div>
              <div className="p-4 rounded-2xl bg-background border border-border rounded-tl-sm flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-primary/50 animate-bounce" style={{ animationDelay: "0ms" }}></span>
                <span className="w-2 h-2 rounded-full bg-primary/50 animate-bounce" style={{ animationDelay: "150ms" }}></span>
                <span className="w-2 h-2 rounded-full bg-primary/50 animate-bounce" style={{ animationDelay: "300ms" }}></span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-background border-t border-border">
        <form id="chat-form" onSubmit={handleSubmit} className="flex items-end gap-3">
          <button
            type="button"
            onClick={() => setIsListening(!isListening)}
            className={`p-3 shrink-0 rounded-button transition-colors ${
              isListening ? 'bg-danger/20 text-danger animate-pulse' : 'bg-surface border border-border text-muted hover:text-primary'
            }`}
          >
            {isListening ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
          </button>
          
          <textarea
            id="chat-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
            placeholder="Type your answer... (Press Enter to send)"
            className="flex-1 max-h-32 min-h-[50px] resize-none bg-surface border border-border rounded-button py-3 px-4 text-primary-text text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
            rows={1}
          />

          <button
            type="submit"
            disabled={!input.trim() || isGenerating}
            className="p-3 shrink-0 bg-primary text-white rounded-button hover:bg-accent transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
          </button>
        </form>
        <div className="text-center mt-2">
          <p className="text-xs text-muted">Use shift+Enter for a new line.</p>
        </div>
      </div>
    </div>
  );
}
