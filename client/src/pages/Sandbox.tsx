import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Volume2, Mic, RotateCcw, ArrowLeft, ChevronDown } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import { Streamdown } from "streamdown";

type Personality = "supportive_friend" | "wise_mentor" | "patient_teacher" | "devils_advocate" | "motivational_coach" | "calm_therapist";

const personalities: Record<Personality, { name: string; emoji: string }> = {
  supportive_friend: { name: "Supportive Friend", emoji: "🤝" },
  wise_mentor: { name: "Wise Mentor", emoji: "🧙" },
  patient_teacher: { name: "Patient Teacher", emoji: "👨‍🏫" },
  devils_advocate: { name: "Devil's Advocate", emoji: "😈" },
  motivational_coach: { name: "Motivational Coach", emoji: "💪" },
  calm_therapist: { name: "Calm Therapist", emoji: "🧘" },
};

interface Message {
  role: "user" | "ai";
  content: string;
  audioUrl?: string;
  expanded?: boolean;
}

export default function Sandbox() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const [selectedPersonality, setSelectedPersonality] = useState<Personality>("supportive_friend");
  const [messages, setMessages] = useState<Message[]>([]);
  const [userInput, setUserInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentAudio, setCurrentAudio] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const sandboxRespond = trpc.sandbox.respond.useMutation();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (!user) {
    navigate("/");
    return null;
  }

  const handleSendMessage = async () => {
    if (!userInput.trim()) return;

    const userMessage: Message = { role: "user", content: userInput, expanded: true };
    setMessages((prev) => [...prev, userMessage]);
    setUserInput("");
    setIsLoading(true);

    try {
      const result = await sandboxRespond.mutateAsync({
        message: userInput,
        personality: selectedPersonality,
        history: messages.map((m) => ({
          role: m.role === "user" ? "user" : "assistant",
          content: m.content,
        })),
      });

      const aiMessage: Message = {
        role: "ai",
        content: result.response,
        audioUrl: result.audioUrl,
        expanded: false,
      };

      setMessages((prev) => [...prev, aiMessage]);

      // Auto-play audio
      if (result.audioUrl) {
        setTimeout(() => {
          playAudio(result.audioUrl);
        }, 500);
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const playAudio = (audioUrl: string) => {
    if (audioRef.current) {
      audioRef.current.src = audioUrl;
      audioRef.current.play().catch((error) => {
        console.error("Error playing audio:", error);
      });
      setCurrentAudio(audioUrl);
      setIsPlaying(true);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        console.log("Audio recorded:", audioBlob);
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error("Error accessing microphone:", error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const resetConversation = () => {
    setMessages([]);
    setUserInput("");
  };

  const toggleExpanded = (idx: number) => {
    setMessages((prev) =>
      prev.map((msg, i) => (i === idx ? { ...msg, expanded: !msg.expanded } : msg))
    );
  };

  const truncateText = (text: string, lines: number = 3): { short: string; full: string; isTruncated: boolean } => {
    const lineArray = text.split("\n");
    if (lineArray.length > lines) {
      return {
        short: lineArray.slice(0, lines).join("\n"),
        full: text,
        isTruncated: true,
      };
    }
    return { short: text, full: text, isTruncated: false };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-6">
      <div className="max-w-3xl mx-auto flex flex-col h-screen">
        {/* Header with Back Button */}
        <div className="mb-6 flex items-center gap-4 flex-shrink-0">
          <Button
            onClick={() => navigate("/")}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900">Sandbox</h1>
            <p className="text-slate-600 text-sm">Practice conversations with AI personalities</p>
          </div>
        </div>

        {/* Personality Selector */}
        <div className="mb-6 flex-shrink-0">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-3">
            {Object.entries(personalities).map(([key, { name, emoji }]) => (
              <Button
                key={key}
                onClick={() => {
                  setSelectedPersonality(key as Personality);
                  resetConversation();
                }}
                variant={selectedPersonality === key ? "default" : "outline"}
                className="justify-start text-left h-auto py-2 md:py-3 text-xs md:text-sm"
              >
                <span className="text-lg md:text-2xl mr-2">{emoji}</span>
                <span className="truncate">{name}</span>
              </Button>
            ))}
          </div>
        </div>

        {/* Messages - Discussion Forum Style */}
        <div className="flex-1 overflow-y-auto mb-6 bg-white rounded-lg shadow-lg p-4 md:p-6 space-y-4">
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full text-center">
              <div>
                <p className="text-slate-500 text-base md:text-lg mb-2">Start a conversation</p>
                <p className="text-slate-400 text-xs md:text-sm">Type or speak to begin</p>
              </div>
            </div>
          ) : (
            <>
              {messages.map((msg, idx) => {
                const { short, full, isTruncated } = truncateText(msg.content);
                const isExpanded = msg.expanded ?? false;
                const displayText = isExpanded ? full : short;

                return (
                  <div
                    key={idx}
                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} gap-3`}
                  >
                    {msg.role === "ai" && (
                      <div className="text-2xl flex-shrink-0 mt-1">
                        {personalities[selectedPersonality].emoji}
                      </div>
                    )}
                    
                    <div
                      className={`max-w-xl rounded-lg px-4 py-3 ${
                        msg.role === "user"
                          ? "bg-blue-500 text-white rounded-br-none"
                          : "bg-slate-100 text-slate-900 rounded-bl-none"
                      }`}
                    >
                      <div className="text-sm md:text-base leading-relaxed whitespace-pre-wrap break-words">
                        <Streamdown>{displayText}</Streamdown>
                      </div>

                      {/* Show More / Show Less Button */}
                      {isTruncated && (
                        <button
                          onClick={() => toggleExpanded(idx)}
                          className="mt-2 text-xs font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1"
                        >
                          <ChevronDown
                            className={`w-3 h-3 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                          />
                          {isExpanded ? "Show less" : "Show more"}
                        </button>
                      )}

                      {/* Audio Controls for AI Messages */}
                      {msg.audioUrl && msg.role === "ai" && (
                        <div className="mt-3 pt-3 border-t border-slate-300">
                          <Button
                            onClick={() => playAudio(msg.audioUrl!)}
                            size="sm"
                            variant="ghost"
                            className="text-xs h-8 px-2"
                            title="Click to replay"
                          >
                            <Volume2 className="w-3 h-3 mr-1" />
                            Replay
                          </Button>
                        </div>
                      )}
                    </div>

                    {msg.role === "user" && (
                      <div className="text-2xl flex-shrink-0 mt-1">👤</div>
                    )}
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Audio Player */}
        <audio
          ref={audioRef}
          onEnded={() => setIsPlaying(false)}
          onPlay={() => setIsPlaying(true)}
          className="hidden"
        />

        {/* Input Area */}
        <div className="flex-shrink-0 space-y-3">
          <div className="flex gap-2 md:gap-3">
            <Input
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
              placeholder="Type your message..."
              disabled={isLoading}
              className="flex-1 text-sm md:text-base"
            />
            <Button
              onClick={handleSendMessage}
              disabled={isLoading || !userInput.trim()}
              className="bg-blue-500 hover:bg-blue-600 px-4 md:px-6"
            >
              Send
            </Button>
          </div>

          <div className="flex gap-2 md:gap-3 flex-col sm:flex-row">
            <Button
              onClick={isRecording ? stopRecording : startRecording}
              variant={isRecording ? "destructive" : "outline"}
              className="flex-1 text-sm md:text-base"
            >
              <Mic className="w-4 h-4 mr-2" />
              {isRecording ? "Stop" : "Record"}
            </Button>
            <Button
              onClick={resetConversation}
              variant="outline"
              className="flex-1 text-sm md:text-base"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
