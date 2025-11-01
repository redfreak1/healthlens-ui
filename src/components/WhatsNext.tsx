import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Lightbulb, Calendar, Target, Shield, Utensils, CheckCircle } from "lucide-react";

export const WhatsNext = () => {
  const recommendations = {
    immediate: [
      { text: "Schedule follow-up thyroid test", due: "in 2 weeks", icon: Calendar },
      { text: "Increase daily steps to 8,000", current: "currently 6,200 avg.", icon: Target },
      { text: "Try Mediterranean diet recipes this week", icon: Utensils },
    ],
    upcoming: [
      { text: "3-month diabetes review", due: "in 45 days" },
      { text: "Annual physical", due: "in 3 months" },
    ],
    preventive: [
      { text: "Consider vitamin D supplementation" },
      { text: "Dental checkup overdue by 2 months" },
    ],
  };

  return (
    <Card className="p-6 bg-gradient-to-br from-accent/10 to-accent/5 border-accent/30">
      <div className="flex items-center gap-2 mb-6">
        <Lightbulb className="w-6 h-6 text-primary" />
        <h3 className="text-2xl font-bold">What's Next?</h3>
        <Badge variant="outline" className="ml-auto">AI Recommendations</Badge>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Priority Actions */}
        <div>
          <h4 className="font-bold mb-4 flex items-center gap-2 text-medical-alert">
            <div className="w-2 h-2 rounded-full bg-medical-alert"></div>
            Priority Actions (Next 7 Days)
          </h4>
          <div className="space-y-3">
            {recommendations.immediate.map((item, index) => {
              const Icon = item.icon;
              return (
                <div
                  key={index}
                  className="p-3 bg-card rounded-lg border border-border hover:border-primary transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <Icon className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="font-medium text-sm mb-1">{item.text}</p>
                      {(item.due || item.current) && (
                        <p className="text-xs text-muted-foreground">
                          {item.due || item.current}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Upcoming Milestones */}
        <div>
          <h4 className="font-bold mb-4 flex items-center gap-2 text-medical-warning">
            <div className="w-2 h-2 rounded-full bg-medical-warning"></div>
            Upcoming Milestones
          </h4>
          <div className="space-y-3">
            {recommendations.upcoming.map((item, index) => (
              <div
                key={index}
                className="p-3 bg-card rounded-lg border border-border hover:border-primary transition-colors"
              >
                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-medium text-sm mb-1">{item.text}</p>
                    <p className="text-xs text-muted-foreground">{item.due}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Preventive Suggestions */}
        <div>
          <h4 className="font-bold mb-4 flex items-center gap-2 text-medical-safe">
            <div className="w-2 h-2 rounded-full bg-medical-safe"></div>
            Preventive Suggestions
          </h4>
          <div className="space-y-3">
            {recommendations.preventive.map((item, index) => (
              <div
                key={index}
                className="p-3 bg-card rounded-lg border border-border hover:border-primary transition-colors"
              >
                <div className="flex items-start gap-3">
                  <Shield className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-medium text-sm">{item.text}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 pt-6 border-t border-border">
        <Button variant="outline" className="w-full">
          <CheckCircle className="w-4 h-4 mr-2" />
          View All Recommendations
        </Button>
      </div>
    </Card>
  );
};
