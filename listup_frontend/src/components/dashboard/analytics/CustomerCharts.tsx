"use client";

import { Card, CardContent } from "@/components/ui/card";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid,
    ResponsiveContainer,
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
} from "recharts";

interface CustomerChartsProps {
    data: {
        lifetimeValue: Array<{ segment: string; value: number; count: number }>;
        retention: Array<{ month: string; rate: number }>;
        demographics: Array<{ age: string; count: number; revenue: number }>;
    };
    COLORS: string[];
    formatCurrency: (val: number) => string;
}

export default function CustomerCharts({ data, COLORS, formatCurrency }: CustomerChartsProps) {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Customer Lifetime Value */}
            <Card>
                <CardContent className="p-6">
                    <h3 className="text-lg font-semibold mb-4">Customer Lifetime Value</h3>
                    <ResponsiveContainer width="100%" height={250}>
                        <PieChart>
                            <Pie
                                data={data.lifetimeValue}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ segment, percent }: any) => `${segment} (${((percent || 0) * 100).toFixed(0)}%)`}
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="value"
                            >
                                {data.lifetimeValue.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip formatter={(value: any) => [formatCurrency(value), 'LTV']} />
                        </PieChart>
                    </ResponsiveContainer>
                    <div className="mt-4 space-y-2">
                        {data.lifetimeValue.map((segment, index) => (
                            <div key={segment.segment} className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div
                                        className="w-3 h-3 rounded-full"
                                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                                    ></div>
                                    <span className="text-sm text-gray-600">{segment.segment}</span>
                                </div>
                                <span className="text-sm font-medium">{segment.count} customers</span>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Customer Retention */}
            <Card>
                <CardContent className="p-6">
                    <h3 className="text-lg font-semibold mb-4">Customer Retention Rate</h3>
                    <ResponsiveContainer width="100%" height={250}>
                        <LineChart data={data.retention}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="month" />
                            <YAxis />
                            <Tooltip formatter={(value: any) => [`${(value * 100).toFixed(1)}%`, 'Retention']} />
                            <Line
                                type="monotone"
                                dataKey="rate"
                                stroke="#8B5CF6"
                                strokeWidth={2}
                                dot={{ fill: '#8B5CF6', strokeWidth: 2, r: 4 }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            {/* Customer Demographics */}
            <Card>
                <CardContent className="p-6">
                    <h3 className="text-lg font-semibold mb-4">Customer Demographics</h3>
                    <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={data.demographics}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="age" />
                            <YAxis />
                            <Tooltip formatter={(value: any) => [value, 'Count']} />
                            <Bar dataKey="count" fill="#F59E0B" />
                        </BarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
        </div>
    );
}
