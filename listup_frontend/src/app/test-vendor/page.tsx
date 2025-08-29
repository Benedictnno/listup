"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getVendorListings, getStoreListings } from "@/lib/api/vendors";

export default function TestVendorPage() {
  const [vendorId, setVendorId] = useState("");
  const [storeName, setStoreName] = useState("");
  const [vendorResult, setVendorResult] = useState<any>(null);
  const [storeResult, setStoreResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const testVendorEndpoint = async () => {
    if (!vendorId.trim()) return;
    
    setLoading(true);
    try {
      const result = await getVendorListings(vendorId, 1, 5);
      setVendorResult(result);
    } catch (error) {
      setVendorResult({ error: error instanceof Error ? error.message : 'Unknown error' });
    } finally {
      setLoading(false);
    }
  };

  const testStoreEndpoint = async () => {
    if (!storeName.trim()) return;
    
    setLoading(true);
    try {
      const result = await getStoreListings(storeName, 1, 5);
      setStoreResult(result);
    } catch (error) {
      setStoreResult({ error: error instanceof Error ? error.message : 'Unknown error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">🧪 Test Vendor Endpoints</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Test Vendor by ID */}
          <Card>
            <CardHeader>
              <CardTitle>Test Vendor by ID</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Vendor ID
                </label>
                <Input
                  value={vendorId}
                  onChange={(e) => setVendorId(e.target.value)}
                  placeholder="Enter vendor ID..."
                  className="w-full"
                />
              </div>
              <Button 
                onClick={testVendorEndpoint}
                disabled={loading || !vendorId.trim()}
                className="w-full"
              >
                {loading ? 'Testing...' : 'Test Endpoint'}
              </Button>
              
              {vendorResult && (
                <div className="mt-4">
                  <h4 className="font-medium text-gray-900 mb-2">Result:</h4>
                  <pre className="bg-gray-100 p-3 rounded text-xs overflow-auto">
                    {JSON.stringify(vendorResult, null, 2)}
                  </pre>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Test Store by Name */}
          <Card>
            <CardHeader>
              <CardTitle>Test Store by Name</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Store Name
                </label>
                <Input
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  placeholder="Enter store name..."
                  className="w-full"
                />
              </div>
              <Button 
                onClick={testStoreEndpoint}
                disabled={loading || !storeName.trim()}
                className="w-full"
              >
                {loading ? 'Testing...' : 'Test Endpoint'}
              </Button>
              
              {storeResult && (
                <div className="mt-4">
                  <h4 className="font-medium text-gray-900 mb-2">Result:</h4>
                  <pre className="bg-gray-100 p-3 rounded text-xs overflow-auto">
                    {JSON.stringify(storeResult, null, 2)}
                  </pre>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Instructions */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>📚 How to Test</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm text-gray-600">
              <p>
                <strong>1. Test Vendor by ID:</strong> Enter a vendor ID to test the 
                <code className="bg-gray-100 px-2 py-1 rounded">/vendors/:vendorId/public</code> endpoint
              </p>
              <p>
                <strong>2. Test Store by Name:</strong> Enter a store name to test the 
                <code className="bg-gray-100 px-2 py-1 rounded">/stores/:storeName</code> endpoint
              </p>
              <p>
                <strong>3. Expected Response:</strong> Both endpoints should return vendor info, listings, and pagination data
              </p>
              <p>
                <strong>4. Error Handling:</strong> If vendor/store doesn't exist, you'll get a 404 error
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="mt-8 text-center">
          <p className="text-gray-600 mb-4">
            Test the actual vendor pages:
          </p>
          <div className="space-x-4">
            <Button variant="outline" asChild>
              <a href="/vendors/test-vendor-id">View Vendor Page</a>
            </Button>
            <Button variant="outline" asChild>
              <a href="/stores/test-store">View Store Page</a>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
