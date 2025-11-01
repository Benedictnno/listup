"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Simple stats card component
export const StatsCard = ({ 
  title, 
  value, 
  description 
}: { 
  title: string; 
  value: string | number; 
  description?: string;
}) => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && <p className="text-xs text-muted-foreground">{description}</p>}
      </CardContent>
    </Card>
  );
};

// Simple bar chart using divs instead of SVG
export const SimpleBarChart = ({ 
  data, 
  labelKey = "name", 
  valueKey = "value",
  height = 200,
  color = "#4f46e5"
}: { 
  data: any[]; 
  labelKey?: string; 
  valueKey?: string;
  height?: number;
  color?: string;
}) => {
  if (!data || data.length === 0) return <div className="text-center p-4">No data available</div>;
  
  const maxValue = Math.max(...data.map(item => item[valueKey]));
  
  return (
    <div className="w-full" style={{ height: `${height}px` }}>
      <div className="flex h-full">
        {data.map((item, index) => {
          const percentage = (item[valueKey] / maxValue) * 100;
          return (
            <div key={index} className="flex flex-col items-center flex-1">
              <div className="flex-1 w-full flex items-end px-1">
                <div 
                  className="w-full rounded-t-sm" 
                  style={{ 
                    height: `${percentage}%`, 
                    backgroundColor: color 
                  }}
                />
              </div>
              <div className="text-xs mt-2 truncate max-w-full text-center">
                {item[labelKey]}
              </div>
              <div className="text-xs font-medium">{item[valueKey]}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Simple pie chart representation using colored labels
export const SimplePieChart = ({ 
  data, 
  labelKey = "name", 
  valueKey = "value",
  colors = ["#4f46e5", "#06b6d4", "#10b981", "#f59e0b", "#ef4444"]
}: { 
  data: any[]; 
  labelKey?: string; 
  valueKey?: string;
  colors?: string[];
}) => {
  if (!data || data.length === 0) return <div className="text-center p-4">No data available</div>;
  
  const total = data.reduce((sum, item) => sum + item[valueKey], 0);
  
  return (
    <div className="flex flex-col space-y-4">
      <div className="grid grid-cols-2 gap-2">
        {data.map((item, index) => (
          <div key={index} className="flex items-center text-sm">
            <div 
              className="w-3 h-3 mr-2 rounded-full" 
              style={{ backgroundColor: colors[index % colors.length] }}
            />
            <div className="truncate">{item[labelKey]}</div>
            <div className="ml-auto font-medium">
              {Math.round((item[valueKey] / total) * 100)}%
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Simple line chart representation using text
export const SimpleLineChart = ({ 
  data, 
  xKey = "date", 
  yKey = "value",
  height = 200,
  color = "#4f46e5"
}: { 
  data: any[]; 
  xKey?: string; 
  yKey?: string;
  height?: number;
  color?: string;
}) => {
  if (!data || data.length === 0) return <div className="text-center p-4">No data available</div>;
  
  return (
    <div className="w-full p-4">
      <div className="grid grid-cols-3 gap-2">
        {data.map((item, index) => (
          <div key={index} className="text-sm border p-2 rounded">
            <div className="font-medium">{item[xKey]}</div>
            <div className="text-lg" style={{ color }}>{item[yKey]}</div>
          </div>
        ))}
      </div>
    </div>
  );
};