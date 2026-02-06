"use client";
import React from 'react';
import Link from 'next/link';
import { ArrowRight, Tag, ShieldCheck } from 'lucide-react';

export default function PromoCards() {
    return (
        <div className="flex hidden h-full flex-col gap-4 lg:flex w-72">
            {/* Top Card - White/Light - Login/Signup Promo */}
            <div className="flex flex-1 flex-col justify-between rounded-2xl bg-white p-6 shadow-lg transition-transform hover:-translate-y-1">
                <div>
                    <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-900">
                        <ShieldCheck className="h-5 w-5" />
                    </div>
                    <h3 className="mb-2 text-xl font-bold text-slate-900">Verified Vendors</h3>
                    <p className="text-sm text-slate-500">Shop with confidence. All sellers are verified.</p>
                </div>
                <Link href="/signup" className="group mt-4 flex items-center gap-2 font-semibold text-[#0b101b]">
                    Join Now <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
            </div>

            {/* Bottom Card - Lime - Deals/Sell */}
            <div className="flex flex-1 flex-col justify-between rounded-2xl bg-lime-400 p-6 shadow-lg transition-transform hover:-translate-y-1">
                <div>
                    <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#0b101b]/10 text-[#0b101b]">
                        <Tag className="h-5 w-5" />
                    </div>
                    <h3 className="mb-2 text-xl font-bold text-[#0b101b]">Sell Fast!</h3>
                    <p className="text-sm font-medium text-[#0b101b]/80">Post your items and reach buyers globally.</p>
                </div>
                <Link href="/dashboard/create-list" className="mt-4 w-full rounded-xl bg-[#0b101b] py-3 text-center text-sm font-semibold text-white transition-colors hover:bg-slate-900">
                    Start Selling
                </Link>
            </div>
        </div>
    );
}
