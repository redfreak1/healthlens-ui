import { LabResult } from "@/data/mockLabData";
import { CheckCircle, AlertTriangle, XCircle, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface SeniorQueViewProps {
  results: LabResult[];
  onSpeak: (text: string) => void;
}

export const SeniorQueView = ({ results, onSpeak }: SeniorQueViewProps) => {
  const getStatusIcon = (status: LabResult['status']) => {
    switch (status) {
      case 'normal':
        return <CheckCircle className="w-12 h-12 text-medical-safe" />;
      case 'high':
        return <AlertTriangle className="w-12 h-12 text-medical-warning" />;
      case 'low':
        return <XCircle className="w-12 h-12 text-medical-alert" />;
    }
  };

  const getStatusMessage = (result: LabResult): string => {
    const name = result.name;
    if (result.status === 'normal') {
      return `Your ${name} is in a healthy range.`;
    } else if (result.status === 'high') {
      return `Your ${name} is higher than normal. Please discuss with your doctor.`;
    } else {
      return `Your ${name} is lower than normal. Please discuss with your doctor.`;
    }
  };

  const getStatusColor = (status: LabResult['status']) => {
    switch (status) {
      case 'normal':
        return 'bg-medical-safe/10 border-medical-safe';
      case 'high':
        return 'bg-medical-warning/10 border-medical-warning';
      case 'low':
        return 'bg-medical-alert/10 border-medical-alert';
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-primary/5 border-l-4 border-primary p-4 rounded">
        <p className="text-lg font-medium">Simple, easy-to-read results</p>
      </div>

      {results.map((result, index) => {
        const message = getStatusMessage(result);
        return (
          <Card key={index} className={`p-6 border-2 ${getStatusColor(result.status)} transition-all hover:shadow-lg`}>
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                {getStatusIcon(result.status)}
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold mb-2">{result.name}</h3>
                <p className="text-xl mb-3">{message}</p>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <span className="text-lg">Value: {result.value} {result.unit}</span>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onSpeak(message)}
                className="flex-shrink-0"
                title="Read aloud"
              >
                <Volume2 className="w-5 h-5" />
              </Button>
            </div>
          </Card>
        );
      })}
    </div>
  );
};
