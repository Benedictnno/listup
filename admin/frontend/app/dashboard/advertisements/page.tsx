'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/useToast';
import { api } from '@/services/api';

interface Advertisement {
  id: string;
  title: string;
  imageUrl: string;
  targetUrl?: string;
  duration: number;
  startDate: string;
  expiryDate: string;
  isActive: boolean;
  position: 'HERO_CAROUSEL' | 'RANDOM';
  impressions: number;
  clicks: number;
  createdBy: {
    name: string;
    email: string;
  };
}

export default function AdvertisementsPage() {
  const [advertisements, setAdvertisements] = useState<Advertisement[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'active' | 'expired'>('all');
  const router = useRouter();
  const toast = useToast();

  const fetchAdvertisements = async () => {
    try {
      setLoading(true);
      const statusParam = filter !== 'all' ? `?status=${filter}` : '';

      const response = await api.get(`/advertisements${statusParam}`);

      setAdvertisements(response.data.data.advertisements);
    } catch (error) {
      console.error('Error fetching advertisements:', error);
      toast.error('Failed to fetch advertisements');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdvertisements();
  }, [filter]);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this advertisement?')) {
      return;
    }

    try {
      await api.delete(`/advertisements/${id}`);

      toast.success('Advertisement deleted successfully');
      fetchAdvertisements();
    } catch (error) {
      console.error('Error deleting advertisement:', error);
      toast.error('Failed to delete advertisement');
    }
  };

  const toggleActive = async (id: string, currentStatus: boolean) => {
    try {
      await api.put(
        `/advertisements/${id}`,
        { isActive: !currentStatus }
      );

      toast.success(`Advertisement ${!currentStatus ? 'activated' : 'deactivated'} successfully`);
      fetchAdvertisements();
    } catch (error) {
      console.error('Error updating advertisement:', error);
      toast.error('Failed to update advertisement');
    }
  };

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Advertisement Management</h1>
        <Button onClick={() => router.push('/dashboard/advertisements/create')}>
          Create New Ad
        </Button>
      </div>

      <div className="mb-4 flex gap-2">
        <Button
          variant={filter === 'all' ? 'default' : 'outline'}
          onClick={() => setFilter('all')}
        >
          All
        </Button>
        <Button
          variant={filter === 'active' ? 'default' : 'outline'}
          onClick={() => setFilter('active')}
        >
          Active
        </Button>
        <Button
          variant={filter === 'expired' ? 'default' : 'outline'}
          onClick={() => setFilter('expired')}
        >
          Expired
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="text-lg">Loading advertisements...</div>
        </div>
      ) : advertisements.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-gray-500">No advertisements found</p>
            <Button
              className="mt-4"
              onClick={() => router.push('/advertisements/create')}
            >
              Create Your First Ad
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {advertisements.map((ad) => {
            const isExpired = new Date(ad.expiryDate) < new Date();
            const isCurrentlyActive = ad.isActive && !isExpired;

            return (
              <Card key={ad.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {ad.title}
                        <span
                          className={`text-xs px-2 py-1 rounded ${isCurrentlyActive
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                            }`}
                        >
                          {isCurrentlyActive ? 'Active' : 'Inactive'}
                        </span>
                        <span className="text-xs px-2 py-1 rounded bg-blue-100 text-blue-800">
                          {ad.position === 'HERO_CAROUSEL' ? 'Hero Carousel' : 'Random Section'}
                        </span>
                      </CardTitle>
                      <CardDescription>
                        Created by {ad.createdBy.name} | Duration: {ad.duration} days
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant={ad.isActive ? 'destructive' : 'default'}
                        size="sm"
                        onClick={() => toggleActive(ad.id, ad.isActive)}
                      >
                        {ad.isActive ? 'Deactivate' : 'Activate'}
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(ad.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-4">
                    <img
                      src={ad.imageUrl}
                      alt={ad.title}
                      className="w-48 h-32 object-cover rounded border"
                    />
                    <div className="flex-1">
                      <div className="grid grid-cols-2 gap-2 mb-4">
                        <p className="text-sm text-gray-600">
                          <strong>Start Date:</strong>{' '}
                          {new Date(ad.startDate).toLocaleDateString()}
                        </p>
                        <p className="text-sm text-gray-600">
                          <strong>Expiry Date:</strong>{' '}
                          {new Date(ad.expiryDate).toLocaleDateString()}
                        </p>
                      </div>
                      {ad.targetUrl && (
                        <p className="text-sm text-gray-600 mb-2">
                          <strong>Target URL:</strong>{' '}
                          <a
                            href={ad.targetUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline"
                          >
                            {ad.targetUrl}
                          </a>
                        </p>
                      )}
                      <div className="flex gap-6 mt-4 p-4 bg-gray-50 rounded">
                        <div className="text-sm">
                          <div className="text-gray-500">Impressions</div>
                          <div className="text-2xl font-bold">{ad.impressions}</div>
                        </div>
                        <div className="text-sm">
                          <div className="text-gray-500">Clicks</div>
                          <div className="text-2xl font-bold">{ad.clicks}</div>
                        </div>
                        <div className="text-sm">
                          <div className="text-gray-500">CTR</div>
                          <div className="text-2xl font-bold">
                            {ad.impressions > 0
                              ? ((ad.clicks / ad.impressions) * 100).toFixed(2)
                              : 0}
                            %
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
