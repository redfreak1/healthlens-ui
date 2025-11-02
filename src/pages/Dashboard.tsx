import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Activity, Calendar, History, Sparkles, ChevronRight, Star, Loader2, AlertCircle, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { api, AdaptiveViewResponse, PersonaInfo } from "@/lib/api";
import { SeniorQueView } from "@/components/SeniorQueView";
import { AnalystAlexView } from "@/components/AnalystAlexView";
import { HealthSummary } from "@/components/HealthSummary";
import { PersonaBadge } from "@/components/PersonaBadge";
import { WhatsNext } from "@/components/WhatsNext";
import { InteractionPanel } from "@/components/InteractionPanel";
import { getCurrentUserId } from "@/lib/user";

const Dashboard = () => {
  const [timeRange, setTimeRange] = useState<"recent" | "history">("recent");
  const [adaptiveData, setAdaptiveData] = useState<AdaptiveViewResponse | null>(null);
  const [personaInfo, setPersonaInfo] = useState<PersonaInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get user persona from localStorage
  const userPersona = localStorage.getItem("userPersona") || "balanced";

  // Fetch adaptive view data and persona info on component mount
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Get the current user ID from login
        const currentUserId = getCurrentUserId();
        
        // Fetch adaptive view data
        const adaptiveViewData = await api.getAdaptiveView(currentUserId, currentUserId);
        setAdaptiveData(adaptiveViewData);
        
        // Fetch persona info
        try {
          const personaData = await api.persona.getInfo(userPersona);
          setPersonaInfo(personaData);
        } catch (personaErr) {
          console.warn('Failed to fetch persona info:', personaErr);
          // Continue without persona info
        }
      } catch (err) {
        console.error('Failed to fetch adaptive view:', err);
        setError('Failed to load your personalized dashboard');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [userPersona]);

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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "high":
      case "critical":
        return <TrendingUp className="w-4 h-4 text-destructive" />;
      case "low":
        return <TrendingDown className="w-4 h-4 text-destructive" />;
      default:
        return <Minus className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "high":
      case "critical":
      case "low":
        return "border-destructive/50 bg-destructive/5";
      default:
        return "border-border bg-card";
    }
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="p-8 text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-primary" />
          <h3 className="text-xl font-bold mb-2">Loading Your Dashboard</h3>
          <p className="text-muted-foreground">
            Personalizing your health insights for {userPersona} persona...
          </p>
        </Card>
      </div>
    );
  }

  // Show error state
  if (error || !adaptiveData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="p-8 text-center">
          <AlertCircle className="w-12 h-12 mx-auto mb-4 text-destructive" />
          <h3 className="text-xl font-bold mb-2 text-destructive">Unable to Load Dashboard</h3>
          <p className="text-muted-foreground mb-4">
            {error || "We couldn't load your personalized dashboard at this time."}
          </p>
          <Button onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-border shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Activity className="w-8 h-8 text-primary" />
              <div>
                <h1 className="text-2xl font-bold text-foreground">
                  {adaptiveData?.ui_components?.components?.header?.title || "HealthLens"}
                </h1>
                <p className="text-sm text-muted-foreground">
                  {adaptiveData?.ui_components?.components?.header?.subtitle || "Personalized Dashboard"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {adaptiveData?.persona && (
                <Badge variant="secondary" className="capitalize">
                  {adaptiveData.persona} Persona
                </Badge>
              )}
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
            <PersonaBadge personaInfo={personaInfo} />
          </div>

          {/* Health Summary */}
          <div className="lg:col-span-2">
            <HealthSummary results={adaptiveData?.ui_components?.components?.results_view?.data || []} />
          </div>
        </div>

        {/* What's Next Recommendations */}
        <div className="mb-8">
          <WhatsNext recommendations={adaptiveData?.recommendations} />
        </div>

        {/* Interaction Panel */}
        <div className="mb-8">
          <InteractionPanel 
            labResults={adaptiveData?.ui_components?.components?.results_view?.data || []}
            persona={userPersona}
          />
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
              <AnalystAlexView results={adaptiveData?.ui_components?.components?.results_view?.data || []} />
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
