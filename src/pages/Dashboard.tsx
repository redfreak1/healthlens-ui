import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Activity, Calendar, History, Sparkles, ChevronRight, Star, Loader2, AlertCircle, TrendingUp, TrendingDown, Minus, CheckCircle, Volume2 } from "lucide-react";
import { api, AdaptiveViewResponse, PersonaInfo } from "@/lib/api";
import { SeniorQueView } from "@/components/SeniorQueView";
import { AnalystAlexView } from "@/components/AnalystAlexView";
import { HealthSummary } from "@/components/HealthSummary";
import { PersonaBadge } from "@/components/PersonaBadge";
import { WhatsNext } from "@/components/WhatsNext";
import { InteractionPanel } from "@/components/InteractionPanel";
import { HealthTrends } from "@/components/HealthTrends";
import { BoldHealthTrends } from "@/components/BoldHealthTrends";
import { getCurrentUserId } from "@/lib/user";

const Dashboard = () => {
  const [timeRange, setTimeRange] = useState<"recent" | "history">("recent");
  const [adaptiveData, setAdaptiveData] = useState<AdaptiveViewResponse | null>(null);
  const [personaInfo, setPersonaInfo] = useState<PersonaInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get user persona from localStorage
  const userPersona = localStorage.getItem("userPersona") || "balanced";
  
  // Determine view based on persona type (same logic as PersonaLanding)
  const getViewFromPersona = (persona: string): "bold" | "detailed" => {
    const personaViewMap: { [key: string]: "bold" | "detailed" } = {
      "health-conscious": "bold",
      "health_conscious": "bold",
      "balanced": "detailed",
      "detail-oriented": "detailed",
      "analytical": "detailed",
      "tech-savvy": "detailed",
      "quick-bold": "bold",
      "fast-action": "bold",
      "casual": "bold",
      "passive": "bold",
      "beginner": "bold",
      "power": "detailed",
      "intermediate": "detailed",
      "snapshot": "bold",
      "guided": "bold",
      "action-oriented": "bold"
    };
    
    return personaViewMap[persona] || "detailed"; // Default to detailed
  };

  const userViewPreference = getViewFromPersona(userPersona);

  // Convert API LabResult to component-compatible format
  const convertLabResults = (apiResults: Record<string, unknown>[]) => {
    return apiResults.map(result => ({
      ...result,
      referenceRange: result.reference_range || result.referenceRange || { min: 0, max: 100 }
    }));
  };

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
              <Badge variant="secondary" className="capitalize">
                {userViewPreference === "detailed" ? "Detailed" : "Bold"} View
              </Badge>
              {adaptiveData?.persona && (
                <Badge variant="outline" className="capitalize">
                  {adaptiveData.persona.replace('-', ' ')} Persona
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
            <HealthSummary results={convertLabResults(adaptiveData?.ui_components?.components?.results_view?.data || [])} />
          </div>
        </div>

        {/* What's Next Recommendations */}
        <div className="mb-8">
          <WhatsNext recommendations={adaptiveData?.recommendations} />
        </div>

        {/* Interaction Panel */}
        <div className="mb-8">
          <InteractionPanel 
            labResults={convertLabResults(adaptiveData?.ui_components?.components?.results_view?.data || [])}
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
                  Showing results from the last 3 months with {
                    userViewPreference === "detailed" ? "comprehensive analysis and detailed insights" :
                    "key highlights and actionable recommendations"
                  }
                </p>
              </div>
              
              {userViewPreference === "detailed" ? (
                <div className="space-y-6">
                  {/* Detailed view - Current UI (AnalystAlexView) */}
                  <AnalystAlexView results={convertLabResults(adaptiveData?.ui_components?.components?.results_view?.data || [])} />
                  
                  {/* Additional detailed sections */}
                  <div className="grid md:grid-cols-2 gap-6">
                    <Card className="p-6">
                      <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-primary" />
                        Trend Analysis
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Detailed patterns and correlations in your health data over time.
                      </p>
                    </Card>
                    
                    <Card className="p-6">
                      <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                        <Activity className="w-5 h-5 text-primary" />
                        Risk Factors
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Comprehensive risk assessment based on current lab values.
                      </p>
                    </Card>
                  </div>
                </div>
              ) : (
                <div className="space-y-8">
                  {/* Bold view - Enhanced UI with bigger cards and voice */}
                  
                  {/* Health Score Overview - Bigger Cards */}
                  <div className="grid sm:grid-cols-3 gap-6 mb-8">
                    <Card className="p-8 text-center bg-gradient-to-br from-green-50 to-green-100 border-green-200 shadow-lg hover:shadow-xl transition-shadow cursor-pointer"
                          onClick={() => handleSpeak(`You have ${(adaptiveData?.ui_components?.components?.results_view?.data || []).filter(r => r.status === 'normal').length} normal results. Looking good!`)}>
                      <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
                      <div className="text-4xl font-bold text-green-800 mb-2">
                        {(adaptiveData?.ui_components?.components?.results_view?.data || []).filter(r => r.status === 'normal').length}
                      </div>
                      <div className="text-lg text-green-700 font-medium mb-1">Normal Results</div>
                      <div className="text-sm text-green-600">Looking Good!</div>
                      <Volume2 className="w-4 h-4 text-green-500 mx-auto mt-2" />
                    </Card>
                    
                    <Card className="p-8 text-center bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200 shadow-lg hover:shadow-xl transition-shadow cursor-pointer"
                          onClick={() => handleSpeak(`You have ${(adaptiveData?.ui_components?.components?.results_view?.data || []).filter(r => r.status !== 'normal').length} results that need attention. Action required.`)}>
                      <AlertCircle className="w-16 h-16 text-yellow-600 mx-auto mb-4" />
                      <div className="text-4xl font-bold text-yellow-800 mb-2">
                        {(adaptiveData?.ui_components?.components?.results_view?.data || []).filter(r => r.status !== 'normal').length}
                      </div>
                      <div className="text-lg text-yellow-700 font-medium mb-1">Need Attention</div>
                      <div className="text-sm text-yellow-600">Action Required</div>
                      <Volume2 className="w-4 h-4 text-yellow-500 mx-auto mt-2" />
                    </Card>
                    
                    <Card className="p-8 text-center bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 shadow-lg hover:shadow-xl transition-shadow cursor-pointer"
                          onClick={() => handleSpeak(`Your overall health score is ${Math.round(((adaptiveData?.ui_components?.components?.results_view?.data || []).filter(r => r.status === 'normal').length / Math.max(1, (adaptiveData?.ui_components?.components?.results_view?.data || []).length)) * 100)} percent`)}>
                      <Star className="w-16 h-16 text-blue-600 mx-auto mb-4" />
                      <div className="text-4xl font-bold text-blue-800 mb-2">
                        {Math.round(((adaptiveData?.ui_components?.components?.results_view?.data || []).filter(r => r.status === 'normal').length / Math.max(1, (adaptiveData?.ui_components?.components?.results_view?.data || []).length)) * 100)}%
                      </div>
                      <div className="text-lg text-blue-700 font-medium mb-1">Health Score</div>
                      <div className="text-sm text-blue-600">Overall Rating</div>
                      <Volume2 className="w-4 h-4 text-blue-500 mx-auto mt-2" />
                    </Card>
                  </div>

                  {/* Enhanced Lab Results with Voice */}
                  <div className="space-y-6">
                    {convertLabResults(adaptiveData?.ui_components?.components?.results_view?.data || []).map((result, index) => {
                      const speechText = `${result.name} is ${result.value} ${result.unit}. Status is ${result.status}. ${
                        result.status === 'normal' 
                          ? 'This is within the normal range.' 
                          : 'This needs attention and you may want to discuss it with your healthcare provider.'
                      }`;
                      
                      return (
                        <Card key={index} className={`p-6 shadow-lg hover:shadow-xl transition-all cursor-pointer ${
                          result.status === 'normal' 
                            ? 'border-green-200 bg-gradient-to-r from-green-50/80 to-green-100/60' 
                            : 'border-yellow-200 bg-gradient-to-r from-yellow-50/80 to-yellow-100/60'
                        }`}
                        onClick={() => handleSpeak(speechText)}>
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-4">
                              {result.status === 'normal' ? (
                                <CheckCircle className="w-8 h-8 text-green-600" />
                              ) : (
                                <AlertCircle className="w-8 h-8 text-yellow-600" />
                              )}
                              <div>
                                <h4 className="font-bold text-2xl">{result.name}</h4>
                                <p className="text-base text-muted-foreground">{result.category}</p>
                              </div>
                            </div>
                            
                            <div className="text-right">
                              <div className="text-3xl font-bold">
                                {result.value} <span className="text-lg font-normal text-muted-foreground">{result.unit}</span>
                              </div>
                              <div className="flex items-center gap-2 mt-2">
                                <Badge variant={result.status === 'normal' ? 'secondary' : 'destructive'} className="capitalize text-sm">
                                  {result.status}
                                </Badge>
                                <Volume2 className="w-4 h-4 text-muted-foreground" />
                              </div>
                            </div>
                          </div>

                          {/* Reference Range Info */}
                          {result.referenceRange && (
                            <div className="mb-3 p-3 bg-white/70 rounded-lg border border-gray-200">
                              <p className="text-sm text-muted-foreground">
                                📊 Normal Range: {result.referenceRange.min} - {result.referenceRange.max} {result.unit}
                              </p>
                            </div>
                          )}

                          {result.status !== 'normal' && (
                            <div className="mt-3 p-4 bg-white/80 rounded-lg border-l-4 border-yellow-400">
                              <p className="text-base font-medium text-yellow-800">
                                📋 Recommended Action: Consider discussing this result with your healthcare provider.
                              </p>
                            </div>
                          )}

                          {result.status === 'normal' && (
                            <div className="mt-3 p-4 bg-white/80 rounded-lg border-l-4 border-green-400">
                              <p className="text-base font-medium text-green-800">
                                ✅ Great news! This result is within the normal range.
                              </p>
                            </div>
                          )}
                        </Card>
                      );
                    })}
                  </div>

                  {/* Enhanced Quick Actions with Voice */}
                  <Card className="p-8 bg-gradient-to-r from-primary/10 to-accent/10 shadow-lg">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-2xl font-bold flex items-center gap-3">
                        <Sparkles className="w-8 h-8 text-primary" />
                        Quick Actions
                      </h3>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleSpeak("Here are your quick actions: View trends to see how your results change over time, get personalized health recommendations, or set reminders for important health tasks.")}
                        className="flex items-center gap-2"
                      >
                        <Volume2 className="w-4 h-4" />
                        Read Actions
                      </Button>
                    </div>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      <Button 
                        variant="outline" 
                        className="h-auto p-6 flex-col items-start bg-white/70 hover:bg-white/90 shadow-md hover:shadow-lg transition-all"
                        onClick={() => handleSpeak("View trends to see how your results change over time")}
                      >
                        <div className="font-bold text-primary mb-2 text-lg">📊 View Trends</div>
                        <div className="text-sm text-muted-foreground">See how your results change over time</div>
                        <Volume2 className="w-4 h-4 text-muted-foreground mt-2" />
                      </Button>
                      
                      <Button 
                        variant="outline" 
                        className="h-auto p-6 flex-col items-start bg-white/70 hover:bg-white/90 shadow-md hover:shadow-lg transition-all"
                        onClick={() => handleSpeak("Get personalized health recommendations based on your results")}
                      >
                        <div className="font-bold text-primary mb-2 text-lg">📝 Get Recommendations</div>
                        <div className="text-sm text-muted-foreground">Personalized health suggestions</div>
                        <Volume2 className="w-4 h-4 text-muted-foreground mt-2" />
                      </Button>
                      
                      <Button 
                        variant="outline" 
                        className="h-auto p-6 flex-col items-start bg-white/70 hover:bg-white/90 shadow-md hover:shadow-lg transition-all"
                        onClick={() => handleSpeak("Set reminders to never miss important health tasks")}
                      >
                        <div className="font-bold text-primary mb-2 text-lg">🔔 Set Reminders</div>
                        <div className="text-sm text-muted-foreground">Never miss important health tasks</div>
                        <Volume2 className="w-4 h-4 text-muted-foreground mt-2" />
                      </Button>
                    </div>
                  </Card>
                </div>
              )}
            </TabsContent>

            <TabsContent value="history" className="mt-6">
              <div className="bg-primary/5 border-l-4 border-primary p-4 rounded mb-6">
                <p className="text-sm font-medium">
                  Historical data view - {
                    userViewPreference === "detailed" 
                      ? "3-year comprehensive trend analysis of your key health metrics"
                      : "Simple 3-year overview with easy-to-read charts"
                  }
                </p>
              </div>
              
              {userViewPreference === "detailed" ? (
                <HealthTrends />
              ) : (
                <BoldHealthTrends />
              )}
            </TabsContent>
          </Tabs>
        </Card>
      </main>
    </div>
  );
};

export default Dashboard;
