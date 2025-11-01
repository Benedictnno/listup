"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ListingStats } from "@/services/statsService";
import { SimpleBarChart, SimplePieChart, SimpleLineChart, StatsCard } from "./SimpleCharts";

export function ListingStatsOverview({ stats }: { stats: ListingStats }) {
  if (!stats) return null;

  const { totalListings, activeListings, newListings, topCategories, listingsByStatus, listingGrowth } = stats;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard 
          title="Total Listings" 
          value={totalListings} 
          description="All created listings"
        />
        <StatsCard 
          title="Active Listings" 
          value={activeListings} 
          description={`${Math.round((activeListings / totalListings) * 100)}% of total`}
        />
        <StatsCard 
          title="New Listings (30d)" 
          value={newListings} 
          description={`${Math.round((newListings / totalListings) * 100)}% growth`}
        />
        <StatsCard 
          title="Avg. Price" 
          value={`$${stats.averagePrice.toFixed(2)}`} 
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Top Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <SimpleBarChart 
              data={topCategories} 
              labelKey="name" 
              valueKey="count"
              height={250}
              color="#10b981"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Listings by Status</CardTitle>
          </CardHeader>
          <CardContent>
            <SimplePieChart 
              data={listingsByStatus} 
              labelKey="status" 
              valueKey="count"
              colors={["#10b981", "#f59e0b", "#ef4444", "#6366f1"]}
            />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Listing Growth (Last 6 Months)</CardTitle>
        </CardHeader>
        <CardContent>
          <SimpleLineChart 
            data={listingGrowth} 
            xKey="month" 
            yKey="count"
            height={250}
            color="#10b981"
          />
        </CardContent>
      </Card>
    </div>
  );
}