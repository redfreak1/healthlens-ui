import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Activity, Calendar, History, Sparkles, ChevronRight, Star } from "lucide-react";
import { mockLabResults } from "@/data/mockLabData";
import { SeniorQueView } from "@/components/SeniorQueView";
import { AnalystAlexView } from "@/components/AnalystAlexView";
import { HealthSummary } from "@/components/HealthSummary";
import { PersonaBadge } from "@/components/PersonaBadge";
import { WhatsNext } from "@/components/WhatsNext";
import { InteractionPanel } from "@/components/InteractionPanel";

const Dashboard = () => {
  const [timeRange, setTimeRange] = useState<"recent" | "history">("recent");

  const handleSpeak = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1;
      utterance.volume = 1;
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-border shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Activity className="w-8 h-8 text-primary" />
              <div>
                <h1 className="text-2xl font-bold text-foreground">HealthLens</h1>
                <p className="text-sm text-muted-foreground">Personalized Dashboard</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm">
                <Calendar className="w-4 h-4 mr-2" />
                Last Updated: Today
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          {/* Persona Badge */}
          <div className="lg:col-span-1">
            <PersonaBadge />
          </div>

          {/* Health Summary */}
          <div className="lg:col-span-2">
            <HealthSummary results={mockLabResults} />
          </div>
        </div>

        {/* What's Next Recommendations */}
        <div className="mb-8">
          <WhatsNext />
        </div>

        {/* Interaction Panel */}
        <div className="mb-8">
          <InteractionPanel />
        </div>

        {/* Lab Results with Time Range */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <Activity className="w-6 h-6 text-primary" />
                Lab Results
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Comprehensive view of your health metrics
              </p>
            </div>
          </div>

          <Tabs value={timeRange} onValueChange={(value) => setTimeRange(value as "recent" | "history")} className="mb-6">
            <TabsList className="grid w-full max-w-md grid-cols-2">
              <TabsTrigger value="recent" className="flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                Recent (0-3 Months)
              </TabsTrigger>
              <TabsTrigger value="history" className="flex items-center gap-2">
                <History className="w-4 h-4" />
                History (3+ Months)
              </TabsTrigger>
            </TabsList>

            <TabsContent value="recent" className="mt-6">
              <div className="bg-primary/5 border-l-4 border-primary p-4 rounded mb-6">
                <p className="text-sm font-medium">
                  Showing results from the last 3 months with trend analysis and insights
                </p>
              </div>
              <AnalystAlexView results={mockLabResults} />
            </TabsContent>

            <TabsContent value="history" className="mt-6">
              <div className="bg-muted/50 border-l-4 border-muted-foreground p-4 rounded mb-6">
                <p className="text-sm font-medium text-muted-foreground">
                  Historical data view - Results older than 3 months
                </p>
              </div>
              <Card className="p-8 text-center">
                <History className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-bold mb-2">Historical Data Archive</h3>
                <p className="text-muted-foreground mb-4">
                  View your health journey over time with year-over-year comparisons
                </p>
                <div className="space-y-3 max-w-md mx-auto">
                  <div className="flex items-center justify-between p-3 bg-accent/5 rounded-lg">
                    <span className="font-medium">2024 Q1 Results</span>
                    <ChevronRight className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div className="flex items-center justify-between p-3 bg-accent/5 rounded-lg">
                    <span className="font-medium">2023 Annual Summary</span>
                    <ChevronRight className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div className="flex items-center justify-between p-3 bg-accent/5 rounded-lg">
                    <span className="font-medium">2023 Q3-Q4 Results</span>
                    <ChevronRight className="w-5 h-5 text-muted-foreground" />
                  </div>
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        </Card>
      </main>
    </div>
  );
};

export default Dashboard;
