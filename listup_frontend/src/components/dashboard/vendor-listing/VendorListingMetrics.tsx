import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface VendorListingMetricsProps {
    metricsTotals: { views: number; saves: number; messages: number };
    filteredListingsCount: number;
    metricsRange: '7d' | '30d' | 'all';
    setMetricsRange: (value: '7d' | '30d' | 'all') => void;
}

export function VendorListingMetrics({
    metricsTotals,
    filteredListingsCount,
    metricsRange,
    setMetricsRange,
}: VendorListingMetricsProps) {
    return (
        <div className="space-y-4">
            {/* Results summary */}
            <div className="flex justify-between items-center text-sm text-gray-600">
                <span>{filteredListingsCount} result{filteredListingsCount === 1 ? '' : 's'}</span>
                <div className="flex items-center gap-2">
                    <span className="hidden sm:inline">Date range:</span>
                    <Select value={metricsRange} onValueChange={(value) => setMetricsRange(value as '7d' | '30d' | 'all')}>
                        <SelectTrigger className="w-32">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="7d">Last 7 days</SelectItem>
                            <SelectItem value="30d">Last 30 days</SelectItem>
                            <SelectItem value="all">All time</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Metrics overview */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                <Card>
                    <CardContent className="py-3 flex flex-col items-start">
                        <span className="text-xs text-gray-500">Total Views</span>
                        <span className="text-lg font-semibold">{metricsTotals.views.toLocaleString()}</span>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="py-3 flex flex-col items-start">
                        <span className="text-xs text-gray-500">Total Saves</span>
                        <span className="text-lg font-semibold">{metricsTotals.saves.toLocaleString()}</span>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="py-3 flex flex-col items-start">
                        <span className="text-xs text-gray-500">Total Messages</span>
                        <span className="text-lg font-semibold">{metricsTotals.messages.toLocaleString()}</span>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
