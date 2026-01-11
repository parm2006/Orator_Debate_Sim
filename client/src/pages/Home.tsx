import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Loader2, Zap, Brain, Swords } from "lucide-react";
import { getLoginUrl } from "@/const";
import { useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";

export default function Home() {
  const { user, loading, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState<"debate" | "sandbox" | "dojo">("debate");
  const [topic, setTopic] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const createDebate = trpc.debate.create.useMutation({
    onSuccess: (debate) => {
      setIsCreating(false);
      setTopic("");
      navigate(`/debate/${debate.id}`);
    },
    onError: () => {
      setIsCreating(false);
    },
  });

  const handleCreateDebate = async () => {
    if (!topic.trim()) return;
    setIsCreating(true);
    createDebate.mutate({ topic: topic.trim() });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <Loader2 className="w-8 h-8 animate-spin text-slate-600" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 px-4">
        <div className="max-w-md text-center">
          <div className="mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 mb-4">
              <Zap className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-slate-900 mb-4">Debate Fight Club</h1>
          <p className="text-lg text-slate-600 mb-8">
            Master conversations with AI-powered practice modes. Debate, practice, and improve.
          </p>
          <a href={getLoginUrl()}>
            <Button size="lg" className="w-full">
              Sign In to Get Started
            </Button>
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Debate Fight Club</h1>
          <p className="text-lg text-slate-600">
            Welcome back, {user?.name || "Debater"}! Choose a practice mode to get started.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-4 mb-8 flex-wrap">
          <Button
            onClick={() => setActiveTab("debate")}
            variant={activeTab === "debate" ? "default" : "outline"}
            className={`flex items-center gap-2 ${activeTab === "debate" ? "bg-blue-500 hover:bg-blue-600" : ""}`}
          >
            <Swords className="w-5 h-5" />
            Debate
          </Button>
          <Button
            onClick={() => setActiveTab("sandbox")}
            variant={activeTab === "sandbox" ? "default" : "outline"}
            className={`flex items-center gap-2 ${activeTab === "sandbox" ? "bg-cyan-500 hover:bg-cyan-600" : ""}`}
          >
            <Brain className="w-5 h-5" />
            Sandbox
          </Button>
          <Button
            onClick={() => setActiveTab("dojo")}
            variant={activeTab === "dojo" ? "default" : "outline"}
            className={`flex items-center gap-2 ${activeTab === "dojo" ? "bg-green-500 hover:bg-green-600" : ""}`}
          >
            <Zap className="w-5 h-5" />
            Dojo
          </Button>
        </div>

        {/* Debate Tab */}
        {activeTab === "debate" && (
          <div className="space-y-8">
            <Card className="p-8 border-0 shadow-lg">
              <h2 className="text-2xl font-bold text-slate-900 mb-6">Start a New Debate</h2>
              <div className="flex flex-col sm:flex-row gap-3 mb-4">
                <Input
                  placeholder="Enter a debate topic (e.g., 'Should AI be regulated?')"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleCreateDebate()}
                  disabled={isCreating}
                  className="flex-1"
                />
                <Button
                  onClick={handleCreateDebate}
                  disabled={!topic.trim() || isCreating}
                  size="lg"
                  className="min-w-fit bg-blue-500 hover:bg-blue-600"
                >
                  {isCreating ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Start Debate"
                  )}
                </Button>
              </div>
              <p className="text-sm text-slate-500">
                Two AI agents will argue pro and con positions on your topic. You can interrupt anytime with your voice.
              </p>
            </Card>

            <PastDebatesSection />
          </div>
        )}

        {/* Sandbox Tab */}
        {activeTab === "sandbox" && (
          <div className="space-y-8">
            <Card className="p-8 border-0 shadow-lg">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 mb-2">Sandbox</h2>
                  <p className="text-slate-600">Practice free-form conversations with different AI personalities</p>
                </div>
                <Brain className="w-12 h-12 text-cyan-500 opacity-50" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="p-4 bg-cyan-50 rounded-lg border border-cyan-200">
                  <p className="font-semibold text-slate-900 mb-1">🤝 Supportive Friend</p>
                  <p className="text-sm text-slate-600">Get encouragement and emotional support</p>
                </div>
                <div className="p-4 bg-cyan-50 rounded-lg border border-cyan-200">
                  <p className="font-semibold text-slate-900 mb-1">🧙 Wise Mentor</p>
                  <p className="text-sm text-slate-600">Receive thoughtful guidance and wisdom</p>
                </div>
                <div className="p-4 bg-cyan-50 rounded-lg border border-cyan-200">
                  <p className="font-semibold text-slate-900 mb-1">👨‍🏫 Patient Teacher</p>
                  <p className="text-sm text-slate-600">Learn concepts explained clearly</p>
                </div>
                <div className="p-4 bg-cyan-50 rounded-lg border border-cyan-200">
                  <p className="font-semibold text-slate-900 mb-1">😈 Devil's Advocate</p>
                  <p className="text-sm text-slate-600">Challenge your assumptions respectfully</p>
                </div>
                <div className="p-4 bg-cyan-50 rounded-lg border border-cyan-200">
                  <p className="font-semibold text-slate-900 mb-1">💪 Motivational Coach</p>
                  <p className="text-sm text-slate-600">Get inspired and build confidence</p>
                </div>
                <div className="p-4 bg-cyan-50 rounded-lg border border-cyan-200">
                  <p className="font-semibold text-slate-900 mb-1">🧘 Calm Therapist</p>
                  <p className="text-sm text-slate-600">Explore thoughts in a safe space</p>
                </div>
              </div>

              <Button
                onClick={() => navigate("/sandbox")}
                className="w-full bg-cyan-500 hover:bg-cyan-600 text-white font-semibold py-6 text-lg"
              >
                Enter Sandbox
              </Button>
            </Card>
          </div>
        )}

        {/* Dojo Tab */}
        {activeTab === "dojo" && (
          <div className="space-y-8">
            <Card className="p-8 border-0 shadow-lg">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 mb-2">Dojo</h2>
                  <p className="text-slate-600">Practice difficult conversations with real-time scoring and feedback</p>
                </div>
                <Zap className="w-12 h-12 text-green-500 opacity-50" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <p className="font-semibold text-slate-900 mb-1">💼 Salary Negotiation</p>
                  <p className="text-sm text-slate-600">Practice asking for a raise</p>
                </div>
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <p className="font-semibold text-slate-900 mb-1">🎯 Job Interview</p>
                  <p className="text-sm text-slate-600">Prepare for tough questions</p>
                </div>
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <p className="font-semibold text-slate-900 mb-1">💔 Breakup Conversation</p>
                  <p className="text-sm text-slate-600">Navigate difficult endings</p>
                </div>
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <p className="font-semibold text-slate-900 mb-1">📋 Difficult Feedback</p>
                  <p className="text-sm text-slate-600">Give or receive critical feedback</p>
                </div>
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <p className="font-semibold text-slate-900 mb-1">⚔️ Conflict Resolution</p>
                  <p className="text-sm text-slate-600">Resolve workplace conflicts</p>
                </div>
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <p className="font-semibold text-slate-900 mb-1">😠 Client Complaint</p>
                  <p className="text-sm text-slate-600">Handle upset customers</p>
                </div>
              </div>

              <Button
                onClick={() => navigate("/dojo")}
                className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-6 text-lg"
              >
                Enter Dojo
              </Button>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}

function PastDebatesSection() {
  const { data: debates, isLoading } = trpc.debate.list.useQuery();
  const [, navigate] = useLocation();

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-slate-600" />
      </div>
    );
  }

  if (!debates || debates.length === 0) {
    return (
      <Card className="p-12 text-center border-0 shadow-lg">
        <p className="text-slate-600 text-lg">No past debates yet. Start one above!</p>
      </Card>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-slate-900 mb-6">Past Debates</h2>
      <div className="grid gap-4">
        {debates.map((debate) => (
          <Card
            key={debate.id}
            className="p-6 border-0 shadow-md hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => navigate(`/debate/${debate.id}`)}
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">{debate.topic}</h3>
                <p className="text-sm text-slate-500 mt-1">
                  {new Date(debate.createdAt).toLocaleDateString()} at{" "}
                  {new Date(debate.createdAt).toLocaleTimeString()}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  debate.status === "active"
                    ? "bg-green-100 text-green-700"
                    : debate.status === "paused"
                      ? "bg-yellow-100 text-yellow-700"
                      : "bg-slate-100 text-slate-700"
                }`}>
                  {debate.status.charAt(0).toUpperCase() + debate.status.slice(1)}
                </span>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
