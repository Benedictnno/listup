"use client";

import Link from "next/link";
import React from "react";
import { ArrowRight, ShoppingBag, MessageCircle } from "lucide-react";

export default function PromoCards() {
    return (
        <div className="hidden lg:flex flex-col gap-4 w-64 h-full shrink-0">
            {/* Start Selling Card */}
            <Link
                href="/signup?redirect=dashboard"
                className="flex-1 bg-white border border-slate-200 rounded-2xl p-6 flex flex-col justify-between group hover:shadow-xl transition-all duration-300"
            >
                <div>
                    <div className="w-10 h-10 rounded-full bg-lime-100 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <ShoppingBag className="w-5 h-5 text-lime-600" />
                    </div>
                    <h3 className="text-slate-900 font-bold text-xl font-montserrat leading-tight mb-2">
                        Start Selling <br /> on ListUp Today
                    </h3>
                    <p className="text-slate-500 text-sm font-montserrat leading-relaxed">
                        Reach thousands of buyers in your community instantly.
                    </p>
                </div>
                <div className="mt-4 flex items-center gap-2 text-lime-600 font-bold text-sm font-montserrat">
                    <span>Get Started</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
            </Link>

            {/* Join WhatsApp Card */}
            <a
                href="https://wa.me/2348012345678" // Placeholder WhatsApp number
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 bg-lime-400 rounded-2xl p-6 flex flex-col justify-between group hover:shadow-xl transition-all duration-300"
            >
                <div>
                    <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <MessageCircle className="w-5 h-5 text-slate-900" />
                    </div>
                    <h3 className="text-slate-900 font-bold text-xl font-montserrat leading-tight mb-2">
                        Join Our <br /> WhatsApp Community
                    </h3>
                    <p className="text-slate-800/70 text-sm font-montserrat leading-relaxed">
                        Get exclusive deals and market updates directly on your phone.
                    </p>
                </div>
                <div className="mt-4 flex items-center gap-2 text-slate-900 font-bold text-sm font-montserrat">
                    <span>Chat with us</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
            </a>
        </div>
    );
}
