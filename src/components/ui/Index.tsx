import { useState } from "react";
import { PersonaSwitcher, Persona } from "@/components/PersonaSwitcher";
import { SeniorQueView } from "@/components/SeniorQueView";
import { AnalystAlexView } from "@/components/AnalystAlexView";
import { AIQuerySection } from "@/components/AIQuerySection";
import { mockLabResults } from "@/data/mockLabData";
import { Activity } from "lucide-react";

const Index = () => {
  const [persona, setPersona] = useState<Persona>("senior-que");

  const handleSpeak = (text: string) => {
    if ('speechSynthesis' in window) {
      // Cancel any ongoing speech
      window.speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1;
      utterance.volume = 1;
      
      window.speechSynthesis.speak(utterance);
    } else {
      console.log("Text-to-speech not supported in this browser");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <Activity className="w-8 h-8 text-primary" />
            <div>
              <h1 className="text-2xl font-bold text-foreground">HealthLens</h1>
              <p className="text-sm text-muted-foreground">Personalized Lab Results</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="space-y-6">
          {/* Persona Switcher */}
          <PersonaSwitcher 
            selectedPersona={persona} 
            onPersonaChange={setPersona} 
          />

          {/* AI Query Section */}
          <AIQuerySection results={mockLabResults} persona={persona} />

          {/* Lab Results */}
          <div className="bg-card p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary" />
              Your Lab Results
              <span className="text-sm font-normal text-muted-foreground ml-2">
                ({mockLabResults.length} tests)
              </span>
            </h2>
            
            {persona === "senior-que" ? (
              <SeniorQueView results={mockLabResults} onSpeak={handleSpeak} />
            ) : (
              <AnalystAlexView results={mockLabResults} />
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-16 py-6 border-t border-border bg-card/50">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>HealthLens - Personalized Medical Information</p>
          <p className="mt-1">This is a demo. Always consult with your healthcare provider.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
