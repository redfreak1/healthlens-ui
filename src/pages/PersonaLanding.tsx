import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity, Star, TrendingUp, CheckCircle, Target } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { PersonaType } from "@/components/PersonaQuestionnaire";

const PersonaLanding = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [view, setView] = useState<"bold" | "detailed">("bold");

  // Get the calculated persona from navigation state or localStorage
  const calculatedPersona = location.state?.persona || localStorage.getItem("userPersona") || "balanced";
  const questionnaireResponses = location.state?.responses || JSON.parse(localStorage.getItem("questionnaireResponses") || "{}");

  const getPersonaInfo = (persona: PersonaType) => {
    const personaConfigs = {
      "detail-oriented": {
        name: "THE ANALYST",
        category: "Detail-Focused Management",
        description: "You love diving deep into your health data and tracking every detail",
        strengths: ["Thorough data analysis", "Consistent tracking", "Pattern recognition"],
        focusAreas: ["Avoid analysis paralysis", "Set actionable goals"],
        dashboardType: "Comprehensive analytics with detailed charts and trends"
      },
      "analytical": {
        name: "THE RESEARCHER",
        category: "Data-Driven Health",
        description: "You prefer evidence-based insights and comprehensive health reports",
        strengths: ["Scientific approach", "Trend analysis", "Risk assessment"],
        focusAreas: ["Balance data with action", "Simplify complex insights"],
        dashboardType: "Advanced analytics with research-backed recommendations"
      },
      "tech-savvy": {
        name: "THE INNOVATOR",
        category: "Technology-Enhanced Health",
        description: "You leverage technology and devices to automate your health tracking",
        strengths: ["Device integration", "Automation", "Tech adoption"],
        focusAreas: ["Data accuracy validation", "Human touch points"],
        dashboardType: "Connected dashboard with device integrations"
      },
      "quick-bold": {
        name: "THE ACHIEVER",
        category: "Fast-Action Health",
        description: "You want quick insights and immediate actionable recommendations",
        strengths: ["Quick decision making", "Goal-oriented", "Action-focused"],
        focusAreas: ["Patience for long-term trends", "Detailed planning"],
        dashboardType: "Streamlined view with key metrics and instant actions"
      },
      "casual": {
        name: "THE BALANCED",
        category: "Flexible Health Management",
        description: "You prefer a moderate approach to health tracking and management",
        strengths: ["Realistic expectations", "Flexible approach", "Sustainable habits"],
        focusAreas: ["Consistency building", "Goal setting"],
        dashboardType: "Simple overview with gentle reminders and tips"
      },
      "fast-action": {
        name: "THE SPRINTER",
        category: "Immediate Impact Focus",
        description: "You want quick wins and immediate health improvements",
        strengths: ["Quick implementation", "High motivation", "Results-driven"],
        focusAreas: ["Long-term sustainability", "Patience with gradual changes"],
        dashboardType: "Action-oriented dashboard with immediate recommendations"
      },
      "health-conscious": {
        name: "THE GUARDIAN",
        category: "Preventive Health Focus",
        description: "You prioritize managing specific health conditions and prevention",
        strengths: ["Health awareness", "Preventive mindset", "Medical compliance"],
        focusAreas: ["Stress management", "Lifestyle balance"],
        dashboardType: "Condition-focused dashboard with medical insights"
      },
      "balanced": {
        name: "THE HARMONIZER",
        category: "Holistic Health Approach",
        description: "You seek a well-rounded approach to health and wellness",
        strengths: ["Holistic thinking", "Life balance", "Sustainable practices"],
        focusAreas: ["Specific goal targeting", "Measurement consistency"],
        dashboardType: "Balanced dashboard with all aspects of health"
      },
      "passive": {
        name: "THE OBSERVER",
        category: "Guided Health Journey",
        description: "You prefer gentle guidance and motivation to engage with health data",
        strengths: ["Receptive to guidance", "Low pressure approach", "Steady progress"],
        focusAreas: ["Engagement building", "Habit formation"],
        dashboardType: "Motivational dashboard with guided experiences"
      },
      "beginner": {
        name: "THE LEARNER",
        category: "Simple Health Start",
        description: "You prefer straightforward, easy-to-understand health information",
        strengths: ["Willingness to learn", "Appreciation for simplicity", "Step-by-step approach"],
        focusAreas: ["Building confidence", "Gradual complexity increase"],
        dashboardType: "Simplified interface with educational content"
      },
      "intermediate": {
        name: "THE EXPLORER",
        category: "Growing Health Knowledge",
        description: "You're comfortable with moderate complexity and guided exploration",
        strengths: ["Growth mindset", "Balanced complexity", "Guided learning"],
        focusAreas: ["Advanced feature adoption", "Independent decision making"],
        dashboardType: "Progressive interface with optional advanced features"
      },
      "power": {
        name: "THE COMMANDER",
        category: "Advanced Health Control",
        description: "You want full control over your health data with advanced features",
        strengths: ["Advanced feature usage", "Customization", "Complex analysis"],
        focusAreas: ["Time management", "Avoiding over-optimization"],
        dashboardType: "Fully customizable dashboard with all available features"
      },
      "snapshot": {
        name: "THE OVERVIEW",
        category: "Quick Health Status",
        description: "You prefer high-level summaries and key health indicators",
        strengths: ["Efficiency focus", "Key metric identification", "Quick assessment"],
        focusAreas: ["Detail exploration when needed", "Trend awareness"],
        dashboardType: "Summary dashboard with key health scores"
      },
      "guided": {
        name: "THE NAVIGATOR",
        category: "Goal-Oriented Health",
        description: "You want personalized recommendations and clear health goals",
        strengths: ["Goal commitment", "Guidance following", "Progress tracking"],
        focusAreas: ["Self-directed exploration", "Flexibility in approach"],
        dashboardType: "Goal-focused dashboard with personalized recommendations"
      },
      "action-oriented": {
        name: "THE EXECUTOR",
        category: "Task-Driven Health",
        description: "You prefer clear tasks, reminders, and actionable health steps",
        strengths: ["Task completion", "Organization", "Consistent action"],
        focusAreas: ["Big picture thinking", "Flexibility in timing"],
        dashboardType: "Task-focused dashboard with reminders and action items"
      }
    };

    return personaConfigs[persona] || personaConfigs.balanced;
  };

  const personaInfo = getPersonaInfo(calculatedPersona);

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

        {/* View Toggle */}
        <div className="flex justify-center gap-2 mb-8">
          <Button
            variant={view === "bold" ? "default" : "outline"}
            onClick={() => setView("bold")}
          >
            Bold View
          </Button>
          <Button
            variant={view === "detailed" ? "default" : "outline"}
            onClick={() => setView("detailed")}
          >
            Detailed View
          </Button>
        </div>

        {view === "bold" ? (
          <Card className="p-8 md:p-12 mb-8 bg-gradient-to-br from-card to-card/80 border-2 border-primary/20 shadow-xl">
            <div className="text-center mb-8">
              <div className="inline-block bg-gradient-to-br from-primary to-accent p-8 rounded-3xl mb-6 shadow-lg">
                <h3 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-2">
                  {personaInfo.name}
                </h3>
                <div className="flex items-center justify-center gap-2">
                  <Star className="w-8 h-8 text-yellow-300 fill-yellow-300" />
                  <span className="text-2xl font-bold text-primary-foreground">
                    MATCHED
                  </span>
                </div>
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

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle className="w-6 h-6 text-medical-safe" />
                  <h4 className="text-xl font-bold">Key Strengths</h4>
                </div>
                {personaInfo.strengths.map((strength, index) => (
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
                {personaInfo.focusAreas.map((area, index) => (
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
              <p className="text-muted-foreground">
                {personaInfo.dashboardType}
              </p>
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
                  <div className="text-muted-foreground">Calculated</div>
                </div>
              </div>
              
              <div className="mb-6 p-4 bg-accent/10 rounded-lg">
                <p className="text-muted-foreground">
                  "{personaInfo.description}"
                </p>
              </div>
              
              <div className="mb-6">
                <h4 className="text-lg font-bold mb-3">Your Dashboard will feature:</h4>
                <p className="text-muted-foreground">
                  {personaInfo.dashboardType}
                </p>
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
                  {personaInfo.strengths.map((strength, index) => (
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
                  {personaInfo.focusAreas.map((area, index) => (
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
