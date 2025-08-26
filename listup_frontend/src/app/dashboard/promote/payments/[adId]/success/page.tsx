"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function PaymentSuccessPage() {
  return (
    <div className="p-4 md:p-6">
      <Card>
        <CardHeader>
          <CardTitle>Payment Success</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Payment success page content will be added here.</p>
        </CardContent>
      </Card>
    </div>
  );
}
