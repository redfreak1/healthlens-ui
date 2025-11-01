export interface LabResult {
  name: string;
  value: number;
  unit: string;
  referenceRange: {
    min: number;
    max: number;
  };
  category: string;
  status: 'normal' | 'high' | 'low';
}

export const mockLabResults: LabResult[] = [
  {
    name: "Glucose",
    value: 98,
    unit: "mg/dL",
    referenceRange: { min: 70, max: 99 },
    category: "Metabolic Panel",
    status: "normal"
  },
  {
    name: "White Blood Cell Count",
    value: 11.2,
    unit: "K/uL",
    referenceRange: { min: 4.5, max: 11.0 },
    category: "Complete Blood Count",
    status: "high"
  },
  {
    name: "Red Blood Cell Count",
    value: 4.8,
    unit: "M/uL",
    referenceRange: { min: 4.5, max: 5.9 },
    category: "Complete Blood Count",
    status: "normal"
  },
  {
    name: "Hemoglobin",
    value: 14.2,
    unit: "g/dL",
    referenceRange: { min: 13.5, max: 17.5 },
    category: "Complete Blood Count",
    status: "normal"
  },
  {
    name: "Hematocrit",
    value: 42.1,
    unit: "%",
    referenceRange: { min: 38.8, max: 50.0 },
    category: "Complete Blood Count",
    status: "normal"
  },
  {
    name: "Platelet Count",
    value: 210,
    unit: "K/uL",
    referenceRange: { min: 150, max: 400 },
    category: "Complete Blood Count",
    status: "normal"
  },
  {
    name: "Sodium",
    value: 138,
    unit: "mmol/L",
    referenceRange: { min: 136, max: 145 },
    category: "Metabolic Panel",
    status: "normal"
  },
  {
    name: "Potassium",
    value: 3.2,
    unit: "mmol/L",
    referenceRange: { min: 3.5, max: 5.1 },
    category: "Metabolic Panel",
    status: "low"
  },
  {
    name: "Creatinine",
    value: 1.0,
    unit: "mg/dL",
    referenceRange: { min: 0.7, max: 1.3 },
    category: "Metabolic Panel",
    status: "normal"
  },
  {
    name: "Total Cholesterol",
    value: 195,
    unit: "mg/dL",
    referenceRange: { min: 0, max: 200 },
    category: "Lipid Panel",
    status: "normal"
  }
];
