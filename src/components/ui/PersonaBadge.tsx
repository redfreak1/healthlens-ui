import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, TrendingUp } from "lucide-react";

export const PersonaBadge = () => {
  return (
    <Card className="p-6 bg-gradient-to-br from-primary/10 to-accent/10 border-primary/30">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-full mb-4">
          <Star className="w-8 h-8 text-primary-foreground fill-primary-foreground" />
        </div>
        <h3 className="text-2xl font-bold mb-2">THE ACHIEVER</h3>
        <div className="flex items-center justify-center gap-2 mb-3">
          <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
          <span className="text-3xl font-bold">4.2</span>
          <span className="text-lg text-muted-foreground">/ 5.0</span>
        </div>
        <Badge variant="secondary" className="mb-4">Proactive Management</Badge>
        
        <div className="pt-4 border-t border-border">
          <div className="flex items-center justify-center gap-2 text-medical-safe mb-2">
            <TrendingUp className="w-4 h-4" />
            <span className="text-sm font-medium">+12% improvement</span>
          </div>
          <p className="text-xs text-muted-foreground">from last quarter</p>
        </div>
      </div>
    </Card>
  );
};
