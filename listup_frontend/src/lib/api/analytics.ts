const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.listup.ng/api";

export async function trackListingView(listingId: string, sessionId?: string) {
  try {
    await fetch(`${API_BASE_URL}/analytics/listings/${listingId}/view`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ sessionId }),
    });
  } catch (e) {
    console.error('Failed to track listing view', e);
  }
}

export async function trackListingSave(listingId: string) {
  try {
    await fetch(`${API_BASE_URL}/analytics/listings/${listingId}/save`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });
  } catch (e) {
    console.error('Failed to track listing save', e);
  }
}

export async function trackListingMessageClick(listingId: string) {
  try {
    await fetch(`${API_BASE_URL}/analytics/listings/${listingId}/message-click`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });
  } catch (e) {
    console.error('Failed to track listing message click', e);
  }
}

export interface ListingMetricsSummary {
  listingId: string;
  views: number;
  saves: number;
  messages: number;
}

export interface VendorListingMetricsResponse {
  range: string;
  from: string | null;
  to: string;
  totals: {
    views: number;
    saves: number;
    messages: number;
  };
  perListing: ListingMetricsSummary[];
}

export async function fetchVendorListingMetrics(
  vendorId: string,
  range: '7d' | '30d' | 'all' = '30d'
): Promise<VendorListingMetricsResponse> {
  const url = `${API_BASE_URL}/analytics/vendors/${vendorId}/listings-metrics?range=${range}`;
  const res = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  });

  if (!res.ok) {
    throw new Error('Failed to fetch listing metrics');
  }

  return res.json();
}
