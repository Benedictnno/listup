"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { VendorStats } from "@/services/statsService";
import { SimpleBarChart, SimplePieChart, SimpleLineChart, StatsCard } from "./SimpleCharts";

export function VendorStatsOverview({ stats }: { stats: VendorStats }) {
  if (!stats) return null;

  const { totalVendors, activeVendors, newVendors, topVendorsByListings, vendorsByCategory, vendorGrowth } = stats;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard 
          title="Total Vendors" 
          value={totalVendors} 
          description="All registered vendors"
        />
        <StatsCard 
          title="Active Vendors" 
          value={activeVendors} 
          description={`${Math.round((activeVendors / totalVendors) * 100)}% of total`}
        />
        <StatsCard 
          title="New Vendors (30d)" 
          value={newVendors} 
          description={`${Math.round((newVendors / totalVendors) * 100)}% growth`}
        />
        <StatsCard 
          title="Avg. Listings per Vendor" 
          value={(stats.totalListings / totalVendors).toFixed(1)} 
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Top Vendors by Listings</CardTitle>
          </CardHeader>
          <CardContent>
            <SimpleBarChart 
              data={topVendorsByListings} 
              labelKey="name" 
              valueKey="listings"
              height={250}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Vendors by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <SimplePieChart 
              data={vendorsByCategory} 
              labelKey="category" 
              valueKey="count"
            />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Vendor Growth (Last 6 Months)</CardTitle>
        </CardHeader>
        <CardContent>
          <SimpleLineChart 
            data={vendorGrowth} 
            xKey="month" 
            yKey="count"
            height={250}
          />
        </CardContent>
      </Card>
    </div>
  );
}