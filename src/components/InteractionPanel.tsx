import { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Mic, MicOff, MessageSquare, Send, Volume2, VolumeX, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { api, LabResult, AIPromptResponse } from "@/lib/api";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface InteractionPanelProps {
  labResults?: LabResult[];
  persona?: string;
}

export const InteractionPanel = ({ labResults = [], persona }: InteractionPanelProps) => {
  const [mode, setMode] = useState<"chat" | "speech">("chat");
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hello! I'm here to help you understand your health data. Ask me anything about your lab results.",
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiPromptContext, setAiPromptContext] = useState<AIPromptResponse | null>(null);
  const [recognition, setRecognition] = useState<any>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Get user persona from localStorage or props
  const userPersona = persona || localStorage.getItem("userPersona") || "balanced";

  // Scroll to bottom function
  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
      const scrollElement = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollElement) {
        scrollElement.scrollTo({
          top: scrollElement.scrollHeight,
          behavior: 'smooth'
        });
      }
    }
  };

  // Initialize AI context and speech recognition
  useEffect(() => {
    // Fetch AI prompt context for persona
    const fetchAIContext = async () => {
      try {
        const promptResponse = await api.ai.getPrompt(userPersona);
        setAiPromptContext(promptResponse);
      } catch (error) {
        console.warn('Failed to fetch AI prompt context:', error);
        // Continue without AI context
      }
    };

    fetchAIContext();

    // Initialize speech recognition
    if (typeof window !== "undefined" && "webkitSpeechRecognition" in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition;
      const recognitionInstance = new SpeechRecognition();
      recognitionInstance.continuous = false;
      recognitionInstance.interimResults = false;
      recognitionInstance.lang = "en-US";

      recognitionInstance.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        handleUserInput(transcript);
        setIsListening(false);
      };

      recognitionInstance.onerror = (event: any) => {
        console.error("Speech recognition error:", event.error);
        setIsListening(false);
        toast({
          title: "Speech Recognition Error",
          description: "Could not recognize speech. Please try again.",
          variant: "destructive",
        });
      };

      recognitionInstance.onend = () => {
        setIsListening(false);
      };

      setRecognition(recognitionInstance);
    }

    // Initial scroll to bottom
    setTimeout(scrollToBottom, 200);
  }, [userPersona]);

  const handleUserInput = async (text: string) => {
    const userMessage: Message = {
      role: "user",
      content: text,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setIsGenerating(true);

    // Scroll to show loading indicator
    setTimeout(scrollToBottom, 50);

    try {
      // Generate AI response using the API
      const aiResponse = await generateAIResponse(text);
      const assistantMessage: Message = {
        role: "assistant",
        content: aiResponse,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMessage]);

      // Auto-speak in speech mode
      if (mode === "speech") {
        speakText(aiResponse);
      }
    } catch (error) {
      console.error('Failed to generate AI response:', error);
      const errorMessage: Message = {
        role: "assistant",
        content: "I apologize, but I'm having trouble generating a response right now. Please try again later.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
      
      toast({
        title: "AI Error",
        description: "Failed to generate response. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
      // Scroll to show final response
      setTimeout(scrollToBottom, 100);
    }

    setInputText("");
  };

  const generateAIResponse = async (userQuery: string): Promise<string> => {
    try {
      // Use the AI generation API
      const aiRequest = {
        persona: userPersona,
        lab_results: labResults,
        template_type: "chat_response",
        user_context: {
          query: userQuery,
          prompt_context: aiPromptContext?.persona_context,
          conversation_history: messages.slice(-5) // Include recent conversation context
        }
      };

      const response = await api.ai.generate(aiRequest);
      return response.content || "I understand your question, but I'm having trouble providing a detailed response right now.";
    } catch (error) {
      console.error('AI generation failed, using fallback:', error);
      
      // Fallback to simple responses based on query keywords
      const lowerQuery = userQuery.toLowerCase();
      
      if (lowerQuery.includes("abnormal") || lowerQuery.includes("concerning")) {
        const abnormalResults = labResults.filter(r => r.status !== "normal");
        if (abnormalResults.length > 0) {
          const firstAbnormal = abnormalResults[0];
          return `I see you're asking about abnormal results. Your ${firstAbnormal.name} is ${firstAbnormal.status} at ${firstAbnormal.value} ${firstAbnormal.unit}. I recommend discussing this with your healthcare provider.`;
        }
        return "I'd be happy to help you understand your results. Could you ask about a specific test?";
      } else if (lowerQuery.includes("glucose") || lowerQuery.includes("sugar")) {
        const glucoseResult = labResults.find(r => r.name.toLowerCase().includes("glucose"));
        if (glucoseResult) {
          return `Your glucose level is ${glucoseResult.value} ${glucoseResult.unit}, which is ${glucoseResult.status}. The normal range is ${glucoseResult.reference_range.min}-${glucoseResult.reference_range.max} ${glucoseResult.unit}.`;
        }
        return "I don't see glucose results in your current lab data. Could you ask about another test?";
      } else if (lowerQuery.includes("cholesterol")) {
        const cholesterolResult = labResults.find(r => r.name.toLowerCase().includes("cholesterol"));
        if (cholesterolResult) {
          return `Your ${cholesterolResult.name} is ${cholesterolResult.value} ${cholesterolResult.unit}, which is ${cholesterolResult.status}. The reference range is ${cholesterolResult.reference_range.min}-${cholesterolResult.reference_range.max} ${cholesterolResult.unit}.`;
        }
        return "I don't see cholesterol results in your current lab data. Could you ask about another test?";
      } else {
        return "I can help you understand your lab results. Try asking about specific tests or which results might need attention.";
      }
    }
  };

  const speakText = (text: string) => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1;
      utterance.volume = 1;
      
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      
      window.speechSynthesis.speak(utterance);
    }
  };

  const toggleListening = () => {
    if (!recognition) {
      toast({
        title: "Not Supported",
        description: "Speech recognition is not supported in your browser.",
        variant: "destructive",
      });
      return;
    }

    if (isListening) {
      recognition.stop();
      setIsListening(false);
    } else {
      recognition.start();
      setIsListening(true);
      toast({
        title: "Listening...",
        description: "Speak now to ask your question.",
      });
    }
  };

  const stopSpeaking = () => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  const handleSendMessage = async () => {
    if (inputText.trim() && !isGenerating) {
      await handleUserInput(inputText.trim());
    }
  };

  // Auto-scroll to bottom when messages change or AI is generating
  useEffect(() => {
    // Small delay to ensure DOM has updated
    const timeoutId = setTimeout(scrollToBottom, 100);
    return () => clearTimeout(timeoutId);
  }, [messages, isGenerating]);

  return (
    <Card className="p-6">
      <Tabs value={mode} onValueChange={(v) => setMode(v as "chat" | "speech")}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold">Ask Questions</h3>
          <TabsList>
            <TabsTrigger value="chat" className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              Chat Mode
            </TabsTrigger>
            <TabsTrigger value="speech" className="flex items-center gap-2">
              <Mic className="w-4 h-4" />
              Speech Mode
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="chat" className="mt-0">
          <ScrollArea className="h-96 mb-4 p-4 border rounded-lg" ref={scrollAreaRef}>
            <div className="space-y-4">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${
                    message.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg p-3 ${
                      message.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    }`}
                  >
                    <p className="text-sm">{message.content}</p>
                    <p className="text-xs opacity-70 mt-1">
                      {message.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
              {isGenerating && (
                <div className="flex justify-start">
                  <div className="max-w-[80%] rounded-lg p-3 bg-muted">
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <p className="text-sm">AI is thinking...</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
          <div className="flex gap-2">
            <Input
              placeholder="Ask about your lab results..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && !isGenerating && handleSendMessage()}
              disabled={isGenerating}
            />
            <Button onClick={handleSendMessage} size="icon" disabled={isGenerating}>
              {isGenerating ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="speech" className="mt-0">
          <ScrollArea className="h-96 mb-4 p-4 border rounded-lg" ref={scrollAreaRef}>
            <div className="space-y-4">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${
                    message.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg p-3 ${
                      message.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    }`}
                  >
                    <p className="text-sm">{message.content}</p>
                    <p className="text-xs opacity-70 mt-1">
                      {message.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
              {isGenerating && (
                <div className="flex justify-start">
                  <div className="max-w-[80%] rounded-lg p-3 bg-muted">
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <p className="text-sm">AI is thinking...</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
          
          <div className="flex flex-col items-center gap-4">
            <div className="flex gap-3">
              <Button
                onClick={toggleListening}
                size="lg"
                variant={isListening ? "destructive" : "default"}
                className="h-16 w-16 rounded-full"
              >
                {isListening ? (
                  <MicOff className="w-8 h-8" />
                ) : (
                  <Mic className="w-8 h-8" />
                )}
              </Button>
              
              {isSpeaking && (
                <Button
                  onClick={stopSpeaking}
                  size="lg"
                  variant="outline"
                  className="h-16 w-16 rounded-full"
                >
                  <VolumeX className="w-8 h-8" />
                </Button>
              )}
            </div>
            
            <p className="text-sm text-muted-foreground text-center">
              {isListening
                ? "Listening... Speak your question"
                : isSpeaking
                ? "Speaking... Tap to stop"
                : "Tap the microphone to ask a question"}
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </Card>
  );
};
