import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Sparkles, Loader2 } from "lucide-react";
import { Persona } from "./PersonaSwitcher";
import { LabResult } from "@/data/mockLabData";

interface AIQuerySectionProps {
  results: LabResult[];
  persona: Persona;
}

export const AIQuerySection = ({ results, persona }: AIQuerySectionProps) => {
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<string>("");

  const handleQuery = async () => {
    setLoading(true);
    setResponse("");

    try {
      // Call the real API instead of simulation
      const { api } = await import("@/lib/api");
      
      const aiResponse = await api.ai.generateContent(
        persona === "senior-que" ? "health-conscious" : "detail-oriented",
        results,
        { persona_display: persona }
      );

      setResponse(aiResponse.content);
    } catch (error) {
      console.error("API Error:", error);
      
      // Fallback to original logic if API fails
      const abnormalResults = results.filter(r => r.status !== 'normal');
      
      if (abnormalResults.length === 0) {
        setResponse(persona === "senior-que" 
          ? "Good news! All your results are in the healthy range." 
          : "Analysis complete: All biomarkers are within reference ranges. No abnormal values detected.");
      } else {
        if (persona === "senior-que") {
          const items = abnormalResults.map(r => 
            `• ${r.name}: ${r.status === 'high' ? 'Higher' : 'Lower'} than normal`
          ).join('\n');
          setResponse(`You have ${abnormalResults.length} result(s) that need attention:\n\n${items}\n\nPlease discuss these with your doctor.`);
        } else {
          const items = abnormalResults.map(r => 
            `• ${r.name}: ${r.value} ${r.unit} (Ref: ${r.referenceRange.min}-${r.referenceRange.max}). Status: ${r.status.toUpperCase()}. Deviation: ${r.status === 'high' ? '+' : ''}${r.status === 'high' ? r.value - r.referenceRange.max : r.value - r.referenceRange.min} ${r.unit}`
          ).join('\n');
          setResponse(`Abnormal findings detected (${abnormalResults.length} total):\n\n${items}\n\nRecommendation: Clinical correlation advised.`);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-6 bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold">AI-Powered Analysis</h3>
      </div>
      
      <p className="text-sm text-muted-foreground mb-4">
        Ask our AI assistant about your results
      </p>

      <Button 
        onClick={handleQuery} 
        disabled={loading}
        className="w-full mb-4"
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Analyzing...
          </>
        ) : (
          <>
            <Sparkles className="mr-2 h-4 w-4" />
            Which results are abnormal?
          </>
        )}
      </Button>

      {response && (
        <Card className="p-4 bg-background border-primary/30">
          <p className="whitespace-pre-line text-sm leading-relaxed">
            {response}
          </p>
        </Card>
      )}
    </Card>
  );
};
