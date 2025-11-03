'use client';

import { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

interface ChartData {
  date: Date;
  count: number;
}

export default function PerformanceChart() {
  const [period, setPeriod] = useState('30');
  const [chartType, setChartType] = useState('line');
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4001/api';
  
  useEffect(() => {
    fetchAnalyticsData();
  }, [period]);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      
      const response = await fetch(
        `${API_URL}/dashboard/analytics?period=${period}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.ok) {
        const result = await response.json();
        
        // Format data for charts
        const formattedData = result.data.dailyUsers.map((item: ChartData, index: number) => ({
          name: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          users: Number(item.count),
          listings: Number(result.data.dailyListings[index]?.count || 0)
        }));
        
        setData(formattedData);
      }
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Card className="col-span-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Performance Metrics</CardTitle>
          <CardDescription>
            Track user growth, listings, and revenue over time
          </CardDescription>
        </div>
        <div className="flex items-center space-x-2">
          <Tabs defaultValue="30" className="w-[200px]" onValueChange={setPeriod}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="30">30 Days</TabsTrigger>
              <TabsTrigger value="7">7 Days</TabsTrigger>
            </TabsList>
          </Tabs>
          <Tabs defaultValue="line" className="w-[200px]" onValueChange={setChartType}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="line">Line</TabsTrigger>
              <TabsTrigger value="bar">Bar</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="h-[350px] flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-lime-500"></div>
          </div>
        ) : (
        <div className="h-[350px]">
          <ResponsiveContainer width="100%" height="100%">
            {chartType === 'line' ? (
              <LineChart
                data={data}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="users" 
                  stroke="#8884d8" 
                  activeDot={{ r: 8 }} 
                  name="Users"
                />
                <Line 
                  type="monotone" 
                  dataKey="listings" 
                  stroke="#82ca9d" 
                  name="Listings"
                />
              </LineChart>
            ) : (
              <BarChart
                data={data}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="users" fill="#8884d8" name="Users" />
                <Bar dataKey="listings" fill="#82ca9d" name="Listings" />
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>
        )}
      </CardContent>
    </Card>
  );
}