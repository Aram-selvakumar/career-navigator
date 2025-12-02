import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Sparkles, Target, TrendingUp, MessageSquare } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import AnalysisResults from "@/components/AnalysisResults";
import CareerChatbot from "@/components/CareerChatbot";

interface AnalysisResult {
  score: number;
  label: string;
  explanation: string;
  skillGaps: string[];
  recommendation: string;
}

const Index = () => {
  const [jobDescription, setJobDescription] = useState("");
  const [resume, setResume] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [showChatbot, setShowChatbot] = useState(false);

  const handleAnalyze = async () => {
    if (!jobDescription.trim() || !resume.trim()) {
      toast.error("Please provide both job description and resume");
      return;
    }

    setIsAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke("analyze-job-readiness", {
        body: { jobDescription, resume },
      });

      if (error) throw error;

      setAnalysisResult(data);
      toast.success("Analysis complete!");
    } catch (error) {
      console.error("Analysis error:", error);
      toast.error("Failed to analyze. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background">
      {/* Hero Section */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
              <Target className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Career Compass
            </h1>
          </div>
          <Button
            variant="outline"
            onClick={() => setShowChatbot(!showChatbot)}
            className="gap-2"
          >
            <MessageSquare className="w-4 h-4" />
            Career Assistant
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        {/* Hero Banner */}
        <div className="text-center mb-16 animate-in fade-in slide-in-from-bottom-4 duration-1000">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-6">
            <Sparkles className="w-4 h-4" />
            <span className="text-sm font-medium">AI-Powered Career Analysis</span>
          </div>
          <h2 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-foreground via-primary to-secondary bg-clip-text text-transparent leading-tight">
            Discover Your Job Readiness
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Get instant AI-powered insights on your job readiness. Compare your resume against job descriptions and receive personalized improvement recommendations.
          </p>
        </div>

        {/* Analysis Interface */}
        {!analysisResult ? (
          <Card className="max-w-5xl mx-auto p-8 shadow-lg animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div className="space-y-3">
                <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-primary" />
                  Job Description
                </label>
                <Textarea
                  placeholder="Paste the job description here..."
                  className="min-h-[300px] resize-none border-2 focus:border-primary transition-colors"
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                />
              </div>
              <div className="space-y-3">
                <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <Target className="w-4 h-4 text-secondary" />
                  Your Resume
                </label>
                <Textarea
                  placeholder="Paste your resume content here..."
                  className="min-h-[300px] resize-none border-2 focus:border-secondary transition-colors"
                  value={resume}
                  onChange={(e) => setResume(e.target.value)}
                />
              </div>
            </div>
            <Button
              onClick={handleAnalyze}
              disabled={isAnalyzing}
              className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-primary to-secondary hover:shadow-lg transition-all"
              size="lg"
            >
              {isAnalyzing ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                  Analyzing Your Readiness...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 mr-2" />
                  Analyze My Readiness
                </>
              )}
            </Button>
          </Card>
        ) : (
          <AnalysisResults
            result={analysisResult}
            onReset={() => {
              setAnalysisResult(null);
              setJobDescription("");
              setResume("");
            }}
          />
        )}

        {/* Feature Cards */}
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto mt-16">
          {[
            {
              icon: Target,
              title: "Accurate Scoring",
              description: "Get a precise job readiness score based on skills, tools, and experience alignment",
            },
            {
              icon: TrendingUp,
              title: "Gap Analysis",
              description: "Identify missing skills and qualifications to help you improve",
            },
            {
              icon: Sparkles,
              title: "Smart Recommendations",
              description: "Receive actionable tips to enhance your resume and career prospects",
            },
          ].map((feature, i) => (
            <Card
              key={i}
              className="p-6 hover:shadow-lg transition-all animate-in fade-in slide-in-from-bottom-4 duration-700"
              style={{ animationDelay: `${(i + 1) * 200}ms` }}
            >
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center mb-4">
                <feature.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground text-sm">{feature.description}</p>
            </Card>
          ))}
        </div>
      </main>

      {/* Career Chatbot */}
      {showChatbot && <CareerChatbot onClose={() => setShowChatbot(false)} />}
    </div>
  );
};

export default Index;
