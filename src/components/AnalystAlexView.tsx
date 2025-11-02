import { LabResult } from "@/lib/api";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface AnalystAlexViewProps {
  results: LabResult[];
}

export const AnalystAlexView = ({ results }: AnalystAlexViewProps) => {
  const getTrendIcon = (status: LabResult['status']) => {
    switch (status) {
      case 'high':
        return <TrendingUp className="w-4 h-4" />;
      case 'low':
        return <TrendingDown className="w-4 h-4" />;
      case 'normal':
        return <Minus className="w-4 h-4" />;
    }
  };

  const getStatusBadge = (status: LabResult['status']) => {
    switch (status) {
      case 'normal':
        return <Badge className="bg-medical-safe text-medical-safe-foreground">Normal</Badge>;
      case 'high':
        return <Badge className="bg-medical-warning text-medical-warning-foreground">High</Badge>;
      case 'low':
        return <Badge className="bg-medical-alert text-medical-alert-foreground">Low</Badge>;
    }
  };

  const groupedResults = results.reduce((acc, result) => {
    if (!acc[result.category]) {
      acc[result.category] = [];
    }
    acc[result.category].push(result);
    return acc;
  }, {} as Record<string, LabResult[]>);

  return (
    <div className="space-y-6">
      <div className="bg-primary/5 border-l-4 border-primary p-4 rounded">
        <p className="text-sm font-medium">Detailed analysis with reference ranges and trends</p>
      </div>

      {Object.entries(groupedResults).map(([category, categoryResults]) => (
        <div key={category}>
          <h3 className="text-lg font-bold mb-3 text-primary">{category}</h3>
          <div className="space-y-3">
            {categoryResults.map((result, index) => (
              <Card key={index} className="p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold">{result.name}</h4>
                    {getTrendIcon(result.status)}
                  </div>
                  {getStatusBadge(result.status)}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Value:</span>
                    <span className="ml-2 font-mono font-semibold">{result.value} {result.unit}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Reference:</span>
                    <span className="ml-2 font-mono">
                      {result.reference_range.min}-{result.reference_range.max} {result.unit}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Status:</span>
                    <span className="ml-2 capitalize">{result.status}</span>
                  </div>
                </div>

                {/* Simple trend visualization */}
                <div className="mt-3">
                  <div className="w-full bg-secondary rounded-full h-2 relative">
                    <div 
                      className="absolute top-0 left-0 h-2 bg-primary/30 rounded-full"
                      style={{ 
                        left: `${(result.reference_range.min / (result.reference_range.max * 1.2)) * 100}%`,
                        width: `${((result.reference_range.max - result.reference_range.min) / (result.reference_range.max * 1.2)) * 100}%`
                      }}
                    />
                    <div 
                      className={`absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full ${
                        result.status === 'normal' ? 'bg-medical-safe' : 
                        result.status === 'high' ? 'bg-medical-warning' : 'bg-medical-alert'
                      }`}
                      style={{ 
                        left: `${(result.value / (result.reference_range.max * 1.2)) * 100}%`
                      }}
                    />
                  </div>
                </div>

                {result.status !== 'normal' && (
                  <p className="text-sm text-muted-foreground mt-2">
                    {result.status === 'high' 
                      ? `${result.value - result.reference_range.max} ${result.unit} above upper limit`
                      : `${result.reference_range.min - result.value} ${result.unit} below lower limit`
                    }
                  </p>
                )}
              </Card>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};
