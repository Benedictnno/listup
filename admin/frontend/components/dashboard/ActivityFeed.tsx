'use client';

import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import Badge from '@/components/ui/badge';
import {
  UserPlus,
  Package,
  Store,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  Loader2
} from 'lucide-react';
import dashboardService, { RecentActivity } from '@/services/dashboardService';

export default function ActivityFeed() {
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        setLoading(true);
        const data = await dashboardService.getRecentActivity(10);

        // Transform the varied activities into a unified feed
        const unifiedFeed: any[] = [];

        // Users
        data.recentUsers.forEach(user => {
          unifiedFeed.push({
            id: `user-${user.id}`,
            type: 'user_signup',
            user: user.name,
            email: user.email,
            timestamp: user.createdAt,
            rawDate: new Date(user.createdAt)
          });
        });

        // Listings
        data.recentListings.forEach(listing => {
          unifiedFeed.push({
            id: `listing-${listing.id}`,
            type: 'listing_created',
            user: listing.seller.name,
            title: listing.title,
            category: listing.seller.vendorProfile?.storeName || 'Vendor',
            timestamp: listing.createdAt,
            rawDate: new Date(listing.createdAt)
          });
        });

        // Vendors
        data.recentVendors.forEach(vendor => {
          unifiedFeed.push({
            id: `vendor-${vendor.id}`,
            type: vendor.vendorProfile.verificationStatus === 'APPROVED' ? 'vendor_approved' : 'vendor_application',
            user: vendor.name,
            store: vendor.vendorProfile.storeName,
            timestamp: vendor.createdAt,
            rawDate: new Date(vendor.createdAt)
          });
        });

        // Ads
        data.recentAds.forEach(ad => {
          unifiedFeed.push({
            id: `ad-${ad.id}`,
            type: 'ad_created',
            user: ad.vendor.name,
            title: `${ad.type} Ad`,
            amount: ad.amount,
            timestamp: ad.createdAt,
            rawDate: new Date(ad.createdAt)
          });
        });

        // Sort by date descending
        unifiedFeed.sort((a, b) => b.rawDate.getTime() - a.rawDate.getTime());

        setActivities(unifiedFeed.slice(0, 10));
      } catch (error) {
        console.error('Failed to fetch activities:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
  }, []);

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'user_signup':
        return <UserPlus className="h-5 w-5 text-blue-500" />;
      case 'listing_created':
        return <Package className="h-5 w-5 text-green-500" />;
      case 'vendor_approved':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'listing_reported':
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      case 'vendor_application':
        return <Store className="h-5 w-5 text-purple-500" />;
      case 'ad_created':
        return <TrendingUp className="h-5 w-5 text-orange-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  const getActivityBadge = (type: string) => {
    switch (type) {
      case 'user_signup':
        return <Badge className="bg-blue-100 text-blue-800">New User</Badge>;
      case 'listing_created':
        return <Badge className="bg-green-100 text-green-800">New Listing</Badge>;
      case 'vendor_approved':
        return <Badge className="bg-green-100 text-green-800">Vendor Approved</Badge>;
      case 'listing_reported':
        return <Badge className="bg-red-100 text-red-800">Reported</Badge>;
      case 'vendor_application':
        return <Badge className="bg-purple-100 text-purple-800">Vendor Application</Badge>;
      case 'ad_created':
        return <Badge className="bg-orange-100 text-orange-800">New Ad</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">Activity</Badge>;
    }
  };

  const getActivityDescription = (activity: any) => {
    switch (activity.type) {
      case 'user_signup':
        return (
          <p className="text-sm text-gray-600">
            <span className="font-medium text-gray-900">{activity.user}</span> signed up with email {activity.email}
          </p>
        );
      case 'listing_created':
        return (
          <p className="text-sm text-gray-600">
            <span className="font-medium text-gray-900">{activity.user}</span> created a new listing: <span className="font-medium">{activity.title}</span>
          </p>
        );
      case 'vendor_approved':
        return (
          <p className="text-sm text-gray-600">
            <span className="font-medium text-gray-900">{activity.user}</span>'s vendor account <span className="font-medium">{activity.store}</span> was approved
          </p>
        );
      case 'listing_reported':
        return (
          <p className="text-sm text-gray-600">
            <span className="font-medium text-gray-900">{activity.user}</span> reported listing <span className="font-medium">{activity.title}</span>
          </p>
        );
      case 'vendor_application':
        return (
          <p className="text-sm text-gray-600">
            <span className="font-medium text-gray-900">{activity.user}</span> applied for vendor account: <span className="font-medium">{activity.store}</span>
          </p>
        );
      case 'ad_created':
        return (
          <p className="text-sm text-gray-600">
            <span className="font-medium text-gray-900">{activity.user}</span> created a new <span className="font-medium">{activity.title}</span> (₦{activity.amount?.toLocaleString()})
          </p>
        );
      default:
        return <p className="text-sm text-gray-600">Activity on platform</p>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>
          Latest actions and events across the platform
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        ) : activities.length > 0 ? (
          <div className="space-y-5">
            {activities.map((activity) => (
              <div key={activity.id} className="flex items-start space-x-4">
                <div className="mt-1">
                  {getActivityIcon(activity.type)}
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    {getActivityBadge(activity.type)}
                    <span className="text-xs text-gray-500">
                      {formatTime(activity.timestamp)}
                    </span>
                  </div>
                  {getActivityDescription(activity)}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-500 py-8">No recent activity found</p>
        )}
      </CardContent>
    </Card>
  );
}
