"use client";

import { useMemo, useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Input } from "@/components/ui/input";
import Button from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Grid3X3, List, Search, Tag, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import axios from "axios";
import { toast } from "react-hot-toast";

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4001/api';

interface Listing {
  id: string;
  title: string;
  price: number;
  isActive: boolean;
  category?: {
    name: string;
  };
  seller?: {
    name: string;
  };
  createdAt: string;
  images?: string[];
}

export default function ListingsPage() {
  const [view, setView] = useState<"grid" | "list">("grid");
  const [query, setQuery] = useState("");
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalListings, setTotalListings] = useState(0);
  const limit = 20;

  useEffect(() => {
    fetchListings();
  }, [page]);

  const fetchListings = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${API_URL}/listings?page=${page}&limit=${limit}&sortBy=createdAt&sortOrder=desc`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      const data = response.data.data || response.data;
      setListings(Array.isArray(data.listings) ? data.listings : Array.isArray(data) ? data : []);
      setTotalPages(data.totalPages || Math.ceil((data.total || 0) / limit));
      setTotalListings(data.total || 0);
    } catch (error) {
      console.error('Error fetching listings:', error);
      toast.error('Failed to load listings');
      setListings([]);
    } finally {
      setLoading(false);
    }
  };

  const filtered = useMemo(() => {
    return listings.filter((l) => {
      const matchesQuery = l.title.toLowerCase().includes(query.toLowerCase());
      return matchesQuery;
    });
  }, [query, listings]);

  return (
    <DashboardLayout>
      <div className="p-4 md:p-6 space-y-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Listings</h1>
            <p className="text-muted-foreground">Browse and manage product listings</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant={view === "grid" ? "default" : "outline"} onClick={() => setView("grid")}>
              <Grid3X3 className="mr-2 h-4 w-4" /> Grid
            </Button>
            <Button variant={view === "list" ? "default" : "outline"} onClick={() => setView("list")}>
              <List className="mr-2 h-4 w-4" /> List
            </Button>
          </div>
        </div>

        {/* Filters & Stats */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center justify-between">
              <span>Filters</span>
              <span className="text-sm font-normal text-muted-foreground">
                Showing {filtered.length} of {totalListings} listings
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search listings..." value={query} onChange={(e) => setQuery(e.target.value)} className="pl-8" />
              </div>
              <div>
                <Button className="w-full" onClick={fetchListings}>
                  Refresh
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Content */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : filtered.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">No listings found</p>
            </CardContent>
          </Card>
        ) : view === "grid" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((l) => (
              <Card key={l.id} className="overflow-hidden">
                {l.images && l.images.length > 0 && (
                  <div className="aspect-video w-full overflow-hidden bg-gray-100">
                    <img
                      src={l.images[0]}
                      alt={l.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium truncate">{l.title}</h3>
                      <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                        <Tag className="h-3 w-3" /> {l.category?.name || 'Uncategorized'}
                      </p>
                      {l.seller && (
                        <p className="text-xs text-muted-foreground mt-1">
                          By {l.seller.name}
                        </p>
                      )}
                    </div>
                    <span className="text-sm font-semibold whitespace-nowrap ml-2">${l.price.toFixed(2)}</span>
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                      l.isActive ? "bg-green-100 text-green-700" : "bg-gray-200 text-gray-700"
                    }`}>{l.isActive ? 'ACTIVE' : 'INACTIVE'}</span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(l.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-0 overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-left text-muted-foreground bg-muted/50">
                  <tr className="border-b">
                    <th className="py-3 px-4">Title</th>
                    <th className="py-3 px-4">Seller</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Price</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Created</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((l) => (
                    <tr key={l.id} className="border-b hover:bg-muted/50">
                      <td className="py-3 px-4 font-medium">{l.title}</td>
                      <td className="py-3 px-4">{l.seller?.name || 'N/A'}</td>
                      <td className="py-3 px-4">{l.category?.name || 'Uncategorized'}</td>
                      <td className="py-3 px-4">${l.price.toFixed(2)}</td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                          l.isActive ? "bg-green-100 text-green-700" : "bg-gray-200 text-gray-700"
                        }`}>{l.isActive ? 'ACTIVE' : 'INACTIVE'}</span>
                      </td>
                      <td className="py-3 px-4 text-muted-foreground">
                        {new Date(l.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        )}

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <Card>
            <CardContent className="py-4">
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  Page {page} of {totalPages}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}