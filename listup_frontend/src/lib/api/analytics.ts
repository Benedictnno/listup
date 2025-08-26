// lib/api/analytics.ts
export interface AnalyticsKPIs {
  totalViews: number;
  totalSaves: number;
  engagementRate: number;
  ctr: number;
}

export interface ListingAnalytics {
  id: string;
  name: string;
  views: number;
  saves: number;
  ctr: number;
}

export async function fetchAnalyticsKPIs(): Promise<AnalyticsKPIs> {
  // replace with actual API call
  return {
    totalViews: 12000,
    totalSaves: 350,
    engagementRate: 4.2,
    ctr: 1.8,
  };
}

export async function fetchListingAnalytics(): Promise<ListingAnalytics[]> {
  // replace with actual API call
  return [
    { id: "1", name: "Perfume A", views: 3000, saves: 120, ctr: 2.1 },
    { id: "2", name: "Bag B", views: 5000, saves: 150, ctr: 1.5 },
    { id: "3", name: "Necklace C", views: 4000, saves: 80, ctr: 1.9 },
  ];
}
export async function fetchTopCategories(): Promise<string[]> {
  // replace with actual API call
  return ["Perfumes", "Bags", "Jewelry"];
}