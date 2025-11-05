import React from 'react';
import { Card } from '@/components/ui/card';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Activity, CheckCircle, AlertCircle, Battery } from 'lucide-react';

interface ChartData {
  year: number;
  value: number;
}

interface Series {
  name: string;
  unit: string;
  color: string;
  data: ChartData[];
}

interface Chart {
  chart_type: string;
  title: string;
  description?: string;
  x_axis?: string;
  series?: Series[];
  value?: number;
  min?: number;
  max?: number;
  unit?: string;
  status?: string;
  config: {
    font_size?: string;
    bar_spacing?: string;
    show_values?: boolean;
    legend_position?: string;
    size?: string;
    show_status_text?: boolean;
    colors?: {
      normal?: string;
      warning?: string;
      high?: string;
    };
  };
}

interface BoldHealthTrendsData {
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
          font_size?: string;
          highlight_positive?: boolean;
          plain_language?: boolean;
        };
      };
    };
    styling: {
      font_size?: string;
      contrast?: string;
      colors?: string;
    };
  };
}

interface BoldHealthTrendsProps {
  data?: BoldHealthTrendsData;
}

const defaultBoldData: BoldHealthTrendsData = {
  "persona": "bold_old",
  "ui_components": {
    "layout": "simple_overview",
    "components": {
      "header": {
        "type": "simple_header",
        "title": "Your Health Summary",
        "subtitle": "Easy View for Bold & Old"
      },
      "charts": {
        "type": "chart_section",
        "charts": [
          {
            "chart_type": "line_chart",
            "title": "Glucose",
            "status": "normal",
            "series": [
              {
                "name": "Glucose",
                "unit": "mg/dL",
                "color": "#4CAF50",
                "data": [
                  {"year": 2023, "value": 60},
                  {"year": 2024, "value": 110},
                  {"year": 2025, "value": 96}
                ]
              }
            ],
            "config": {
              "font_size": "large",
              "show_values": true
            }
          },
          {
            "chart_type": "line_chart",
            "title": "White Blood Cell Count",
            "status": "warning",
            "series": [
              {
                "name": "White Blood Cell Count",
                "unit": "K/uL",
                "color": "#F44336",
                "data": [
                  {"year": 2023, "value": 10.8},
                  {"year": 2024, "value": 13.0},
                  {"year": 2025, "value": 14.2}
                ]
              }
            ],
            "config": {
              "font_size": "large",
              "show_values": true
            }
          },
          {
            "chart_type": "line_chart",
            "title": "Potassium",
            "status": "warning",
            "series": [
              {
                "name": "Potassium",
                "unit": "mmol/L",
                "color": "#2196F3",
                "data": [
                  {"year": 2023, "value": 3.6},
                  {"year": 2024, "value": 3.1},
                  {"year": 2025, "value": 3.9}
                ]
              }
            ],
            "config": {
              "font_size": "large",
              "show_values": true
            }
          },
          {
            "chart_type": "line_chart",
            "title": "Total Cholesterol",
            "status": "normal",
            "series": [
              {
                "name": "Total Cholesterol",
                "unit": "mg/dL",
                "color": "#9C27B0",
                "data": [
                  {"year": 2023, "value": 188},
                  {"year": 2024, "value": 192},
                  {"year": 2025, "value": 195}
                ]
              }
            ],
            "config": {
              "font_size": "large",
              "show_values": true
            }
          }
        ]
      },
      "summary": {
        "type": "text_summary",
        "content": "Everything looks steady. Glucose and cholesterol are healthy. Potassium is a little low — drink water and eat fruits like bananas.",
        "config": {
          "font_size": "x-large",
          "highlight_positive": true,
          "plain_language": true
        }
      }
    },
    "styling": {
      "font_size": "x-large",
      "contrast": "very_high",
      "colors": "accessible_high_contrast"
    }
  }
};

