'use client';

import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import  Badge  from '@/components/ui/badge';
import { 
  UserPlus, 
  Package, 
  Store, 
  AlertTriangle, 
  CheckCircle, 
  Clock
} from 'lucide-react';

// Mock data for recent activities
const activities = [
  {
    id: 1,
    type: 'user_signup',
    user: 'John Doe',
    email: 'john@example.com',
    timestamp: '2023-06-15T10:30:00Z',
  },
  {
    id: 2,
    type: 'listing_created',
    user: 'Jane Smith',
    title: 'iPhone 13 Pro Max',
    category: 'Electronics',
    timestamp: '2023-06-15T09:45:00Z',
  },
  {
    id: 3,
    type: 'vendor_approved',
    user: 'Mike Johnson',
    store: 'Mike\'s Electronics',
    timestamp: '2023-06-15T08:20:00Z',
  },
  {
    id: 4,
    type: 'listing_reported',
    user: 'Alice Brown',
    title: 'Suspicious Item',
    reason: 'Prohibited item',
    timestamp: '2023-06-14T22:15:00Z',
  },
  {
    id: 5,
    type: 'vendor_application',
    user: 'Robert Wilson',
    store: 'Wilson Clothing',
    timestamp: '2023-06-14T18:30:00Z',
  },
  {
    id: 6,
    type: 'user_signup',
    user: 'Sarah Davis',
    email: 'sarah@example.com',
    timestamp: '2023-06-14T16:45:00Z',
  },
  {
    id: 7,
    type: 'listing_created',
    user: 'Tom Harris',
    title: 'Toyota Camry 2020',
    category: 'Vehicles',
    timestamp: '2023-06-14T14:20:00Z',
  },
];

export default function ActivityFeed() {
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
            <span className="font-medium text-gray-900">{activity.user}</span> created a new listing: <span className="font-medium">{activity.title}</span> in {activity.category}
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
            <span className="font-medium text-gray-900">{activity.user}</span> reported listing <span className="font-medium">{activity.title}</span> for {activity.reason}
          </p>
        );
      case 'vendor_application':
        return (
          <p className="text-sm text-gray-600">
            <span className="font-medium text-gray-900">{activity.user}</span> applied for vendor account: <span className="font-medium">{activity.store}</span>
          </p>
        );
      default:
        return <p className="text-sm text-gray-600">Unknown activity</p>;
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
      </CardContent>
    </Card>
  );
}