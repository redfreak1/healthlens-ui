import React from 'react';
import { Card } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, AreaChart, Area, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { Activity, TrendingUp, Users, Battery } from 'lucide-react';

interface ChartData {
  year: number;
  value: number;
}

interface Series {
  name: string;
  unit?: string;
  data: ChartData[];
}

interface ChartConfig {
  color_scheme?: string;
  show_trendline?: boolean;
  show_tooltips?: boolean;
  y_axis_label?: string;
  bar_width?: string;
  grouped?: boolean;
  stacked?: boolean;
  smooth_lines?: boolean;
  fill_opacity?: number;
  show_labels?: boolean;
  show_threshold?: boolean;
  status_colors?: {
    normal?: string;
    warning?: string;
    high?: string;
  };
}

interface Chart {
  chart_type: string;
  title: string;
  description: string;
  x_axis?: string;
  y_axis?: string;
  series?: Series[];
  categories?: string[];
  values?: number[];
  reference?: number[];
  value?: number;
  min?: number;
  max?: number;
  unit?: string;
  status?: string;
  config: ChartConfig;
}

interface HealthTrendsData {
  persona: string;
  ui_components: {
    layout: string;
    components: {
      header: {
        type: string;
        title: string;
        subtitle: string;
      };
      charts: {
        type: string;
        charts: Chart[];
      };
      summary: {
        type: string;
        content: string;
        config: {
          include_recommendations?: boolean;
          medical_context?: boolean;
        };
      };
    };
    styling: {
      font_size?: string;
      contrast?: string;
      colors?: string;
      chart_palette?: string;
    };
  };
}

interface HealthTrendsProps {
  data?: HealthTrendsData;
}

const defaultData: HealthTrendsData = {
  "persona": "intermediate",
  "ui_components": {
    "layout": "dashboard_view",
    "components": {
      "header": {
        "type": "simple_header",
        "title": "Your Health Trends",
        "subtitle": "3-Year Lab Results Overview"
      },
      "charts": {
        "type": "chart_section",
        "charts": [
          {
            "chart_type": "line_chart",
            "title": "Glucose & Cholesterol Trend (Metabolic Health)",
            "description": "Shows how glucose and cholesterol levels have changed over the last 3 years.",
            "x_axis": "year",
            "y_axis": "value",
            "series": [
              {
                "name": "Glucose",
                "unit": "mg/dL",
                "data": [
                  {"year": 2023, "value": 97},
                  {"year": 2024, "value": 96},
                  {"year": 2025, "value": 95}
                ]
              },
              {
                "name": "Total Cholesterol",
                "unit": "mg/dL",
                "data": [
                  {"year": 2023, "value": 188},
                  {"year": 2024, "value": 192},
                  {"year": 2025, "value": 195}
                ]
              }
            ],
            "config": {
              "color_scheme": "calm",
              "show_trendline": true,
              "show_tooltips": true,
              "y_axis_label": "mg/dL"
            }
          },
          {
            "chart_type": "bar_chart",
            "title": "White Blood Cell & Platelet Count",
            "description": "Comparison of immune cell levels across 3 years.",
            "x_axis": "year",
            "y_axis": "count",
            "series": [
              {
                "name": "White Blood Cell Count",
                "unit": "K/uL",
                "data": [
                  {"year": 2023, "value": 10.8},
                  {"year": 2024, "value": 11.0},
                  {"year": 2025, "value": 11.2}
                ]
              },
              {
                "name": "Platelet Count",
                "unit": "K/uL",
                "data": [
                  {"year": 2023, "value": 205},
                  {"year": 2024, "value": 208},
                  {"year": 2025, "value": 210}
                ]
              }
            ],
            "config": {
              "color_scheme": "contrast",
              "bar_width": "medium",
              "grouped": true,
              "y_axis_label": "K/uL"
            }
          },
          {
            "chart_type": "area_chart",
            "title": "Electrolyte Balance (Sodium vs Potassium)",
            "description": "Tracks the variation between sodium and potassium levels over time.",
            "x_axis": "year",
            "y_axis": "mmol/L",
            "series": [
              {
                "name": "Sodium",
                "data": [
                  {"year": 2023, "value": 145},
                  {"year": 2024, "value": 147},
                  {"year": 2025, "value": 148}
                ]
              },
              {
                "name": "Potassium",
                "data": [
                  {"year": 2023, "value": 3.6},
                  {"year": 2024, "value": 3.4},
                  {"year": 2025, "value": 3.2}
                ]
              }
            ],
            "config": {
              "stacked": false,
              "smooth_lines": true,
              "fill_opacity": 0.2
            }
          },
          {
            "chart_type": "radar_chart",
            "title": "Overall Blood Health Snapshot (2025)",
            "description": "A radar visualization comparing key CBC parameters to healthy averages.",
            "categories": [
              "WBC",
              "RBC",
              "Hemoglobin",
              "Hematocrit",
              "Platelets"
            ],
            "values": [11.2, 4.8, 14.2, 42.1, 210],
            "reference": [8.0, 5.0, 15.0, 45.0, 250],
            "config": {
              "fill_opacity": 0.3,
              "show_labels": true
            }
          },
          {
            "chart_type": "gauge_chart",
            "title": "Kidney Health Indicator (Creatinine)",
            "description": "Represents current kidney function relative to normal limits.",
            "value": 1.0,
            "min": 0.7,
            "max": 1.3,
            "unit": "mg/dL",
            "status": "normal",
            "config": {
              "show_threshold": true,
              "status_colors": {
                "normal": "#4CAF50",
                "warning": "#FFC107",
                "high": "#F44336"
              }
            }
          }
        ]
      },
      "summary": {
        "type": "text_summary",
        "content": "Visual trends suggest stable glucose, slightly elevated white blood cells, and mild potassium decline. Kidney and cholesterol metrics remain healthy. Monitoring hydration and nutrition is advised.",
        "config": {
          "include_recommendations": true,
          "medical_context": true
        }
      }
    },
    "styling": {
      "font_size": "medium",
      "contrast": "high",
      "colors": "medical_safe",
      "chart_palette": "blue-green"
    }
  }
};

