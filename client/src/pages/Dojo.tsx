import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Volume2, Mic, RotateCcw, ArrowLeft, ChevronDown } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import { Streamdown } from "streamdown";

interface Message {
  role: "user" | "ai";
  content: string;
  audioUrl?: string;
  score?: number;
  feedback?: string;
  expanded?: boolean;
}

interface Scenario {
  id: string;
  title: string;
  description: string;
}

export default function Dojo() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [selectedScenario, setSelectedScenario] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [userInput, setUserInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentAudio, setCurrentAudio] = useState<string | null>(null);
  const [overallScore, setOverallScore] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const dojoGetScenarios = trpc.dojo.getScenarios.useQuery();
  const dojoRespond = trpc.dojo.respond.useMutation();

  useEffect(() => {
    if (dojoGetScenarios.data) {
      setScenarios(dojoGetScenarios.data);
    }
  }, [dojoGetScenarios.data]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (!user) {
    navigate("/");
    return null;
  }

  if (!selectedScenario) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-6">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8 flex items-center gap-4">
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
              <h1 className="text-3xl md:text-4xl font-bold text-slate-900">Dojo</h1>
              <p className="text-slate-600 text-sm">Practice difficult conversations</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            {scenarios.map((scenario) => (
              <Card
                key={scenario.id}
                className="p-4 md:p-6 border-0 shadow-lg hover:shadow-xl transition-shadow cursor-pointer"
                onClick={() => setSelectedScenario(scenario.id)}
              >
                <h3 className="text-lg md:text-xl font-semibold text-slate-900 mb-2">{scenario.title}</h3>
                <p className="text-slate-600 text-sm md:text-base mb-4">{scenario.description}</p>
                <Button className="w-full bg-green-500 hover:bg-green-600 text-sm md:text-base">Start Practice</Button>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const scenario = scenarios.find((s) => s.id === selectedScenario);

  const handleSendMessage = async () => {
    if (!userInput.trim()) return;

    const userMessage: Message = { role: "user", content: userInput, expanded: true };
    setMessages((prev) => [...prev, userMessage]);
    setUserInput("");
    setIsLoading(true);

    try {
      const result = await dojoRespond.mutateAsync({
        message: userInput,
        scenario: selectedScenario as any,
        history: messages.map((m) => ({
          role: m.role === "user" ? "user" : "assistant",
          content: m.content,
        })),
      });

      const aiMessage: Message = {
        role: "ai",
        content: result.response,
        audioUrl: result.audioUrl,
        score: result.score,
        feedback: result.feedback,
        expanded: false,
      };

      setMessages((prev) => [...prev, aiMessage]);
      setOverallScore(Math.round((overallScore + result.score) / (messages.length / 2 + 1)));

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

  const resetSession = () => {
    setMessages([]);
    setUserInput("");
    setOverallScore(0);
  };

  const getScoreColor = (score: number) => {
    if (score < 25) return "from-red-500 to-red-600";
    if (score < 50) return "from-orange-500 to-orange-600";
    if (score < 75) return "from-yellow-500 to-yellow-600";
    return "from-green-500 to-green-600";
  };

  const getScorePercentage = (score: number) => {
    return Math.round((score / 100) * 360);
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
        {/* Header with Back Button and Score */}
        <div className="mb-6 flex items-start justify-between gap-4 flex-shrink-0">
          <div className="flex items-center gap-4">
            <Button
              onClick={() => {
                setSelectedScenario(null);
                resetSession();
              }}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-slate-900">{scenario?.title}</h1>
              <p className="text-slate-600 text-xs md:text-sm">{scenario?.description}</p>
            </div>
          </div>

          {/* Live Score Circle */}
          <div className="flex flex-col items-center flex-shrink-0">
            <div className="relative w-20 md:w-24 h-20 md:h-24">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
                <circle cx="60" cy="60" r="50" fill="none" stroke="#e2e8f0" strokeWidth="8" />
                <circle
                  cx="60"
                  cy="60"
                  r="50"
                  fill="none"
                  strokeWidth="8"
                  stroke="url(#scoreGradient)"
                  strokeDasharray={`${getScorePercentage(overallScore)} 360`}
                  strokeLinecap="round"
                />
                <defs>
                  <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor={overallScore < 25 ? "#ef4444" : overallScore < 50 ? "#f97316" : overallScore < 75 ? "#eab308" : "#22c55e"} />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <p className="text-xl md:text-2xl font-bold text-slate-900">{overallScore}</p>
                  <p className="text-xs text-slate-500">Score</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Messages - Discussion Forum Style */}
        <div className="flex-1 overflow-y-auto mb-6 bg-white rounded-lg shadow-lg p-4 md:p-6 space-y-4">
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full text-center">
              <div>
                <p className="text-slate-500 text-base md:text-lg mb-2">Start the practice scenario</p>
                <p className="text-slate-400 text-xs md:text-sm">Your responses will be evaluated in real-time</p>
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
                      <div className="text-2xl flex-shrink-0 mt-1">🎯</div>
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

                      {/* Score and Feedback for AI Messages */}
                      {msg.score !== undefined && msg.role === "ai" && (
                        <div className="mt-3 pt-3 border-t border-slate-300 space-y-2">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold">Score: {msg.score}/100</span>
                            <div className="flex-1 bg-slate-300 rounded-full h-2">
                              <div
                                className={`h-2 rounded-full transition-all ${
                                  msg.score < 25
                                    ? "bg-red-500"
                                    : msg.score < 50
                                    ? "bg-orange-500"
                                    : msg.score < 75
                                    ? "bg-yellow-500"
                                    : "bg-green-500"
                                }`}
                                style={{ width: `${msg.score}%` }}
                              />
                            </div>
                          </div>
                          <p className="text-xs text-slate-600">{msg.feedback}</p>
                        </div>
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
              placeholder="Type your response..."
              disabled={isLoading}
              className="flex-1 text-sm md:text-base"
            />
            <Button
              onClick={handleSendMessage}
              disabled={isLoading || !userInput.trim()}
              className="bg-green-500 hover:bg-green-600 px-4 md:px-6"
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
              onClick={resetSession}
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
