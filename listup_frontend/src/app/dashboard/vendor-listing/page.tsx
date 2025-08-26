"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function VendorListingsPage() {
  return (
    <div className="p-4 md:p-6">
      <Card>
        <CardHeader>
          <CardTitle>My Listings</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Your product listings will appear here.</p>
        </CardContent>
      </Card>
    </div>
  );
}
