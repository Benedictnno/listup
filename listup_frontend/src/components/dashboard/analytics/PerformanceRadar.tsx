"use client";

import { Card, CardContent } from "@/components/ui/card";
import {
    RadarChart,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    Radar,
    Tooltip,
    ResponsiveContainer
} from "recharts";

interface PerformanceRadarProps {
    data: Array<{
        category: string;
        revenue: number;
        orders: number;
        conversionRate: number;
        avgPrice: number;
    }>;
    formatCurrency: (val: number) => string;
}

export default function PerformanceRadar({ data, formatCurrency }: PerformanceRadarProps) {
    return (
        <Card>
            <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">Category Performance Comparison</h3>
                <ResponsiveContainer width="100%" height={300}>
                    <RadarChart data={data}>
                        <PolarGrid />
                        <PolarAngleAxis dataKey="category" />
                        <PolarRadiusAxis />
                        <Radar
                            name="Revenue"
                            dataKey="revenue"
                            stroke="#10B981"
                            fill="#10B981"
                            fillOpacity={0.3}
                        />
                        <Radar
                            name="Orders"
                            dataKey="orders"
                            stroke="#3B82F6"
                            fill="#3B82F6"
                            fillOpacity={0.3}
                        />
                        <Tooltip />
                    </RadarChart>
                </ResponsiveContainer>
                <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                    {data.map((category) => (
                        <div key={category.category} className="p-4 bg-gray-50 rounded-lg">
                            <h4 className="font-medium text-gray-900 mb-2">{category.category}</h4>
                            <div className="space-y-1 text-sm">
                                <p>Revenue: {formatCurrency(category.revenue)}</p>
                                <p>Orders: {category.orders}</p>
                                <p>Conversion: {category.conversionRate.toFixed(2)}%</p>
                                <p>Avg Price: {formatCurrency(category.avgPrice)}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
