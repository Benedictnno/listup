"use client";
import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createAd } from "@/lib/api/ad";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useRouter } from "next/navigation";
import api from "@/utils/axios";
import { safeLocalStorage } from "@/utils/helpers";

type AdPlan = {
  type: string;
  description: string;
  price: number;
};

type Ad = {
  id: string;
  type: string;
  status: string;
  startDate: string;
  endDate: string;
  paymentStatus: string;
  amount: number;
};

type Store = {
  id: string;
  storeName: string;
};

type Product = {
  id: string;
  name: string;
};

export default function AdsPage() {
  const [plans] = useState<AdPlan[]>([
    { type: "STOREFRONT", description: "Highlight your store on the homepage", price: 5000 },
    { type: "PRODUCT_PROMOTION", description: "Boost your product visibility", price: 3000 },
    { type: "SEARCH_BOOST", description: "Rank higher in search results", price: 2000 },
  ]);
  const [ads, setAds] = useState<Ad[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<string>("");
  const [storeId, setStoreId] = useState<string>("");
  const [productId, setProductId] = useState<string>("");
  const [duration, setDuration] = useState<number>(7);

//   const token = localStorage.getItem("token");
//   const id = localStorage.getItem("id");
  const router = useRouter();
  
  // Function to refresh ads list
  const refreshAds = async () => {
    try {
      const token = safeLocalStorage.getItem("token");
      const id = safeLocalStorage.getItem("id");
      
      if (!token || !id) {
        console.error("No token or ID found");
        return;
      }

      const adsRes = await api.get(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/ads/vendor/${id}`, { 
        headers: { Authorization: `Bearer ${token}` } 
      });

      console.log("Ads refreshed:", adsRes.data);
      setAds(adsRes.data);
    } catch (err) {
      console.error("Error refreshing ads:", err);
    }
  };
  
    // fetch vendor ads, stores & products
  useEffect(() => {
    async function fetchData() {
      try {
        const token = safeLocalStorage.getItem("token");
        const id = safeLocalStorage.getItem("id");
        
        if (!token || !id) {
          console.error("No token or ID found");
          return;
        }

        const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
        
        // Fire requests in parallel
        const [adsRes, storesRes, productsRes] = await Promise.all([
          api.get(`${apiBase}/api/ads/vendor/${id}`, { 
            headers: { Authorization: `Bearer ${token}` } 
          }),
          api.get(`${apiBase}/api/stores/vendor/${id}`, { 
            headers: { Authorization: `Bearer ${token}` } 
          }),
          api.get(`${apiBase}/api/products/vendor/${id}`, { 
            headers: { Authorization: `Bearer ${token}` } 
          }),
        ]);

        console.log("Vendor ads fetched:", adsRes.data);
        console.log("Vendor stores fetched:", storesRes.data);
        console.log("Vendor products fetched:", productsRes.data);

        // Axios auto-parses JSON → use .data directly
        setAds(adsRes.data);
        setStores(storesRes.data);
        setProducts(productsRes.data);
      } catch (err) {
        console.error("Error fetching vendor data:", err);
      }
    }

    fetchData();
  }, []);

  const handleCreateAd = async () => {
    try {
      // Get the plan price based on selected plan
      const planPrices: { [key: string]: number } = {
        "STOREFRONT": 5000,
        "PRODUCT_PROMOTION": 3000,
        "SEARCH_BOOST": 2000
      };
      
      const amount = planPrices[selectedPlan] || 0;
      
      const payload: any = {
        type: selectedPlan,
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + duration * 24 * 60 * 60 * 1000).toISOString(),
        amount: amount, // Add the amount field
      };

      if (selectedPlan === "STOREFRONT") {
        const storeId = safeLocalStorage.getItem("id");
        if (!storeId) {
          alert("Store ID not found. Please login again.");
          return;
        }
        payload.storeId = storeId;
      }
      if (selectedPlan === "PRODUCT_PROMOTION") {
        if (!productId) {
          alert("Please select a product for product promotion.");
          return;
        }
        payload.productId = productId;
      }

      const ad = await createAd(payload);
      if (ad?.id) {
        // Add the new ad to the local state
        setAds(prevAds => [ad, ...prevAds]);
        
        // Reset form
        setSelectedPlan("");
        setStoreId("");
        setProductId("");
        setDuration(7);
        
        alert("Ad created. Redirecting to payment...");
        router.push(`/dashboard/promote/payments/${ad.id}`); // Fix the route path
      } else {
        alert(ad.message || "Error creating ad");
      }
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Failed to create ad. Please try again.");
    }
  };

  return (
    <div className="p-6 space-y-8">
      {/* Ad Plans */}
      <section>
        <h2 className="text-xl font-bold mb-4">Ad Plans</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {plans.map((plan) => (
            <Card key={plan.type} className="p-4 border rounded-2xl">
              <CardContent>
                <h3 className="font-semibold">{plan.type}</h3>
                <p className="text-sm text-gray-500">{plan.description}</p>
                <p className="font-bold mt-2">₦{plan.price}</p>
                <Button
                  className="mt-3 w-full"
                  onClick={() => {
                    setSelectedPlan(plan.type);
                    setStoreId("");
                    setProductId("");
                  }}
                >
                  Select
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Create Ad Form */}
      {selectedPlan && (
        <section className="p-4 border rounded-2xl">
          <h2 className="text-lg font-bold mb-3">Create Ad</h2>
          <p className="mb-2">Selected Plan: {selectedPlan}</p>

          {/* Storefront requires storeId */}
          {selectedPlan === "STOREFRONT" && (
            <div className="mb-3">
              <label className="block mb-1 font-medium">Select Store</label>
              <Select value={storeId} onValueChange={setStoreId}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a store" />
                </SelectTrigger>
                <SelectContent>
                  {stores.map((store) => (
                    <SelectItem key={store.id} value={store.id}>
                      {store.storeName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Product promotion requires productId */}
          {selectedPlan === "PRODUCT_PROMOTION" && (
            <div className="mb-3">
              <label className="block mb-1 font-medium">Select Product</label>
              <Select value={productId} onValueChange={setProductId}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a product" />
                </SelectTrigger>
                <SelectContent>
                  {products.map((product) => (
                    <SelectItem key={product.id} value={product.id}>
                      {product.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Duration */}
          <Input
            type="number"
            placeholder="Duration in days"
            value={duration}
            onChange={(e) => setDuration(Number(e.target.value))}
            className="mb-3"
          />

          <Button onClick={handleCreateAd}>Create & Pay</Button>
        </section>
      )}

      {/* My Ads */}
      <section>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">My Current Ads</h2>
          <Button onClick={refreshAds} variant="outline" size="sm">
            Refresh
          </Button>
        </div>
        {ads.length === 0 ? (
          <p className="text-gray-500">You have no active ads.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {ads.map((ad) => (
              <Card key={ad.id} className="p-4">
                <CardContent>
                  <h3 className="font-semibold">{ad.type}</h3>
                  <p>
                    Status: <span className="font-medium">{ad.status}</span>
                  </p>
                  <p>
                    Payment: <span className={`font-medium ${
                      ad.paymentStatus === 'SUCCESS' ? 'text-green-600' : 
                      ad.paymentStatus === 'PENDING' ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {ad.paymentStatus}
                    </span>
                  </p>
                  <p>Amount: ₦{ad.amount?.toLocaleString() || 'N/A'}</p>
                  <p>Start: {new Date(ad.startDate).toLocaleDateString()}</p>
                  <p>End: {new Date(ad.endDate).toLocaleDateString()}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
