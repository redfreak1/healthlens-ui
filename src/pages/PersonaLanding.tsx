import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity, Star, TrendingUp, CheckCircle, Target, Loader2 } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { PersonaType } from "@/components/PersonaQuestionnaire";
import { api, PersonaInfo } from "@/lib/api";

const PersonaLanding = () => {
  const navigate = useNavigate();
  const location = useLocation();
  // Get the calculated persona from navigation state or localStorage
  const calculatedPersona = location.state?.persona || localStorage.getItem("userPersona") || "balanced";
  
  // Determine view based on persona type
  const getViewFromPersona = (persona: string): "bold" | "detailed" => {
    // Map personas to view types
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

  const [view, setView] = useState<"bold" | "detailed">(() => getViewFromPersona(calculatedPersona));
  const [personaInfo, setPersonaInfo] = useState<PersonaInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const confidence = location.state?.confidence || localStorage.getItem("personaConfidence");
  const reasoning = location.state?.reasoning || localStorage.getItem("personaReasoning");
  const questionnaireResponses = location.state?.responses || JSON.parse(localStorage.getItem("questionnaireResponses") || "{}");

  // Auto-save persona-based view preference to localStorage
  useEffect(() => {
    const personaBasedView = getViewFromPersona(calculatedPersona);
    setView(personaBasedView);
    localStorage.setItem("userViewPreference", personaBasedView);
  }, [calculatedPersona]);

  // Fetch persona info from API
  useEffect(() => {
    const fetchPersonaInfo = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const apiPersonaInfo = await api.persona.getInfo(calculatedPersona);
        setPersonaInfo(apiPersonaInfo);
      } catch (err) {
        console.error('Failed to fetch persona info:', err);
        setError('Failed to load persona information');
        // Fall back to hardcoded data
        setPersonaInfo(getPersonaInfoFallback(calculatedPersona));
      } finally {
        setIsLoading(false);
      }
    };

    fetchPersonaInfo();
  }, [calculatedPersona]);

  const getPersonaInfoFallback = (persona: PersonaType): PersonaInfo => {
    const personaConfigs = {
      "detail-oriented": {
        persona: "detail-oriented",
        name: "THE ANALYST",
        category: "Detail-Focused Management",
        description: "You love diving deep into your health data and tracking every detail",
        strengths: ["Thorough data analysis", "Consistent tracking", "Pattern recognition"],
        focus_areas: ["Avoid analysis paralysis", "Set actionable goals"],
        dashboard_type: "Comprehensive analytics with detailed charts and trends"
      },
      "analytical": {
        persona: "analytical",
        name: "THE RESEARCHER",
        category: "Data-Driven Health",
        description: "You prefer evidence-based insights and comprehensive health reports",
        strengths: ["Scientific approach", "Trend analysis", "Risk assessment"],
        focus_areas: ["Balance data with action", "Simplify complex insights"],
        dashboard_type: "Advanced analytics with research-backed recommendations"
      },
      "tech-savvy": {
        persona: "tech-savvy",
        name: "THE INNOVATOR",
        category: "Technology-Enhanced Health",
        description: "You leverage technology and devices to automate your health tracking",
        strengths: ["Device integration", "Automation", "Tech adoption"],
        focus_areas: ["Data accuracy validation", "Human touch points"],
        dashboard_type: "Connected dashboard with device integrations"
      },
      "quick-bold": {
        persona: "quick-bold",
        name: "THE ACHIEVER",
        category: "Fast-Action Health",
        description: "You want quick insights and immediate actionable recommendations",
        strengths: ["Quick decision making", "Goal-oriented", "Action-focused"],
        focus_areas: ["Patience for long-term trends", "Detailed planning"],
        dashboard_type: "Streamlined view with key metrics and instant actions"
      },
      "casual": {
        persona: "casual",
        name: "THE BALANCED",
        category: "Flexible Health Management",
        description: "You prefer a moderate approach to health tracking and management",
        strengths: ["Realistic expectations", "Flexible approach", "Sustainable habits"],
        focus_areas: ["Consistency building", "Goal setting"],
        dashboard_type: "Simple overview with gentle reminders and tips"
      },
      "fast-action": {
        persona: "fast-action",
        name: "THE SPRINTER",
        category: "Immediate Impact Focus",
        description: "You want quick wins and immediate health improvements",
        strengths: ["Quick implementation", "High motivation", "Results-driven"],
        focus_areas: ["Long-term sustainability", "Patience with gradual changes"],
        dashboard_type: "Action-oriented dashboard with immediate recommendations"
      },
      "health-conscious": {
        persona: "health-conscious",
        name: "THE GUARDIAN",
        category: "Preventive Health Focus",
        description: "You prioritize managing specific health conditions and prevention",
        strengths: ["Health awareness", "Preventive mindset", "Medical compliance"],
        focus_areas: ["Stress management", "Lifestyle balance"],
        dashboard_type: "Condition-focused dashboard with medical insights"
      },
      "balanced": {
        persona: "balanced",
        name: "THE HARMONIZER",
        category: "Holistic Health Approach",
        description: "You seek a well-rounded approach to health and wellness",
        strengths: ["Holistic thinking", "Life balance", "Sustainable practices"],
        focus_areas: ["Specific goal targeting", "Measurement consistency"],
        dashboard_type: "Balanced dashboard with all aspects of health"
      },
      "passive": {
        persona: "passive",
        name: "THE OBSERVER",
        category: "Guided Health Journey",
        description: "You prefer gentle guidance and motivation to engage with health data",
        strengths: ["Receptive to guidance", "Low pressure approach", "Steady progress"],
        focus_areas: ["Engagement building", "Habit formation"],
        dashboard_type: "Motivational dashboard with guided experiences"
      },
      "beginner": {
        persona: "beginner",
        name: "THE LEARNER",
        category: "Simple Health Start",
        description: "You prefer straightforward, easy-to-understand health information",
        strengths: ["Willingness to learn", "Appreciation for simplicity", "Step-by-step approach"],
        focus_areas: ["Building confidence", "Gradual complexity increase"],
        dashboard_type: "Simplified interface with educational content"
      },
      "intermediate": {
        persona: "intermediate",
        name: "THE EXPLORER",
        category: "Growing Health Knowledge",
        description: "You're comfortable with moderate complexity and guided exploration",
        strengths: ["Growth mindset", "Balanced complexity", "Guided learning"],
        focus_areas: ["Advanced feature adoption", "Independent decision making"],
        dashboard_type: "Progressive interface with optional advanced features"
      },
      "power": {
        persona: "power",
        name: "THE COMMANDER",
        category: "Advanced Health Control",
        description: "You want full control over your health data with advanced features",
        strengths: ["Advanced feature usage", "Customization", "Complex analysis"],
        focus_areas: ["Time management", "Avoiding over-optimization"],
        dashboard_type: "Fully customizable dashboard with all available features"
      },
      "snapshot": {
        persona: "snapshot",
        name: "THE OVERVIEW",
        category: "Quick Health Status",
        description: "You prefer high-level summaries and key health indicators",
        strengths: ["Efficiency focus", "Key metric identification", "Quick assessment"],
        focus_areas: ["Detail exploration when needed", "Trend awareness"],
        dashboard_type: "Summary dashboard with key health scores"
      },
      "guided": {
        persona: "guided",
        name: "THE NAVIGATOR",
        category: "Goal-Oriented Health",
        description: "You want personalized recommendations and clear health goals",
        strengths: ["Goal commitment", "Guidance following", "Progress tracking"],
        focus_areas: ["Self-directed exploration", "Flexibility in approach"],
        dashboard_type: "Goal-focused dashboard with personalized recommendations"
      },
      "action-oriented": {
        persona: "action-oriented",
        name: "THE EXECUTOR",
        category: "Task-Driven Health",
        description: "You prefer clear tasks, reminders, and actionable health steps",
        strengths: ["Task completion", "Organization", "Consistent action"],
        focus_areas: ["Big picture thinking", "Flexibility in timing"],
        dashboard_type: "Task-focused dashboard with reminders and action items"
      }
    };

    return personaConfigs[persona] || personaConfigs.balanced;
  };

  // Show loading state while fetching persona info
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-accent/10 flex items-center justify-center">
        <Card className="p-8 text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-primary" />
          <h3 className="text-xl font-bold mb-2">Loading Your Persona Details</h3>
          <p className="text-muted-foreground">
            Fetching personalized insights from our AI...
          </p>
        </Card>
      </div>
    );
  }

  // Show error state if persona info failed to load
  if (error || !personaInfo) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-accent/10 flex items-center justify-center">
        <Card className="p-8 text-center">
          <h3 className="text-xl font-bold mb-2 text-destructive">Unable to Load Persona</h3>
          <p className="text-muted-foreground mb-4">
            We couldn't fetch your persona details. You can still continue to your dashboard.
          </p>
          <Button onClick={() => navigate("/dashboard")}>
            Go to Dashboard
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-accent/10">
      <header className="bg-card/80 backdrop-blur-sm border-b border-border shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <Activity className="w-8 h-8 text-primary" />
            <h1 className="text-2xl font-bold text-foreground">HealthLens</h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="text-center mb-8 space-y-4">
          <div className="inline-flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full">
            <Star className="w-5 h-5 text-primary" />
            <span className="text-sm font-medium text-primary">Your Health Persona is Ready!</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold">
            Meet Your Health Persona
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Based on your health data, behavioral patterns, and lab results from the last 3 months
          </p>
        </div>

        {/* View Toggle - Commented out as view is now determined by persona
        <div className="flex justify-center gap-2 mb-8">
          <Button
            variant={view === "bold" ? "default" : "outline"}
            onClick={() => {
              setView("bold");
              localStorage.setItem("userViewPreference", "bold");
            }}
          >
            Bold View
          </Button>
          <Button
            variant={view === "detailed" ? "default" : "outline"}
            onClick={() => {
              setView("detailed");
              localStorage.setItem("userViewPreference", "detailed");
            }}
          >
            Detailed View
          </Button>
        </div>
        */}

        {view === "bold" ? (
          <Card className="p-8 md:p-12 mb-8 bg-gradient-to-br from-card to-card/80 border-2 border-primary/20 shadow-xl">
            <div className="text-center mb-8">
              <div className="inline-block bg-gradient-to-br from-primary to-accent p-8 rounded-3xl mb-6 shadow-lg">
                <h3 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-2">
                  {personaInfo.name}
                </h3>
                <div className="flex items-center justify-center gap-2 mb-3">
                  <Star className="w-8 h-8 text-yellow-300 fill-yellow-300" />
                  <span className="text-2xl font-bold text-primary-foreground">
                    MATCHED
                  </span>
                </div>
                {confidence && (
                  <div className="text-primary-foreground/90 text-sm">
                    Confidence: {Math.round(parseFloat(confidence) * 100)}%
                  </div>
                )}
              </div>
              <Badge className="text-lg px-4 py-2" variant="secondary">
                {personaInfo.category}
              </Badge>
            </div>

            <div className="mb-6 p-6 bg-accent/10 rounded-lg">
              <p className="text-lg text-center text-muted-foreground italic">
                "{personaInfo.description}"
              </p>
            </div>

            {reasoning && (
              <div className="mb-6 p-6 bg-primary/10 rounded-lg">
                <h4 className="text-lg font-bold mb-3 text-center">Why This Persona Fits You</h4>
                <p className="text-muted-foreground text-center">
                  {reasoning}
                </p>
              </div>
            )}

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle className="w-6 h-6 text-medical-safe" />
                  <h4 className="text-xl font-bold">Key Strengths</h4>
                </div>
                {(personaInfo.strengths || []).map((strength, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-2 p-3 bg-medical-safe/10 rounded-lg border border-medical-safe/20"
                  >
                    <div className="w-2 h-2 rounded-full bg-medical-safe mt-2"></div>
                    <p className="text-lg">{strength}</p>
                  </div>
                ))}
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2 mb-3">
                  <Target className="w-6 h-6 text-primary" />
                  <h4 className="text-xl font-bold">Focus Areas</h4>
                </div>
                {(personaInfo.focus_areas || []).map((area, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-2 p-3 bg-primary/10 rounded-lg border border-primary/20"
                  >
                    <div className="w-2 h-2 rounded-full bg-primary mt-2"></div>
                    <p className="text-lg">{area}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-8 p-6 bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg">
              <h4 className="text-xl font-bold mb-3">Your Personalized Dashboard</h4>
              <p className="text-muted-foreground mb-3">
                {personaInfo.dashboard_type}
              </p>
              <div className="flex items-center gap-2 mt-3">
                <Badge variant={view === "bold" ? "default" : "secondary"} className="capitalize">
                  {view === "bold" ? "🚀 Bold View" : "📊 Detailed View"}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  - Optimized for your {calculatedPersona.replace('-', ' ')} persona
                </span>
              </div>
            </div>
          </Card>
        ) : (
          <Card className="p-8 mb-8">
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-3xl font-bold mb-2">{personaInfo.name}</h3>
                  <Badge className="text-base" variant="secondary">
                    {personaInfo.category}
                  </Badge>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-primary mb-1">
                    PERSONA
                  </div>
                  <div className="text-muted-foreground">
                    {confidence ? `${Math.round(parseFloat(confidence) * 100)}% Match` : 'Calculated'}
                  </div>
                </div>
              </div>
              
              <div className="mb-6 p-4 bg-accent/10 rounded-lg">
                <p className="text-muted-foreground">
                  "{personaInfo.description}"
                </p>
              </div>
              
              {reasoning && (
                <div className="mb-6">
                  <h4 className="text-lg font-bold mb-3">Analysis Reasoning:</h4>
                  <p className="text-muted-foreground">
                    {reasoning}
                  </p>
                </div>
              )}

              <div className="mb-6">
                <h4 className="text-lg font-bold mb-3">Your Dashboard will feature:</h4>
                <p className="text-muted-foreground mb-3">
                  {personaInfo.dashboard_type}
                </p>
                <div className="flex items-center gap-2">
                  <Badge variant={view === "bold" ? "default" : "secondary"} className="capitalize">
                    {view === "bold" ? "🚀 Bold View" : "📊 Detailed View"}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    - Auto-selected for {calculatedPersona.replace('-', ' ')} persona
                  </span>
                </div>
              </div>
            </div>

            <div className="mb-8">
              <h4 className="text-xl font-bold mb-4">Your Questionnaire Results</h4>
              <div className="grid sm:grid-cols-2 gap-4">
                <Card className="p-4 bg-accent/5">
                  <div className="text-sm text-muted-foreground mb-1">Health Tracking Style</div>
                  <div className="text-lg font-medium capitalize">{questionnaireResponses.trackingStyle?.replace('-', ' ')}</div>
                </Card>
                <Card className="p-4 bg-accent/5">
                  <div className="text-sm text-muted-foreground mb-1">Primary Motivation</div>
                  <div className="text-lg font-medium capitalize">{questionnaireResponses.motivation?.replace('-', ' ')}</div>
                </Card>
                <Card className="p-4 bg-accent/5">
                  <div className="text-sm text-muted-foreground mb-1">Time Preference</div>
                  <div className="text-lg font-medium capitalize">{questionnaireResponses.timeSpent?.replace('-', ' ')}</div>
                </Card>
                <Card className="p-4 bg-accent/5">
                  <div className="text-sm text-muted-foreground mb-1">Tech Comfort</div>
                  <div className="text-lg font-medium capitalize">{questionnaireResponses.techComfort}</div>
                </Card>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <h4 className="text-lg font-bold mb-3 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-medical-safe" />
                    Key Strengths
                  </h4>
                  {(personaInfo.strengths || []).map((strength, index) => (
                    <div key={index} className="flex items-start gap-2 mb-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-medical-safe mt-2"></div>
                      <p className="text-sm">{strength}</p>
                    </div>
                  ))}
                </div>
                <div>
                  <h4 className="text-lg font-bold mb-3 flex items-center gap-2">
                    <Target className="w-5 h-5 text-primary" />
                    Focus Areas
                  </h4>
                  {(personaInfo.focus_areas || []).map((area, index) => (
                    <div key={index} className="flex items-start gap-2 mb-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2"></div>
                      <p className="text-sm">{area}</p>
                    </div>
                  ))}
                </div>
              </div>

              <Card className="p-6 bg-gradient-to-br from-primary/10 to-accent/10">
                <div className="flex items-center gap-2 mb-4">
                  <Activity className="w-6 h-6 text-primary" />
                  <h4 className="text-lg font-bold">What's Next?</h4>
                </div>
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    Your personalized dashboard is ready! It's been tailored to match your <strong>{calculatedPersona}</strong> persona preferences.
                  </p>
                  <p className="text-sm text-muted-foreground">
                    You'll see health insights presented in a way that matches your preferred style and complexity level.
                  </p>
                </div>
              </Card>
            </div>
          </Card>
        )}

        <div className="text-center">
          <Button onClick={() => navigate("/dashboard")} size="lg" className="px-8">
            View Your Dashboard
          </Button>
        </div>
      </main>
    </div>
  );
};

export default PersonaLanding;
