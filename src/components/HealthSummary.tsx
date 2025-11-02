import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LabResult } from "@/lib/api";
import { Sparkles, TrendingUp, AlertTriangle, CheckCircle } from "lucide-react";

interface HealthSummaryProps {
  results: LabResult[];
}

export const HealthSummary = ({ results }: HealthSummaryProps) => {
  const abnormalCount = results.filter(r => r.status !== 'normal').length;
  const normalCount = results.filter(r => r.status === 'normal').length;
  const highCount = results.filter(r => r.status === 'high').length;
  const lowCount = results.filter(r => r.status === 'low').length;

  const getSummaryText = () => {
    if (abnormalCount === 0) {
      return "Excellent work! All your recent lab results are within healthy ranges. Your consistent health management is showing positive results.";
    } else if (abnormalCount <= 2) {
      return `Your overall health profile is strong with ${normalCount} tests in normal range. We've identified ${abnormalCount} area(s) that need attention - focus on the recommendations below.`;
    } else {
      return `You have ${normalCount} tests in normal range and ${abnormalCount} results requiring attention. Review the detailed recommendations and consult with your healthcare provider.`;
    }
  };

  return (
    <Card className="p-6 bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-6 h-6 text-primary" />
        <h3 className="text-xl font-bold">AI Health Summary</h3>
        <Badge variant="secondary" className="ml-auto">Last 3 Months</Badge>
      </div>

      <p className="text-foreground leading-relaxed mb-6">
        {getSummaryText()}
      </p>

      <div className="grid grid-cols-3 gap-4">
        <div className="text-center p-4 bg-medical-safe/10 rounded-lg border border-medical-safe/20">
          <CheckCircle className="w-8 h-8 text-medical-safe mx-auto mb-2" />
          <div className="text-2xl font-bold text-medical-safe">{normalCount}</div>
          <div className="text-sm text-muted-foreground">Normal</div>
        </div>
        
        <div className="text-center p-4 bg-medical-warning/10 rounded-lg border border-medical-warning/20">
          <TrendingUp className="w-8 h-8 text-medical-warning mx-auto mb-2" />
          <div className="text-2xl font-bold text-medical-warning">{highCount}</div>
          <div className="text-sm text-muted-foreground">High</div>
        </div>
        
        <div className="text-center p-4 bg-medical-alert/10 rounded-lg border border-medical-alert/20">
          <AlertTriangle className="w-8 h-8 text-medical-alert mx-auto mb-2" />
          <div className="text-2xl font-bold text-medical-alert">{lowCount}</div>
          <div className="text-sm text-muted-foreground">Low</div>
        </div>
      </div>
    </Card>
  );
};
