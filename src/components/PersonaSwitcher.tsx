import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User } from "lucide-react";

export type Persona = "senior-que" | "analyst-alex";

interface PersonaSwitcherProps {
  selectedPersona: Persona;
  onPersonaChange: (persona: Persona) => void;
}

export const PersonaSwitcher = ({ selectedPersona, onPersonaChange }: PersonaSwitcherProps) => {
  return (
    <div className="flex items-center gap-3 bg-card p-4 rounded-lg shadow-md border border-border">
      <User className="w-5 h-5 text-primary" />
      <div className="flex-1">
        <label className="text-sm font-medium text-muted-foreground block mb-1">
          View as:
        </label>
        <Select value={selectedPersona} onValueChange={(value) => onPersonaChange(value as Persona)}>
          <SelectTrigger className="w-full bg-background">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="senior-que">Senior Que - Simple View</SelectItem>
            <SelectItem value="analyst-alex">Analyst Alex - Detailed View</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};
