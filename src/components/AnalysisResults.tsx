import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, AlertCircle, Lightbulb, RotateCcw } from "lucide-react";
import { useEffect, useState } from "react";

interface AnalysisResult {
  score: number;
  label: string;
  explanation: string;
  skillGaps: string[];
  recommendation: string;
}

interface AnalysisResultsProps {
  result: AnalysisResult;
  onReset: () => void;
}

const AnalysisResults = ({ result, onReset }: AnalysisResultsProps) => {
  const [animatedScore, setAnimatedScore] = useState(0);

  useEffect(() => {
    // Animate score counting
    const duration = 2000;
    const steps = 60;
    const increment = result.score / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= result.score) {
        setAnimatedScore(result.score);
        clearInterval(timer);
      } else {
        setAnimatedScore(Math.floor(current));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [result.score]);

  const getScoreColor = (score: number) => {
    if (score >= 8) return "from-success to-success/80";
    if (score >= 5) return "from-accent to-accent/80";
    return "from-destructive to-destructive/80";
  };

  const getScoreIcon = (score: number) => {
    if (score >= 8) return <CheckCircle2 className="w-8 h-8 text-success" />;
    return <AlertCircle className="w-8 h-8 text-accent" />;
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Score Card */}
      <Card className="p-8 text-center bg-gradient-to-br from-card to-muted/30 border-2 shadow-lg">
        <div className="flex items-center justify-center mb-4">
          {getScoreIcon(result.score)}
        </div>
        <h3 className="text-2xl font-bold mb-2">Match Score</h3>
        <div className="mb-4">
          <div
            className={`inline-block text-7xl font-bold bg-gradient-to-r ${getScoreColor(
              result.score
            )} bg-clip-text text-transparent`}
          >
            {animatedScore}
          </div>
          <span className="text-4xl text-muted-foreground">/10</span>
        </div>
        <Badge
          variant="secondary"
          className={`text-lg px-6 py-2 bg-gradient-to-r ${getScoreColor(result.score)} text-white`}
        >
          {result.label}
        </Badge>
      </Card>

      {/* Explanation Card */}
      <Card className="p-6 space-y-4">
        <h3 className="text-xl font-bold flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-primary" />
          Why This Score
        </h3>
        <p className="text-muted-foreground leading-relaxed">{result.explanation}</p>
      </Card>

      {/* Skill Gaps Card */}
      <Card className="p-6 space-y-4">
        <h3 className="text-xl font-bold flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-accent" />
          Skill Gaps Identified
        </h3>
        {result.skillGaps.length > 0 ? (
          <ul className="space-y-2">
            {result.skillGaps.map((skill, index) => (
              <li
                key={index}
                className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 animate-in fade-in slide-in-from-left-4"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="w-2 h-2 rounded-full bg-accent mt-2" />
                <span className="text-muted-foreground">{skill}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-muted-foreground">Great! No significant skill gaps identified.</p>
        )}
      </Card>

      {/* Recommendation Card */}
      <Card className="p-6 space-y-4 bg-gradient-to-br from-primary/5 to-secondary/5 border-2 border-primary/20">
        <h3 className="text-xl font-bold flex items-center gap-2">
          <Lightbulb className="w-5 h-5 text-primary" />
          Actionable Tip
        </h3>
        <p className="text-foreground leading-relaxed font-medium">{result.recommendation}</p>
      </Card>

      {/* Reset Button */}
      <div className="flex justify-center pt-4">
        <Button
          onClick={onReset}
          variant="outline"
          className="gap-2"
          size="lg"
        >
          <RotateCcw className="w-4 h-4" />
          Analyze Another Position
        </Button>
      </div>
    </div>
  );
};

export default AnalysisResults;
