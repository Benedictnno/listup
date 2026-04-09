"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import {
  Check,
  CreditCard,
  Loader2,
  Package,
  Sparkles,
  Zap,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import api from "@/utils/axios";

interface ListingTier {
  id: string;
  name: string;
  price: number;
  slots: number;
  description?: string;
}

export default function BuyListingsPage() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const [tiers, setTiers] = useState<ListingTier[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingTier, setProcessingTier] = useState<string | null>(null);

  useEffect(() => {
    async function loadTiers() {
      try {
        const res = await api.get("/listing-tiers");
        setTiers(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadTiers();
  }, []);

  const handleBuy = async (tierId: string) => {
    try {
      setProcessingTier(tierId);
      const res = await api.post("/listing-topup/initialize", { tierId });

      if (res.data.authorizationUrl) {
        window.location.href = res.data.authorizationUrl;
      }
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Payment failed to initialize. Please try again.");
    } finally {
      setProcessingTier(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-lime-500" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-12 px-4 max-w-7xl">
      {/* Hero Section */}
      <div className="text-center mb-16">
        <div className="inline-flex items-center px-4 py-2 rounded-full bg-lime-50 text-lime-700 text-sm font-bold mb-6 animate-bounce">
          🚀 Expand Your Reach
        </div>
        <h1 className="text-5xl md:text-6xl font-black text-gray-900 mb-6 tracking-tight">
          Grow Your Store <br className="hidden md:block" /> with Listing
          Bundles
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
          Choose the perfect package to reach more customers. Each bundle
          provides instant access to premium marketplace features.
        </p>
        <div className="mt-8 flex items-center justify-center gap-2">
          <div className="flex -space-x-2">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="w-10 h-10 rounded-full border-2 border-white bg-gray-200 overflow-hidden"
              >
                <img
                  src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i + 10}`}
                  alt="User"
                />
              </div>
            ))}
          </div>
          <p className="text-sm font-bold text-gray-500">
            Joined by <span className="text-lime-600">150+ new vendors</span>{" "}
            this week
          </p>
        </div>
      </div>

      {/* Urgency Banner */}
      <div className="max-w-4xl mx-auto mb-12">
        <div className="bg-gradient-to-r from-lime-500 to-lime-600 rounded-3xl p-6 md:p-8 text-white shadow-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 -mt-4 -mr-4 bg-white/10 w-32 h-32 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
          <div className="relative flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-center md:text-left">
              <h2 className="text-2xl md:text-3xl font-black mb-2">
                First Purchase Special! 🎁
              </h2>
              <p className="text-lime-50 font-bold text-lg opacity-90">
                Get an extra 20% discount automatically applied at checkout for
                your first bundle.
              </p>
            </div>
            <div className="shrink-0 bg-white text-lime-600 px-6 py-3 rounded-2xl font-black text-xl shadow-lg animate-pulse">
              OFFER ENDS SOON
            </div>
          </div>
        </div>
      </div>

      {/* Pricing Grid */}
      <div className="flex md:grid md:grid-cols-3 gap-6 md:gap-10 max-w-6xl mx-auto mb-20 overflow-x-auto pb-8 snap-x snap-mandatory px-4 md:px-0 scrollbar-hide">
        {tiers.map((tier) => (
          <Card
            key={tier.id}
            className={`snap-center shrink-0 w-[88vw] md:w-auto relative group flex flex-col overflow-hidden border-2 transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 ${tier.name === "Professional" ? "border-lime-500 ring-4 ring-lime-50 shadow-xl z-10" : "border-gray-100"}`}
          >
            {tier.name === "Professional" && (
              <div className="bg-lime-500 text-white text-center py-2 text-xs font-black uppercase tracking-widest">
                Most Popular Value
              </div>
            )}
            <CardHeader className="text-center pt-10 pb-6">
              <div
                className={`mb-6 inline-flex items-center justify-center w-16 h-16 rounded-2xl rotate-3 group-hover:rotate-0 transition-transform duration-300 ${tier.name === "Professional" ? "bg-lime-500 text-white" : "bg-gray-100 text-gray-600"}`}
              >
                {tier.slots <= 5 ? (
                  <Package size={32} />
                ) : tier.slots <= 10 ? (
                  <Sparkles size={32} />
                ) : (
                  <Zap size={32} />
                )}
              </div>
              <CardTitle className="text-3xl font-black text-gray-900">
                {tier.name}
              </CardTitle>
              <CardDescription className="text-gray-500 text-lg mt-2">
                {tier.description || "Verified marketplace slots"}
              </CardDescription>
            </CardHeader>

            <CardContent className="grow px-8 pb-10">
              <div className="text-center mb-8">
                <span className="text-sm font-bold text-gray-400 align-top mr-1">
                  ₦
                </span>
                <span className="text-6xl font-black text-gray-900 leading-none">
                  {tier.price.toLocaleString()}
                </span>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 group-hover:bg-lime-50 transition-colors">
                  <div className="w-6 h-6 rounded-full bg-lime-500 flex items-center justify-center shrink-0">
                    <Check className="h-4 w-4 text-white" />
                  </div>
                  <span className="font-bold text-gray-900">
                    {tier.slots} Premium Listing Slots
                  </span>
                </div>
                {[
                  "Limited-time First Purchase Discount",
                  "SEO Optimized indexing",
                  "Verified Vendor badge",
                  "WhatsApp bot integration",
                ].map((feature, i) => (
                  <div key={i} className="flex items-center gap-3 px-3">
                    <Check className="h-5 w-5 text-lime-500 shrink-0" />
                    <span className="text-gray-600 font-medium">{feature}</span>
                  </div>
                ))}
              </div>
            </CardContent>

            <CardFooter className="px-8 pb-10 pt-0">
              <Button
                onClick={() => handleBuy(tier.id)}
                disabled={processingTier !== null}
                className={`w-full py-8 text-xl font-black rounded-2xl transition-all duration-300 shadow-lg ${tier.name === "Professional" ? "bg-lime-500 hover:bg-lime-600 text-white shadow-lime-200" : "bg-gray-900 hover:bg-black text-white shadow-gray-200"}`}
              >
                {processingTier === tier.id ? (
                  <Loader2 className="h-6 w-6 animate-spin" />
                ) : (
                  <>
                    <Zap className="mr-3 h-6 w-6 fill-current" />
                    Activate Bundle
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {/* Social Proof Section */}
      <div className="max-w-6xl mx-auto mb-24 px-4">
        <div className="text-center mb-12">
          <p className="text-gray-500 font-black tracking-[0.2em] uppercase mb-4 text-xs">
            Trusted by Nigeria's Best Sellers
          </p>
          <h2 className="text-4xl font-black text-gray-900">
            Real Results for Real Vendors
          </h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16">
          <div className="bg-gray-50 rounded-3xl p-8 text-center border border-gray-100 hover:border-lime-200 transition-colors">
            <h4 className="text-4xl font-black text-gray-900 mb-2">4,200+</h4>
            <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">
              Active Vendors
            </p>
          </div>
          <div className="bg-gray-50 rounded-3xl p-8 text-center border border-gray-100 hover:border-lime-200 transition-colors">
            <h4 className="text-4xl font-black text-gray-900 mb-2">12k+</h4>
            <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">
              Sales This Month
            </p>
          </div>
          <div className="bg-gray-50 rounded-3xl p-8 text-center border border-gray-100 hover:border-lime-200 transition-colors">
            <h4 className="text-4xl font-black text-gray-900 mb-2">₦280M</h4>
            <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">
              Vendor Revenue
            </p>
          </div>
          <div className="bg-gray-50 rounded-3xl p-8 text-center border border-gray-100 hover:border-lime-200 transition-colors">
            <h4 className="text-4xl font-black text-gray-900 mb-2">4.9/5</h4>
            <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">
              Success Rate
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              name: "Ibrahim K.",
              role: "Tech Vendor",
              text: "Since upgrading to the Professional bundle, my phone hasn't stopped ringing. The SEO indexing actually works!",
              img: "1",
            },
            {
              name: "Blessing O.",
              role: "Fashion Store",
              text: "The WhatsApp bot integration is a game changer. I handle 5x more orders with half the effort.",
              img: "2",
            },
            {
              name: "Chidi E.",
              role: "Auto Dealer",
              text: "ListUp is the only platform that gives me real value for money. My listings get seen by the right people.",
              img: "3",
            },
          ].map((t, i) => (
            <div
              key={i}
              className="bg-white p-8 rounded-3xl border-2 border-gray-50 shadow-sm relative"
            >
              <div className="flex gap-1 mb-4">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Sparkles
                    key={s}
                    size={14}
                    className="text-yellow-400 fill-current"
                  />
                ))}
              </div>
              <p className="text-gray-600 font-medium mb-6 italic">
                "{t.text}"
              </p>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-lime-100 overflow-hidden">
                  <img
                    src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${t.img + 20}`}
                    alt={t.name}
                  />
                </div>
                <div>
                  <h5 className="font-black text-gray-900">{t.name}</h5>
                  <p className="text-xs font-bold text-lime-600">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Benefit Breakdowns */}
      <div className="max-w-4xl mx-auto mb-24">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="space-y-4">
            <h3 className="text-2xl font-bold text-gray-900">Why upgrade?</h3>
            <p className="text-gray-600 leading-relaxed">
              ListUp is the fastest growing marketplace in Nigeria. Vendors who
              upgrade their listing capacity see up to{" "}
              <span className="text-lime-600 font-bold">
                4.5x more inquiries
              </span>{" "}
              on their products compared to free users.
            </p>
          </div>
          <div className="space-y-4">
            <h3 className="text-2xl font-bold text-gray-900">
              Premium Support
            </h3>
            <p className="text-gray-600 leading-relaxed">
              Paid packages include priority support from our seller success
              team. We help you optimize your listings for maximum conversion at
              no extra cost.
            </p>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="max-w-3xl mx-auto">
        <h2 className="text-3xl font-black text-center text-gray-900 mb-12">
          Frequently Asked Questions
        </h2>
        <div className="space-y-8">
          {[
            {
              q: "Is there a discount for first-time buyers?",
              a: "Yes! First-time buyers automatically receive a limited-time 20% discount on their first bundle purchase.",
            },
            {
              q: "Can I upgrade my package later?",
              a: "Yes. You can purchase additional bundles at any time. New slots are simply added to your current balance.",
            },
            {
              q: "What happens if a buyer reports me?",
              a: "We maintain high standards. If a listing is removed due to policy violations, the slot is not refunded.",
            },
          ].map((faq, i) => (
            <div key={i} className="border-b border-gray-100 pb-6">
              <h4 className="text-lg font-bold text-gray-900 mb-2">
                Q: {faq.q}
              </h4>
              <p className="text-gray-600 leading-relaxed font-medium">
                {faq.a}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Trusted Footer */}
      <div className="mt-24 text-center border-t border-gray-100 pt-12">
        <p className="text-lg font-bold text-gray-400 mb-6">
          Secured by industry leading partners
        </p>
        <div className="flex justify-center items-center gap-10 flex-wrap opacity-40 hover:opacity-80 transition-opacity">
          <img
            src="https://paystack.com/assets/img/verve.png"
            alt="Verve"
            className="h-6"
          />
          <img
            src="https://paystack.com/assets/img/visa.png"
            alt="Visa"
            className="h-6"
          />
          <img
            src="https://paystack.com/assets/img/mastercard.png"
            alt="Mastercard"
            className="h-6"
          />
        </div>
      </div>
    </div>
  );
}
