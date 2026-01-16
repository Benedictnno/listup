"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid,
    ResponsiveContainer,
    AreaChart,
    Area,
} from "recharts";

interface SalesChartsProps {
    data: any[];
    chartType: string;
    setChartType: (type: string) => void;
    formatCurrency: (val: number) => string;
}

export default function SalesCharts({ data, chartType, setChartType, formatCurrency }: SalesChartsProps) {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Revenue Chart */}
            <Card>
                <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold">Revenue Performance</h3>
                        <Select value={chartType} onValueChange={setChartType}>
                            <SelectTrigger className="w-24">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="daily">Daily</SelectItem>
                                <SelectItem value="weekly">Weekly</SelectItem>
                                <SelectItem value="monthly">Monthly</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <ResponsiveContainer width="100%" height={300}>
                        <AreaChart data={data}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey={chartType === 'daily' ? 'date' : chartType === 'weekly' ? 'week' : 'month'} />
                            <YAxis />
                            <Tooltip
                                formatter={(value: any) => [formatCurrency(value), 'Revenue']}
                                labelFormatter={(label) => `Period: ${label}`}
                            />
                            <Area
                                type="monotone"
                                dataKey="revenue"
                                stroke="#10B981"
                                fill="#10B981"
                                fillOpacity={0.3}
                                strokeWidth={2}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            {/* Orders Chart */}
            <Card>
                <CardContent className="p-6">
                    <h3 className="text-lg font-semibold mb-4">Orders Performance</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={data}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey={chartType === 'daily' ? 'date' : chartType === 'weekly' ? 'week' : 'month'} />
                            <YAxis />
                            <Tooltip
                                formatter={(value: any) => [value, 'Orders']}
                                labelFormatter={(label) => `Period: ${label}`}
                            />
                            <Line
                                type="monotone"
                                dataKey="orders"
                                stroke="#3B82F6"
                                strokeWidth={2}
                                dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
        </div>
    );
}
