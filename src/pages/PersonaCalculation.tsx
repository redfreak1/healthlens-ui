import { useEffect, useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Activity, Brain, FileText, TrendingUp, CheckCircle } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { InteractionPanel } from "@/components/InteractionPanel";
import { PersonaType } from "@/components/PersonaQuestionnaire";

const PersonaCalculation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);

  // Get persona data from location state or localStorage
  const personaData = useMemo(() => location.state || {
    persona: localStorage.getItem("userPersona") || "balanced",
    responses: JSON.parse(localStorage.getItem("questionnaireResponses") || "{}"),
    profile: JSON.parse(localStorage.getItem("userProfile") || "{}"),
    permissions: JSON.parse(localStorage.getItem("userPermissions") || "{}")
  }, [location.state]);

  const steps = useMemo(() => [
    { icon: FileText, label: "Analyzing your questionnaire responses", duration: 2500 },
    { icon: TrendingUp, label: "Identifying your health preferences", duration: 2500 },
    { icon: Brain, label: "Processing behavioral indicators", duration: 2500 },
    { icon: CheckCircle, label: "Finalizing your personalized interface", duration: 2000 },
  ], []);

  useEffect(() => {
    const totalDuration = steps.reduce((acc, step) => acc + step.duration, 0);
    let elapsed = 0;

    const interval = setInterval(() => {
      elapsed += 100;
      const newProgress = Math.min((elapsed / totalDuration) * 100, 100);
      setProgress(newProgress);

      // Update current step
      let cumulativeDuration = 0;
      for (let i = 0; i < steps.length; i++) {
        cumulativeDuration += steps[i].duration;
        if (elapsed < cumulativeDuration) {
          setCurrentStep(i);
          break;
        }
      }

      if (elapsed >= totalDuration) {
        clearInterval(interval);
        setTimeout(() => navigate("/persona-landing", { state: personaData }), 500);
      }
    }, 100);

    return () => clearInterval(interval);
  }, [navigate, personaData, steps]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 p-4">
      <div className="container mx-auto max-w-7xl grid lg:grid-cols-2 gap-6 py-8">
        <Card className="w-full p-8 md:p-12 shadow-xl h-fit">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-primary/10 rounded-full mb-6 animate-pulse">
            <Activity className="w-10 h-10 text-primary" />
          </div>
          <h2 className="text-3xl font-bold mb-3">Analyzing Your Health Profile</h2>
          <p className="text-muted-foreground text-lg">
            This will take approximately 15-30 seconds
          </p>
        </div>

        <div className="mb-8">
          <Progress value={progress} className="h-3 mb-2" />
          <p className="text-sm text-center text-muted-foreground">
            {Math.round(progress)}% Complete
          </p>
        </div>

        <div className="space-y-4">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isActive = index === currentStep;
            const isComplete = index < currentStep || progress === 100;

            return (
              <div
                key={index}
                className={`flex items-center gap-4 p-4 rounded-lg border transition-all ${
                  isActive
                    ? "border-primary bg-primary/5 scale-105"
                    : isComplete
                    ? "border-medical-safe bg-medical-safe/5"
                    : "border-border bg-card"
                }`}
              >
                <div
                  className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${
                    isActive
                      ? "bg-primary text-primary-foreground animate-pulse"
                      : isComplete
                      ? "bg-medical-safe text-medical-safe-foreground"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  <Icon className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <p
                    className={`font-medium ${
                      isActive ? "text-primary" : isComplete ? "text-medical-safe" : "text-muted-foreground"
                    }`}
                  >
                    {step.label}
                  </p>
                </div>
                {isComplete && (
                  <CheckCircle className="w-5 h-5 text-medical-safe flex-shrink-0" />
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-8 text-center">
          <p className="text-sm text-muted-foreground">
            Processing your last 3 months of health data...
          </p>
        </div>
      </Card>

      <div className="w-full">
        <InteractionPanel />
      </div>
      </div>
    </div>
  );
};

export default PersonaCalculation;
