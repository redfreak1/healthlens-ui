import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Activity, Heart, Bell, FileText, Smartphone, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { PersonaQuestionnaire, PersonaType, QuestionnaireResponses } from "@/components/PersonaQuestionnaire";
import { api, UserProfile, PersonaCalculationRequest } from "@/lib/api";
import { getCurrentUserId } from "@/lib/user";

const Onboarding = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<"profile" | "questionnaire">("profile");
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [userProfileData, setUserProfileData] = useState<UserProfile | null>(null);
  const [permissions, setPermissions] = useState({
    medicalRecords: false,
    healthApps: false,
    notifications: false,
  });
  const [profile, setProfile] = useState({
    age: "",
    gender: "",
    conditions: "",
  });

  // Fetch user profile data on component mount
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setIsLoadingProfile(true);
        
        // Get the current user ID from login
        const currentUserId = getCurrentUserId();
        
        const profileData = await api.data.getUserProfile(currentUserId);
        setUserProfileData(profileData);
        
        // Store in localStorage for use in other places
        localStorage.setItem('userProfileData', JSON.stringify(profileData));
        
        // Pre-populate form if profile exists
        if (profileData) {
          setProfile({
            age: profileData.age?.toString() || "",
            gender: profileData.gender || "",
            conditions: profileData.conditions || "",
          });
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
      } finally {
        setIsLoadingProfile(false);
      }
    };

    fetchUserProfile();
  }, []);

  const handleGetStarted = () => {
    setStep("questionnaire");
  };

  const handleQuestionnaireComplete = async (localPersona: PersonaType, responses: QuestionnaireResponses) => {
    try {
      setIsLoadingProfile(true); // Reuse loading state for persona calculation
      
      // Get the current user ID from login
      const currentUserId = getCurrentUserId();
      
      // Prepare API request payload
      const userProfile: UserProfile = userProfileData || {
        user_id: currentUserId,
        age: parseInt(profile.age) || 25,
        gender: profile.gender || "Not specified",
        conditions: profile.conditions || "None"
      };

      const questionnaireResponses = {
        tracking_style: responses.trackingStyle,
        motivation: responses.motivation,
        time_spent: responses.timeSpent,
        tech_comfort: responses.techComfort,
        dashboard_preference: responses.dashboardPreference
      };

      // Call persona calculation API using centralized API client
      const personaResult = await api.persona.calculate(userProfile, questionnaireResponses);
      
      // Store API results in localStorage
      localStorage.setItem("userPersona", personaResult.persona);
      localStorage.setItem("personaConfidence", personaResult.confidence.toString());
      localStorage.setItem("personaReasoning", personaResult.reasoning);
      localStorage.setItem("questionnaireResponses", JSON.stringify(responses));
      localStorage.setItem("userProfile", JSON.stringify(profile));
      localStorage.setItem("userPermissions", JSON.stringify(permissions));
      
      // Navigate to persona calculation with the API result
      navigate("/persona-calculation", { 
        state: { 
          persona: personaResult.persona, 
          confidence: personaResult.confidence,
          reasoning: personaResult.reasoning,
          responses, 
          profile, 
          permissions 
        } 
      });
      
    } catch (error) {
      console.error('Error calculating persona:', error);
      // Fall back to local calculation if API call fails
      localStorage.setItem("userPersona", localPersona);
      localStorage.setItem("questionnaireResponses", JSON.stringify(responses));
      localStorage.setItem("userProfile", JSON.stringify(profile));
      localStorage.setItem("userPermissions", JSON.stringify(permissions));
      
      navigate("/persona-calculation", { state: { persona: localPersona, responses, profile, permissions } });
    } finally {
      setIsLoadingProfile(false);
    }
  };

  // Show loading state while fetching profile or calculating persona
  if (isLoadingProfile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="p-8 text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-primary" />
          <h3 className="text-xl font-bold mb-2">
            {step === "questionnaire" ? "Calculating Your Persona" : "Loading Your Profile"}
          </h3>
          <p className="text-muted-foreground">
            {step === "questionnaire" 
              ? "Analyzing your responses to create your personalized experience..." 
              : "Fetching your health data..."
            }
          </p>
        </Card>
      </div>
    );
  }

  if (step === "questionnaire") {
    return (
      <div className="min-h-screen bg-background">
        <header className="bg-card border-b border-border shadow-sm">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center gap-3">
              <Activity className="w-8 h-8 text-primary" />
              <div>
                <h1 className="text-2xl font-bold text-foreground">HealthLens</h1>
                <p className="text-sm text-muted-foreground">Persona Assessment</p>
              </div>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-12">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Let's Personalize Your Experience
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Answer a few questions to help us create the perfect health dashboard for you.
            </p>
          </div>
          
          <PersonaQuestionnaire onComplete={handleQuestionnaireComplete} />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-border shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <Activity className="w-8 h-8 text-primary" />
            <div>
              <h1 className="text-2xl font-bold text-foreground">HealthLens</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12 max-w-3xl">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Welcome to Your Health Journey
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            HealthLens adapts to your unique health profile, providing personalized insights
            and recommendations tailored just for you.
          </p>
        </div>

        <Card className="p-8 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <FileText className="w-6 h-6 text-primary" />
            <h3 className="text-2xl font-bold">Data Permissions</h3>
          </div>
          <p className="text-muted-foreground mb-6">
            To provide the best personalized experience, we need your permission to access:
          </p>

          <div className="space-y-4">
            <div className="flex items-start gap-3 p-4 border border-border rounded-lg hover:bg-accent/5 transition-colors">
              <Checkbox
                id="medical"
                checked={permissions.medicalRecords}
                onCheckedChange={(checked) =>
                  setPermissions({ ...permissions, medicalRecords: checked as boolean })
                }
                className="mt-1"
              />
              <div className="flex-1">
                <label htmlFor="medical" className="font-medium cursor-pointer">
                  Medical Records & Lab Results
                </label>
                <p className="text-sm text-muted-foreground mt-1">
                  Access your lab test results and medical history for personalized analysis
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 border border-border rounded-lg hover:bg-accent/5 transition-colors">
              <Checkbox
                id="health-apps"
                checked={permissions.healthApps}
                onCheckedChange={(checked) =>
                  setPermissions({ ...permissions, healthApps: checked as boolean })
                }
                className="mt-1"
              />
              <div className="flex-1">
                <label htmlFor="health-apps" className="font-medium cursor-pointer">
                  Health App Integrations
                </label>
                <p className="text-sm text-muted-foreground mt-1">
                  Connect with Apple Health, Google Fit, and other health apps
                </p>
              </div>
              <div className="flex gap-2">
                <Smartphone className="w-5 h-5 text-muted-foreground" />
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 border border-border rounded-lg hover:bg-accent/5 transition-colors">
              <Checkbox
                id="notifications"
                checked={permissions.notifications}
                onCheckedChange={(checked) =>
                  setPermissions({ ...permissions, notifications: checked as boolean })
                }
                className="mt-1"
              />
              <div className="flex-1">
                <label htmlFor="notifications" className="font-medium cursor-pointer">
                  Notifications & Reminders
                </label>
                <p className="text-sm text-muted-foreground mt-1">
                  Receive health insights, medication reminders, and test notifications
                </p>
              </div>
              <Bell className="w-5 h-5 text-muted-foreground" />
            </div>
          </div>
        </Card>

        <Card className="p-8 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <Heart className="w-6 h-6 text-primary" />
            <h3 className="text-2xl font-bold">Basic Health Profile (Optional)</h3>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Age</label>
              <Input
                type="number"
                placeholder="e.g., 35"
                value={profile.age}
                onChange={(e) => setProfile({ ...profile, age: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Gender</label>
              <Input
                placeholder="e.g., Female"
                value={profile.gender}
                onChange={(e) => setProfile({ ...profile, gender: e.target.value })}
              />
            </div>
            <div className="md:col-span-2">
              <label className="text-sm font-medium mb-2 block">
                Existing Health Conditions
              </label>
              <Input
                placeholder="e.g., Type 2 Diabetes, Hypertension"
                value={profile.conditions}
                onChange={(e) => setProfile({ ...profile, conditions: e.target.value })}
              />
            </div>
          </div>
        </Card>

        <Button onClick={handleGetStarted} className="w-full h-12 text-lg" size="lg">
          Get Started
        </Button>

        <p className="text-center text-sm text-muted-foreground mt-4">
          Your data is encrypted and HIPAA-compliant. We never share your health information.
        </p>
      </main>
    </div>
  );
};

export default Onboarding;
