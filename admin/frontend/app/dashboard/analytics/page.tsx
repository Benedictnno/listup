"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StatsService, VendorStats, ListingStats } from "@/services/statsService";
import { Loader2 } from "lucide-react";
import { VendorStatsOverview } from "@/components/analytics/VendorStatsOverview";
import { ListingStatsOverview } from "@/components/analytics/ListingStatsOverview";

export default function AnalyticsPage() {
  const [activeTab, setActiveTab] = useState("vendors");
  const [vendorStats, setVendorStats] = useState<VendorStats | null>(null);
  const [listingStats, setListingStats] = useState<ListingStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        setError(null);

        // In a real app, we would fetch from the API
        // const vendorData = await StatsService.getVendorStats();
        // const listingData = await StatsService.getListingStats();

        // Mock data for development
        const vendorData: VendorStats = {
          totalVendors: 156,
          activeVendors: 98,
          newVendors: 24,
          totalListings: 1245,
          topVendorsByListings: [
            { name: "Tech Store", listings: 45 },
            { name: "Fashion Hub", listings: 32 },
            { name: "Home Decor", listings: 28 },
            { name: "Sports World", listings: 15 },
            { name: "Book Haven", listings: 12 }
          ],
          vendorsByCategory: [
            { category: "Electronics", count: 45 },
            { category: "Clothing", count: 32 },
            { category: "Home & Garden", count: 28 },
            { category: "Sports", count: 15 }
          ],
          vendorGrowth: [
            { month: "Jan", count: 85 },
            { month: "Feb", count: 110 },
            { month: "Mar", count: 95 },
            { month: "Apr", count: 145 },
            { month: "May", count: 120 },
            { month: "Jun", count: 130 }
          ]
        };

        const listingData: ListingStats = {
          totalListings: 1245,
          activeListings: 876,
          newListings: 130,
          averagePrice: 89.99,
          topCategories: [
            { name: "Electronics", count: 320 },
            { name: "Clothing", count: 280 },
            { name: "Home & Garden", count: 210 },
            { name: "Sports", count: 175 },
            { name: "Books", count: 150 }
          ],
          listingsByStatus: [
            { status: "Active", count: 876 },
            { status: "Pending", count: 189 },
            { status: "Sold", count: 120 },
            { status: "Inactive", count: 60 }
          ],
          listingGrowth: [
            { month: "Jan", count: 85 },
            { month: "Feb", count: 110 },
            { month: "Mar", count: 95 },
            { month: "Apr", count: 145 },
            { month: "May", count: 120 },
            { month: "Jun", count: 130 }
          ]
        };

        setVendorStats(vendorData);
        setListingStats(listingData);
      } catch (err) {
        console.error("Failed to fetch stats:", err);
        setError("Failed to load analytics data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
      </div>

      <Tabs defaultValue="vendors" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="vendors">Vendor Analytics</TabsTrigger>
          <TabsTrigger value="listings">Listing Analytics</TabsTrigger>
        </TabsList>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : error ? (
          <Card className="mt-6">
            <CardContent className="pt-6">
              <div className="text-center text-destructive">{error}</div>
            </CardContent>
          </Card>
        ) : (
          <>
            <TabsContent value="vendors" className="mt-6 space-y-6">
              {vendorStats && <VendorStatsOverview stats={vendorStats} />}
            </TabsContent>

            <TabsContent value="listings" className="mt-6 space-y-6">
              {listingStats && <ListingStatsOverview stats={listingStats} />}
            </TabsContent>
          </>
        )}
      </Tabs>
    </div>
  );
}