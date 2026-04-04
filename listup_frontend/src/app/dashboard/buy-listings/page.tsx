"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { Check, CreditCard, Loader2, Package, Sparkles, Zap } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import api from "@/utils/axios";

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
                    Grow Your Store <br className="hidden md:block" /> with Listing Bundles
                </h1>
                <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
                    Choose the perfect package to reach more customers. Each bundle provides instant access to premium marketplace features.
                </p>
            </div>

            {/* Pricing Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10 max-w-6xl mx-auto mb-20">
                {tiers.map((tier) => (
                    <Card key={tier.id} className={`relative group flex flex-col overflow-hidden border-2 transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 ${tier.name === 'Professional' ? 'border-lime-500 ring-4 ring-lime-50 shadow-xl z-10' : 'border-gray-100'}`}>
                        {tier.name === 'Professional' && (
                            <div className="bg-lime-500 text-white text-center py-2 text-xs font-black uppercase tracking-widest">
                                Most Popular Value
                            </div>
                        )}
                        <CardHeader className="text-center pt-10 pb-6">
                            <div className={`mb-6 inline-flex items-center justify-center w-16 h-16 rounded-2xl rotate-3 group-hover:rotate-0 transition-transform duration-300 ${tier.name === 'Professional' ? 'bg-lime-500 text-white' : 'bg-gray-100 text-gray-600'}`}>
                                {tier.slots <= 5 ? <Package size={32} /> : tier.slots <= 10 ? <Sparkles size={32} /> : <Zap size={32} />}
                            </div>
                            <CardTitle className="text-3xl font-black text-gray-900">{tier.name}</CardTitle>
                            <CardDescription className="text-gray-500 text-lg mt-2">{tier.description || 'Verified marketplace slots'}</CardDescription>
                        </CardHeader>

                        <CardContent className="grow px-8 pb-10">
                            <div className="text-center mb-8">
                                <span className="text-sm font-bold text-gray-400 align-top mr-1">₦</span>
                                <span className="text-6xl font-black text-gray-900 leading-none">{tier.price.toLocaleString()}</span>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 group-hover:bg-lime-50 transition-colors">
                                    <div className="w-6 h-6 rounded-full bg-lime-500 flex items-center justify-center shrink-0">
                                        <Check className="h-4 w-4 text-white" />
                                    </div>
                                    <span className="font-bold text-gray-900">{tier.slots} Premium Listing Slots</span>
                                </div>
                                {[
                                    "No expiration on slots",
                                    "SEO Optimized indexing",
                                    "Verified Vendor badge",
                                    "WhatsApp bot integration"
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
                                className={`w-full py-8 text-xl font-black rounded-2xl transition-all duration-300 shadow-lg ${tier.name === 'Professional' ? 'bg-lime-500 hover:bg-lime-600 text-white shadow-lime-200' : 'bg-gray-900 hover:bg-black text-white shadow-gray-200'}`}
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

            {/* Benefit Breakdowns */}
            <div className="max-w-4xl mx-auto mb-24">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    <div className="space-y-4">
                        <h3 className="text-2xl font-bold text-gray-900">Why upgrade?</h3>
                        <p className="text-gray-600 leading-relaxed">
                            ListUp is the fastest growing marketplace in Nigeria. Vendors who upgrade their listing capacity see up to <span className="text-lime-600 font-bold">4.5x more inquiries</span> on their products compared to free users.
                        </p>
                    </div>
                    <div className="space-y-4">
                        <h3 className="text-2xl font-bold text-gray-900">Premium Support</h3>
                        <p className="text-gray-600 leading-relaxed">
                            Paid packages include priority support from our seller success team. We help you optimize your listings for maximum conversion at no extra cost.
                        </p>
                    </div>
                </div>
            </div>

            {/* FAQ Section */}
            <div className="max-w-3xl mx-auto">
                <h2 className="text-3xl font-black text-center text-gray-900 mb-12">Frequently Asked Questions</h2>
                <div className="space-y-8">
                    {[
                        { q: "Do my listing slots expire?", a: "No. Your purchased listing slots never expire. You can use them today or six months from now." },
                        { q: "Can I upgrade my package later?", a: "Yes. You can purchase additional bundles at any time. New slots are simply added to your current balance." },
                        { q: "What happens if a buyer reports me?", a: "We maintain high standards. If a listing is removed due to policy violations, the slot is not refunded." }
                    ].map((faq, i) => (
                        <div key={i} className="border-b border-gray-100 pb-6">
                            <h4 className="text-lg font-bold text-gray-900 mb-2">Q: {faq.q}</h4>
                            <p className="text-gray-600 leading-relaxed font-medium">{faq.a}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Trusted Footer */}
            <div className="mt-24 text-center border-t border-gray-100 pt-12">
                <p className="text-lg font-bold text-gray-400 mb-6">Secured by industry leading partners</p>
                <div className="flex justify-center items-center gap-10 flex-wrap opacity-40 hover:opacity-80 transition-opacity">
                    <img src="https://paystack.com/assets/img/verve.png" alt="Verve" className="h-6" />
                    <img src="https://paystack.com/assets/img/visa.png" alt="Visa" className="h-6" />
                    <img src="https://paystack.com/assets/img/mastercard.png" alt="Mastercard" className="h-6" />
                </div>
            </div>
        </div>
    );
}