export const HealthTrends: React.FC<HealthTrendsProps> = ({ data = defaultData }) => {
  const chartsData = data.ui_components.components.charts.charts;

  // Transform series data for recharts
  const transformSeriesData = (series: Series[]) => {
    const years = [...new Set(series.flatMap(s => s.data.map(d => d.year)))].sort();
    return years.map(year => {
      const yearData: Record<string, number> = { year };
      series.forEach(s => {
        const dataPoint = s.data.find(d => d.year === year);
        if (dataPoint) {
          yearData[s.name] = dataPoint.value;
        }
      });
      return yearData;
    });
  };

  // Transform radar data
  const transformRadarData = (categories: string[], values: number[], reference: number[]) => {
    return categories.map((category, index) => ({
      subject: category,
      current: values[index],
      reference: reference[index],
      fullMark: Math.max(values[index], reference[index]) * 1.2
    }));
  };

  // Render gauge chart as a simple progress bar with arc visual
  const renderGaugeChart = (chart: Chart) => {
    const percentage = ((chart.value! - chart.min!) / (chart.max! - chart.min!)) * 100;
    const getStatusColor = (status: string) => {
      switch (status) {
        case 'normal': return 'bg-green-500';
        case 'warning': return 'bg-yellow-500';
        case 'high': return 'bg-red-500';
        default: return 'bg-blue-500';
      }
    };

    return (
      <div className="flex flex-col items-center justify-center h-64">
        <div className="relative w-32 h-32 mb-4">
          <svg className="transform -rotate-90 w-32 h-32">
            <circle
              cx="64" cy="64" r="56"
              stroke="#e5e7eb" strokeWidth="8"
              fill="transparent"
            />
            <circle
              cx="64" cy="64" r="56"
              stroke="currentColor"
              strokeWidth="8"
              fill="transparent"
              strokeDasharray={`${percentage * 3.51} 351`}
              className={`${getStatusColor(chart.status!)} text-current`}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-2xl font-bold">{chart.value}</div>
              <div className="text-sm text-gray-600">{chart.unit}</div>
            </div>
          </div>
        </div>
        <div className="text-center">
          <div className="text-sm text-gray-600">
            Range: {chart.min} - {chart.max} {chart.unit}
          </div>
          <div className={`text-sm font-medium capitalize ${
            chart.status === 'normal' ? 'text-green-600' : 
            chart.status === 'warning' ? 'text-yellow-600' : 'text-red-600'
          }`}>
            {chart.status}
          </div>
        </div>
      </div>
    );
  };

  const renderChart = (chart: Chart, index: number) => {
    const getChartIcon = (type: string) => {
      switch (type) {
        case 'line_chart': return <TrendingUp className="w-5 h-5" />;
        case 'bar_chart': return <Users className="w-5 h-5" />;
        case 'area_chart': return <Activity className="w-5 h-5" />;
        case 'radar_chart': return <Activity className="w-5 h-5" />;
        case 'gauge_chart': return <Battery className="w-5 h-5" />;
        default: return <Activity className="w-5 h-5" />;
      }
    };

    return (
      <Card key={index} className="p-6 shadow-lg">
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            {getChartIcon(chart.chart_type)}
            <h3 className="text-lg font-bold">{chart.title}</h3>
          </div>
          <p className="text-sm text-muted-foreground">{chart.description}</p>
        </div>

        <div className="h-64">
          {chart.chart_type === 'line_chart' && chart.series && (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={transformSeriesData(chart.series)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="year" />
                <YAxis label={{ value: chart.config.y_axis_label, angle: -90, position: 'insideLeft' }} />
                <Tooltip />
                <Legend />
                {chart.series.map((series, idx) => (
                  <Line 
                    key={idx}
                    type="monotone" 
                    dataKey={series.name} 
                    stroke={idx === 0 ? "#3b82f6" : "#10b981"}
                    strokeWidth={2}
                    dot={{ r: 4 }}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          )}

          {chart.chart_type === 'bar_chart' && chart.series && (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={transformSeriesData(chart.series)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="year" />
                <YAxis label={{ value: chart.config.y_axis_label, angle: -90, position: 'insideLeft' }} />
                <Tooltip />
                <Legend />
                {chart.series.map((series, idx) => (
                  <Bar 
                    key={idx}
                    dataKey={series.name} 
                    fill={idx === 0 ? "#3b82f6" : "#10b981"}
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
          )}

          {chart.chart_type === 'area_chart' && chart.series && (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={transformSeriesData(chart.series)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="year" />
                <YAxis />
                <Tooltip />
                <Legend />
                {chart.series.map((series, idx) => (
                  <Area 
                    key={idx}
                    type="monotone" 
                    dataKey={series.name} 
                    stackId="1"
                    stroke={idx === 0 ? "#3b82f6" : "#10b981"}
                    fill={idx === 0 ? "#3b82f6" : "#10b981"}
                    fillOpacity={0.2}
                  />
                ))}
              </AreaChart>
            </ResponsiveContainer>
          )}

          {chart.chart_type === 'radar_chart' && chart.categories && chart.values && chart.reference && (
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={transformRadarData(chart.categories, chart.values, chart.reference)}>
                <PolarGrid />
                <PolarAngleAxis dataKey="subject" />
                <PolarRadiusAxis angle={90} domain={[0, 'dataMax']} />
                <Radar
                  name="Current"
                  dataKey="current"
                  stroke="#3b82f6"
                  fill="#3b82f6"
                  fillOpacity={0.3}
                />
                <Radar
                  name="Reference"
                  dataKey="reference"
                  stroke="#10b981"
                  fill="#10b981"
                  fillOpacity={0.1}
                />
                <Legend />
              </RadarChart>
            </ResponsiveContainer>
          )}

          {chart.chart_type === 'gauge_chart' && (
            renderGaugeChart(chart)
          )}
        </div>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-foreground mb-2">
          {data.ui_components.components.header.title}
        </h2>
        <p className="text-lg text-muted-foreground">
          {data.ui_components.components.header.subtitle}
        </p>
      </div>

      {/* Charts Grid */}
      <div className="grid lg:grid-cols-2 gap-6">
        {chartsData.map((chart, index) => renderChart(chart, index))}
      </div>

      {/* Summary */}
      <Card className="p-6 bg-gradient-to-r from-blue-50 to-green-50 border-blue-200">
        <div className="flex items-start gap-3">
          <Activity className="w-6 h-6 text-blue-600 mt-1 flex-shrink-0" />
          <div>
            <h3 className="text-xl font-bold text-blue-800 mb-3">Health Trends Summary</h3>
            <p className="text-blue-700 leading-relaxed">
              {data.ui_components.components.summary.content}
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default HealthTrends;