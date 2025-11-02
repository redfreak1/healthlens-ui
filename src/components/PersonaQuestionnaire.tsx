import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { ChevronRight, ChevronLeft } from "lucide-react";

interface QuestionnaireProps {
  onComplete: (persona: PersonaType, responses: QuestionnaireResponses) => void;
}

export interface QuestionnaireResponses {
  trackingStyle: string;
  motivation: string;
  timeSpent: string;
  techComfort: string;
  dashboardPreference: string;
}

export type PersonaType = "detail-oriented" | "casual" | "quick-bold" | "tech-savvy" | "analytical" | "fast-action" | "health-conscious" | "balanced" | "passive" | "beginner" | "intermediate" | "power" | "snapshot" | "guided" | "action-oriented";

const questions = [
  {
    id: "trackingStyle",
    question: "How do you usually track your health goals?",
    purpose: "Measures engagement and data-driven mindset",
    options: [
      { value: "detail-oriented", label: "I log everything daily and check trends", description: "Detail-oriented user" },
      { value: "casual", label: "I update occasionally when I remember", description: "Casual user" },
      { value: "quick-bold", label: "I just want to see a summary without manual entry", description: "Quick & bold user" },
      { value: "tech-savvy", label: "I rely on wearable devices to track automatically", description: "Tech-savvy user" }
    ]
  },
  {
    id: "motivation",
    question: "What motivates you most to use this app?",
    purpose: "Reveals emotional motivation and engagement style",
    options: [
      { value: "goal-focused", label: "To improve my fitness and lifestyle", description: "Goal-focused user" },
      { value: "analytical", label: "To understand my health data deeply", description: "Analytical user" },
      { value: "fast-action", label: "To get quick insights and daily tips", description: "Fast-action user" },
      { value: "health-conscious", label: "To manage a specific medical condition", description: "Health-conscious user" }
    ]
  },
  {
    id: "timeSpent",
    question: "How much time do you usually spend reviewing your health data?",
    purpose: "Detects patience and depth of interaction",
    options: [
      { value: "fast-bold", label: "Less than 2 minutes — I prefer quick highlights", description: "Fast & bold user" },
      { value: "balanced", label: "Around 5–10 minutes — I review trends casually", description: "Balanced user" },
      { value: "detail-oriented", label: "More than 10 minutes — I analyze data in detail", description: "Detail-oriented user" },
      { value: "passive", label: "I rarely review it", description: "Passive user (needs motivation UI)" }
    ]
  },
  {
    id: "techComfort",
    question: "How comfortable are you with using technology or health devices?",
    purpose: "Determines UI complexity and feature exposure",
    options: [
      { value: "beginner", label: "I prefer simple interfaces, not too technical", description: "Beginner user" },
      { value: "intermediate", label: "I'm okay exploring new features with guidance", description: "Intermediate user" },
      { value: "power", label: "I love exploring advanced analytics and settings", description: "Power user" }
    ]
  },
  {
    id: "dashboardPreference",
    question: "What kind of insights would you like to see first on your dashboard?",
    purpose: "Helps tailor dashboard layout",
    options: [
      { value: "snapshot", label: "My current health score or vitals summary", description: "Snapshot/quick overview user" },
      { value: "analytical", label: "Detailed reports and trends", description: "Analytical user" },
      { value: "guided", label: "Personalized goals and recommendations", description: "Motivated, guided user" },
      { value: "action-oriented", label: "Reminders, tasks, or alerts", description: "Action-oriented user" }
    ]
  }
];

export const PersonaQuestionnaire = ({ onComplete }: QuestionnaireProps) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [responses, setResponses] = useState<QuestionnaireResponses>({
    trackingStyle: "",
    motivation: "",
    timeSpent: "",
    techComfort: "",
    dashboardPreference: ""
  });

  const handleResponse = (questionId: string, value: string) => {
    setResponses(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const canProceed = () => {
    const currentQuestionId = questions[currentQuestion].id;
    return responses[currentQuestionId as keyof QuestionnaireResponses] !== "";
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    } else {
      // Calculate persona based on responses
      const calculatedPersona = calculatePersona(responses);
      onComplete(calculatedPersona, responses);
    }
  };

  const handleBack = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  };

  const progress = ((currentQuestion + 1) / questions.length) * 100;
  const question = questions[currentQuestion];

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <span className="text-sm font-medium text-muted-foreground">
            Question {currentQuestion + 1} of {questions.length}
          </span>
          <span className="text-sm font-medium text-primary">
            {Math.round(progress)}% Complete
          </span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      <Card className="p-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-2">{question.question}</h2>
          <p className="text-sm text-muted-foreground italic">
            Purpose: {question.purpose}
          </p>
        </div>

        <RadioGroup
          value={responses[question.id as keyof QuestionnaireResponses]}
          onValueChange={(value) => handleResponse(question.id, value)}
          className="space-y-4"
        >
          {question.options.map((option, index) => (
            <div key={index} className="flex items-start space-x-3 p-4 rounded-lg border hover:bg-accent/50 transition-colors">
              <RadioGroupItem value={option.value} id={`option-${index}`} className="mt-1" />
              <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer">
                <div className="font-medium mb-1">{option.label}</div>
                <div className="text-sm text-muted-foreground">{option.description}</div>
              </Label>
            </div>
          ))}
        </RadioGroup>

        <div className="flex justify-between mt-8">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={currentQuestion === 0}
            className="flex items-center gap-2"
          >
            <ChevronLeft className="w-4 h-4" />
            Back
          </Button>

          <Button
            onClick={handleNext}
            disabled={!canProceed()}
            className="flex items-center gap-2"
          >
            {currentQuestion === questions.length - 1 ? "Complete Assessment" : "Next"}
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </Card>
    </div>
  );
};