export const BoldHealthTrends: React.FC<BoldHealthTrendsProps> = ({ data = defaultBoldData }) => {
  const chartsData = data.ui_components.components.charts.charts;

  // Transform series data for recharts (simplified for bold view)
  const transformBoldSeriesData = (series: Series[]) => {
    const years = [...new Set(series.flatMap(s => s.data.map(d => d.year)))].sort();
    return years.map(year => {
      const yearData: Record<string, number | string> = { year: year.toString() };
      series.forEach(s => {
        const dataPoint = s.data.find(d => d.year === year);
        if (dataPoint) {
          yearData[s.name] = dataPoint.value;
        }
      });
      return yearData;
    });
  };

  // Enhanced gauge chart for bold view
  const renderBoldGaugeChart = (chart: Chart) => {
    const percentage = ((chart.value! - chart.min!) / (chart.max! - chart.min!)) * 100;
    const getStatusColor = (status: string) => {
      const colors = chart.config.colors;
      switch (status) {
        case 'normal': return colors?.normal || '#4CAF50';
        case 'warning': return colors?.warning || '#FFC107';
        case 'high': return colors?.high || '#E53935';
        default: return '#4CAF50';
      }
    };

    const statusColor = getStatusColor(chart.status!);

    return (
      <div className="flex flex-col items-center justify-center h-64">
        <div className="relative w-32 h-32 mb-4">
          <svg className="transform -rotate-90 w-32 h-32">
            <circle
              cx="64" cy="64" r="56"
              stroke="#e5e7eb" strokeWidth="12"
              fill="transparent"
            />
            <circle
              cx="64" cy="64" r="56"
              stroke={statusColor}
              strokeWidth="12"
              fill="transparent"
              strokeDasharray={`${percentage * 3.51} 351`}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-3xl font-bold mb-1" style={{ color: statusColor }}>
                {chart.value}
              </div>
              <div className="text-sm text-gray-600 font-medium">{chart.unit}</div>
            </div>
          </div>
        </div>
        
        {chart.config.show_status_text && (
          <div className="text-center">
            <div className="text-sm text-gray-600 mb-2">
              Normal Range: {chart.min} - {chart.max} {chart.unit}
            </div>
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold`}
                 style={{ backgroundColor: `${statusColor}20`, color: statusColor }}>
              {chart.status === 'normal' ? (
                <CheckCircle className="w-4 h-4" />
              ) : (
                <AlertCircle className="w-4 h-4" />
              )}
              <span className="capitalize">{chart.status} Range</span>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderChart = (chart: Chart, index: number) => {
    const getStatusIcon = (status: string) => {
      return status === 'normal' ? (
        <CheckCircle className="w-6 h-6 text-green-500" />
      ) : (
        <AlertCircle className="w-6 h-6 text-red-500" />
      );
    };

    return (
      <Card key={index} className="p-4 shadow-lg border-2 border-gray-200 rounded-lg">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-800">{chart.title}</h3>
          {chart.status && getStatusIcon(chart.status)}
        </div>

        <div className="h-48">
          {chart.chart_type === 'line_chart' && chart.series && chart.series[0] && (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart 
                data={chart.series[0].data}
                margin={{ top: 10, right: 10, left: 10, bottom: 20 }}
              >
                <XAxis 
                  dataKey="year" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fontWeight: 'bold' }}
                />
                <YAxis hide />
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke={chart.series[0].color}
                  strokeWidth={3}
                  dot={{ 
                    r: 6, 
                    fill: chart.series[0].color,
                    strokeWidth: 2,
                    stroke: '#fff'
                  }}
                  activeDot={{ r: 8, stroke: chart.series[0].color, strokeWidth: 2 }}
                />
                {/* Custom labels for data points */}
                {chart.series[0].data.map((entry, idx) => (
                  <text
                    key={idx}
                    x={`${(idx / (chart.series![0].data.length - 1)) * 100}%`}
                    y={20}
                    textAnchor="middle"
                    fontSize="12"
                    fontWeight="bold"
                    fill={chart.series[0].color}
                  >
                    {entry.value}
                  </text>
                ))}
              </LineChart>
            </ResponsiveContainer>
          )}

          {chart.chart_type === 'bar_chart' && chart.series && (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart 
                data={transformBoldSeriesData(chart.series)}
                margin={{ top: 20, right: 30, left: 20, bottom: 40 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" strokeWidth={1} />
                <XAxis 
                  dataKey="year" 
                  tick={{ fontSize: 14, fontWeight: 'bold' }}
                  axisLine={{ stroke: '#333', strokeWidth: 1 }}
                />
                <YAxis 
                  tick={{ fontSize: 12, fontWeight: 'bold' }}
                  axisLine={{ stroke: '#333', strokeWidth: 1 }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #333',
                    borderRadius: '6px',
                    fontSize: '14px',
                    fontWeight: 'bold'
                  }}
                />
                {chart.config.legend_position === 'bottom' && (
                  <Legend 
                    wrapperStyle={{ fontSize: '14px', fontWeight: 'bold', paddingTop: '10px' }}
                  />
                )}
                {chart.series.map((series, idx) => (
                  <Bar 
                    key={idx}
                    dataKey={series.name} 
                    fill={series.color}
                    stroke="#333"
                    strokeWidth={1}
                    radius={[3, 3, 0, 0]}
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
          )}

          {chart.chart_type === 'gauge_chart' && (
            renderBoldGaugeChart(chart)
          )}
        </div>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-3">
          {data.ui_components.components.header.title}
        </h2>
        <p className="text-lg text-gray-600 font-medium">
          {data.ui_components.components.header.subtitle}
        </p>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {chartsData.map((chart, index) => renderChart(chart, index))}
      </div>

      {/* Summary */}
      <Card className="p-6 bg-gradient-to-r from-green-50 to-blue-50 border-2 border-green-200 shadow-lg">
        <div className="flex items-start gap-3">
          <CheckCircle className="w-8 h-8 text-green-600 mt-1 flex-shrink-0" />
          <div>
            <h3 className="text-xl font-bold text-green-800 mb-3">Health Summary</h3>
            <p className="text-lg text-green-700 leading-relaxed font-medium">
              {data.ui_components.components.summary.content}
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default BoldHealthTrends;