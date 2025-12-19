"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2 } from "lucide-react";
import { toast } from "react-hot-toast";
import dashboardService, { VendorStats, ListingStats } from "@/services/dashboardService";

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

        // Fetch real analytics data from dashboard service (uses cookie-based auth)
        const [vendorData, listingData] = await Promise.all([
          dashboardService.getVendorStats().catch(() => null),
          dashboardService.getListingStats().catch(() => null)
        ]);

        if (vendorData) {
          setVendorStats({
            totalVendors: vendorData.totalVendors || 0,
            pendingVendors: vendorData.pendingVendors || 0,
            activeVendors: vendorData.activeVendors || 0,
            rejectedVendors: vendorData.rejectedVendors || 0,
            newVendors: vendorData.newVendors || 0,
            totalListings: vendorData.totalListings || 0,
            topVendorsByListings: vendorData.topVendorsByListings || [],
            vendorsByCategory: vendorData.vendorsByCategory || [],
            vendorGrowth: vendorData.vendorGrowth || []
          });
        }

        if (listingData) {
          setListingStats({
            totalListings: listingData.totalListings || 0,
            activeListings: listingData.activeListings || 0,
            inactiveListings: listingData.inactiveListings || 0,
            newListings: listingData.newListings || 0,
            averagePrice: listingData.averagePrice || 0,
            topCategories: listingData.topCategories || listingData.categoryStats || [],
            categoryStats: listingData.categoryStats || [],
            listingsByStatus: listingData.listingsByStatus || [],
            listingGrowth: listingData.listingGrowth || []
          });
        }

        if (!vendorData && !listingData) {
          throw new Error("Failed to load analytics data");
        }

      } catch (err) {
        console.error("Failed to fetch stats:", err);
        toast.error("Failed to load analytics data");
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
              {vendorStats && (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">Total Vendors</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{vendorStats.totalVendors}</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">Active Vendors</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{vendorStats.activeVendors}</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">New Vendors</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{vendorStats.newVendors}</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">Total Listings</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{vendorStats.totalListings}</div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </TabsContent>

            <TabsContent value="listings" className="mt-6 space-y-6">
              {listingStats && (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">Total Listings</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{listingStats.totalListings}</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">Active Listings</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{listingStats.activeListings}</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">New Listings</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{listingStats.newListings}</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">Average Price</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">${listingStats.averagePrice.toFixed(2)}</div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </TabsContent>
          </>
        )}
      </Tabs>
    </div>
  );
}