// Persona calculation algorithm
function calculatePersona(responses: QuestionnaireResponses): PersonaType {
  const scores = {
    "detail-oriented": 0,
    "analytical": 0,
    "tech-savvy": 0,
    "quick-bold": 0,
    "casual": 0,
    "fast-action": 0,
    "health-conscious": 0,
    "balanced": 0,
    "passive": 0,
    "beginner": 0,
    "intermediate": 0,
    "power": 0,
    "snapshot": 0,
    "guided": 0,
    "action-oriented": 0,
    "goal-focused": 0,
    "fast-bold": 0
  };

  // Weight the responses
  const weights = {
    trackingStyle: 3,
    motivation: 2,
    timeSpent: 2,
    techComfort: 2,
    dashboardPreference: 1
  };

  // Map responses to persona scores with proper logic
  const { trackingStyle, motivation, timeSpent, techComfort, dashboardPreference } = responses;

  // Tracking Style scoring
  if (trackingStyle === "detail-oriented") scores["detail-oriented"] += weights.trackingStyle;
  if (trackingStyle === "casual") scores["casual"] += weights.trackingStyle;
  if (trackingStyle === "quick-bold") scores["quick-bold"] += weights.trackingStyle;
  if (trackingStyle === "tech-savvy") scores["tech-savvy"] += weights.trackingStyle;

  // Motivation scoring
  if (motivation === "goal-focused") scores["balanced"] += weights.motivation; // Goal-focused maps to balanced
  if (motivation === "analytical") scores["analytical"] += weights.motivation;
  if (motivation === "fast-action") scores["fast-action"] += weights.motivation;
  if (motivation === "health-conscious") scores["health-conscious"] += weights.motivation;

  // Time Spent scoring
  if (timeSpent === "fast-bold") scores["quick-bold"] += weights.timeSpent; // fast-bold reinforces quick-bold
  if (timeSpent === "balanced") scores["balanced"] += weights.timeSpent;
  if (timeSpent === "detail-oriented") scores["detail-oriented"] += weights.timeSpent;
  if (timeSpent === "passive") scores["passive"] += weights.timeSpent;

  // Tech Comfort scoring
  if (techComfort === "beginner") scores["beginner"] += weights.techComfort;
  if (techComfort === "intermediate") scores["intermediate"] += weights.techComfort;
  if (techComfort === "power") scores["power"] += weights.techComfort;

  // Dashboard Preference scoring
  if (dashboardPreference === "snapshot") scores["snapshot"] += weights.dashboardPreference;
  if (dashboardPreference === "analytical") scores["analytical"] += weights.dashboardPreference;
  if (dashboardPreference === "guided") scores["guided"] += weights.dashboardPreference;
  if (dashboardPreference === "action-oriented") scores["action-oriented"] += weights.dashboardPreference;

  // Special scoring rules for compound personas
  if (responses.trackingStyle === "detail-oriented" && responses.motivation === "analytical") {
    scores["analytical"] += 2;
  }
  
  if (responses.timeSpent === "fast-bold" && responses.dashboardPreference === "snapshot") {
    scores["quick-bold"] += 2;
  }

  if (responses.techComfort === "power" && responses.trackingStyle === "tech-savvy") {
    scores["tech-savvy"] += 2;
  }

  // Find the highest scoring persona
  const topPersona = Object.entries(scores).reduce((max, [persona, score]) => 
    score > max.score ? { persona: persona as PersonaType, score } : max,
    { persona: "balanced" as PersonaType, score: 0 }
  );

  return topPersona.persona;
}