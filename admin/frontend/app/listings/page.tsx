"use client";

import { useMemo, useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Grid3X3, List, Search, Tag } from "lucide-react";

interface Listing {
  id: string;
  title: string;
  price: number;
  status: "ACTIVE" | "DRAFT" | "ARCHIVED";
  category: string;
}

const sampleListings: Listing[] = [
  { id: "l1", title: "Wireless Headphones", price: 129.99, status: "ACTIVE", category: "Electronics" },
  { id: "l2", title: "Organic Coffee Beans", price: 19.5, status: "ACTIVE", category: "Grocery" },
  { id: "l3", title: "Yoga Mat", price: 35.0, status: "DRAFT", category: "Fitness" },
  { id: "l4", title: "Smart Watch", price: 199.0, status: "ARCHIVED", category: "Electronics" },
  { id: "l5", title: "Leather Wallet", price: 49.99, status: "ACTIVE", category: "Accessories" },
];

export default function ListingsPage() {
  const [view, setView] = useState<"grid" | "list">("grid");
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<"ALL" | Listing["status"]>("ALL");

  const filtered = useMemo(() => {
    return sampleListings.filter((l) => {
      const matchesQuery = l.title.toLowerCase().includes(query.toLowerCase());
      const matchesStatus = status === "ALL" ? true : l.status === status;
      return matchesQuery && matchesStatus;
    });
  }, [query, status]);

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

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search listings..." value={query} onChange={(e) => setQuery(e.target.value)} className="pl-8" />
              </div>
              <div>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  className="h-10 w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="ALL">All Status</option>
                  <option value="ACTIVE">Active</option>
                  <option value="DRAFT">Draft</option>
                  <option value="ARCHIVED">Archived</option>
                </select>
              </div>
              <div>
                <Button className="w-full">Add Listing</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Content */}
        {view === "grid" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((l) => (
              <Card key={l.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-medium">{l.title}</h3>
                      <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                        <Tag className="h-3 w-3" /> {l.category}
                      </p>
                    </div>
                    <span className="text-sm font-semibold">${l.price.toFixed(2)}</span>
                  </div>
                  <div className="mt-3">
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                      l.status === "ACTIVE" ? "bg-green-100 text-green-700" : l.status === "DRAFT" ? "bg-yellow-100 text-yellow-700" : "bg-gray-200 text-gray-700"
                    }`}>{l.status}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-0">
              <table className="w-full text-sm">
                <thead className="text-left text-muted-foreground">
                  <tr className="border-b">
                    <th className="py-2 px-3">Title</th>
                    <th className="py-2 px-3">Category</th>
                    <th className="py-2 px-3">Price</th>
                    <th className="py-2 px-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((l) => (
                    <tr key={l.id} className="border-b hover:bg-muted/50">
                      <td className="py-2 px-3">{l.title}</td>
                      <td className="py-2 px-3">{l.category}</td>
                      <td className="py-2 px-3">${l.price.toFixed(2)}</td>
                      <td className="py-2 px-3">
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                          l.status === "ACTIVE" ? "bg-green-100 text-green-700" : l.status === "DRAFT" ? "bg-yellow-100 text-yellow-700" : "bg-gray-200 text-gray-700"
                        }`}>{l.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}