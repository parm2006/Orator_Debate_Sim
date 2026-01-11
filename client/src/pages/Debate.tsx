import { useEffect, useRef, useState } from "react";
import { useRoute, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Loader2, Mic, Volume2, ArrowLeft, Play, Pause } from "lucide-react";
import { Streamdown } from "streamdown";

interface DebateMessage {
  id: number;
  debateId: number;
  speaker: "pro" | "con" | "user";
  message: string;
  audioUrl: string | null;
  createdAt: Date;
}

export default function Debate() {
  const [match, params] = useRoute("/debate/:id");
  const [, navigate] = useLocation();
  const debateId = params?.id ? parseInt(params.id) : null;

  const [messages, setMessages] = useState<DebateMessage[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [currentAudio, setCurrentAudio] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [userMessage, setUserMessage] = useState("");
  const [isAutoProgressing, setIsAutoProgressing] = useState(true);
  const [delayBetweenArguments, setDelayBetweenArguments] = useState(3); // seconds
  const [lastPlayedMessageId, setLastPlayedMessageId] = useState<number | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const autoProgressTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: debate, isLoading: debateLoading } = trpc.debate.getById.useQuery(
    { debateId: debateId! },
    { enabled: !!debateId }
  );

  const { data: debateMessages, refetch: refetchMessages } = trpc.debate.getMessages.useQuery(
    { debateId: debateId! },
    { enabled: !!debateId }
  );

  const generateNextMessage = trpc.debate.generateNextMessage.useMutation({
    onSuccess: () => {
      setIsGenerating(false);
      refetchMessages();
    },
    onError: () => {
      setIsGenerating(false);
    },
  });

  const handleInterruption = trpc.debate.handleInterruption.useMutation({
    onSuccess: () => {
      setUserMessage("");
      setIsRecording(false);
      refetchMessages();
    },
    onError: () => {
      setIsRecording(false);
    },
  });

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Update messages when debate messages change and auto-play latest audio
  useEffect(() => {
    if (debateMessages) {
      const newMessages = debateMessages as DebateMessage[];
      setMessages(newMessages);
      
      // Auto-play audio for the latest message if it has audio and hasn't been played yet
      if (newMessages.length > 0) {
        const latestMessage = newMessages[newMessages.length - 1];
        if (latestMessage.audioUrl && latestMessage.id !== lastPlayedMessageId) {
          // Small delay to ensure audio is ready
          setTimeout(() => {
            playAudio(latestMessage.audioUrl!);
            setLastPlayedMessageId(latestMessage.id);
          }, 500);
        }
      }
    }
  }, [debateMessages, lastPlayedMessageId]);

  // Auto-progression logic
  useEffect(() => {
    if (!debate || !isAutoProgressing || isGenerating) return;

    // Clear any existing timeout
    if (autoProgressTimeoutRef.current) {
      clearTimeout(autoProgressTimeoutRef.current);
    }

    // Determine next speaker based on last message
    const lastMessage = messages[messages.length - 1];
    let nextSpeaker: "pro" | "con" = "pro";

    if (lastMessage) {
      if (lastMessage.speaker === "pro") {
        nextSpeaker = "con";
      } else if (lastMessage.speaker === "con") {
        nextSpeaker = "pro";
      } else if (lastMessage.speaker === "user") {
        // After user interruption, continue with pro
        nextSpeaker = "pro";
      }
    }

    // Schedule next argument generation
    autoProgressTimeoutRef.current = setTimeout(() => {
      if (isAutoProgressing) {
        setIsGenerating(true);
        generateNextMessage.mutate({
          debateId: debate.id,
          topic: debate.topic,
          speaker: nextSpeaker,
        });
      }
    }, delayBetweenArguments * 1000);

    return () => {
      if (autoProgressTimeoutRef.current) {
        clearTimeout(autoProgressTimeoutRef.current);
      }
    };
  }, [debate, messages, isAutoProgressing, isGenerating, delayBetweenArguments, generateNextMessage]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        // In a real implementation, upload to S3 and get URL
        // For now, we'll use a placeholder
        const audioUrl = URL.createObjectURL(audioBlob);
        setUserMessage(audioUrl);
        setIsRecording(false);
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (error) {
      console.error("Error accessing microphone:", error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop());
    }
  };

  const handleSubmitInterruption = () => {
    if (!debate || !userMessage.trim()) return;
    
    // Pause auto-progression during interruption
    setIsAutoProgressing(false);
    
    handleInterruption.mutate({
      debateId: debate.id,
      topic: debate.topic,
      userMessage: userMessage.trim(),
    });
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

  if (!match || !debateId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Debate not found</p>
      </div>
    );
  }

  if (debateLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <Loader2 className="w-8 h-8 animate-spin text-slate-600" />
      </div>
    );
  }

  if (!debate) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Debate not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <button
              onClick={() => navigate("/")}
              className="flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-4"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </button>
            <h1 className="text-3xl font-bold text-slate-900">{debate.topic}</h1>
            <p className="text-slate-600 mt-2">
              {new Date(debate.createdAt).toLocaleString()}
            </p>
          </div>
          <div className={`px-4 py-2 rounded-full text-sm font-medium ${
            debate.status === "active"
              ? "bg-green-100 text-green-700"
              : debate.status === "paused"
                ? "bg-yellow-100 text-yellow-700"
                : "bg-slate-100 text-slate-700"
          }`}>
            {debate.status.charAt(0).toUpperCase() + debate.status.slice(1)}
          </div>
        </div>

        {/* Auto-Progression Controls */}
        <Card className="p-6 border-0 shadow-lg mb-8 bg-blue-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                onClick={() => setIsAutoProgressing(!isAutoProgressing)}
                variant={isAutoProgressing ? "default" : "outline"}
                size="sm"
              >
                {isAutoProgressing ? (
                  <>
                    <Pause className="w-4 h-4 mr-2" />
                    Pause Debate
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 mr-2" />
                    Resume Debate
                  </>
                )}
              </Button>
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-slate-700">Delay between arguments:</label>
                <select
                  value={delayBetweenArguments}
                  onChange={(e) => setDelayBetweenArguments(parseInt(e.target.value))}
                  className="px-2 py-1 border border-slate-300 rounded text-sm"
                  disabled={isGenerating}
                >
                  <option value={1}>1 second</option>
                  <option value={2}>2 seconds</option>
                  <option value={3}>3 seconds</option>
                  <option value={5}>5 seconds</option>
                  <option value={10}>10 seconds</option>
                </select>
              </div>
            </div>
            {isGenerating && (
              <div className="flex items-center gap-2 text-blue-600">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm font-medium">Generating argument...</span>
              </div>
            )}
          </div>
        </Card>

        {/* Messages Display */}
        <div className="mb-8 space-y-4 max-h-96 overflow-y-auto bg-white rounded-lg p-4 shadow-md">
          {messages.length === 0 ? (
            <div className="text-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-slate-600 mx-auto mb-2" />
              <p className="text-slate-600">Starting the debate...</p>
            </div>
          ) : (
            <>
              {messages.map((msg) => (
                <DebateMessageCard 
                  key={msg.id} 
                  message={msg} 
                  onPlayAudio={playAudio}
                  isCurrentlyPlaying={currentAudio === msg.audioUrl && isPlaying}
                />
              ))}
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

        {/* User Interruption */}
        <Card className="p-6 border-0 shadow-lg">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Interrupt with Your Voice</h3>
          <div className="space-y-4">
            <div className="flex gap-3">
              <Input
                placeholder="Type your interruption or use voice..."
                value={userMessage}
                onChange={(e) => setUserMessage(e.target.value)}
                disabled={isRecording}
              />
              <Button
                onClick={isRecording ? stopRecording : startRecording}
                variant={isRecording ? "destructive" : "outline"}
                size="icon"
              >
                <Mic className="w-4 h-4" />
              </Button>
            </div>
            <Button
              onClick={handleSubmitInterruption}
              disabled={!userMessage.trim() || isRecording}
              className="w-full"
            >
              Submit Interruption
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}

function DebateMessageCard({
  message,
  onPlayAudio,
  isCurrentlyPlaying,
}: {
  message: DebateMessage;
  onPlayAudio: (url: string) => void;
  isCurrentlyPlaying: boolean;
}) {
  const speakerColors = {
    pro: "bg-blue-50 border-blue-200",
    con: "bg-red-50 border-red-200",
    user: "bg-purple-50 border-purple-200",
  };

  const speakerLabels = {
    pro: "Pro AI",
    con: "Con AI",
    user: "You",
  };

  return (
    <Card className={`p-4 border-2 ${speakerColors[message.speaker]} ${isCurrentlyPlaying ? "ring-2 ring-blue-400" : ""}`}>
      <div className="flex items-start justify-between mb-2">
        <span className="font-semibold text-slate-900">{speakerLabels[message.speaker]}</span>
        {message.audioUrl && (
          <Button
            onClick={() => onPlayAudio(message.audioUrl!)}
            size="sm"
            variant={isCurrentlyPlaying ? "default" : "ghost"}
            title="Click to replay audio"
          >
            <Volume2 className="w-4 h-4" />
          </Button>
        )}
      </div>
      <Streamdown>{message.message}</Streamdown>
      <p className="text-xs text-slate-500 mt-2">
        {new Date(message.createdAt).toLocaleTimeString()}
      </p>
    </Card>
  );
}
