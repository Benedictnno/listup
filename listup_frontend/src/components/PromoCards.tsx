import React from 'react';
import { Store, MessageCircle, ShieldCheck, Zap, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function PromoCards() {
    const promos = [
        {
            title: "Start Selling",
            desc: "Turn your items into cash today",
            icon: Store,
            color: "from-lime-400 to-lime-500",
            href: "/sell",
            buttonText: "List Item"
        },
        {
            title: "WhatsApp",
            desc: "Join our community for deals",
            icon: MessageCircle,
            color: "from-green-500 to-emerald-600",
            href: "https://wa.me/2348123456789", // Placeholder, replace with actual bot number
            buttonText: "Join Now",
            external: true
        },
        {
            title: "Verified Vendors",
            desc: "Shop with confidence from trusted sellers",
            icon: ShieldCheck,
            color: "from-blue-500 to-indigo-600",
            href: "/verified-vendors",
            buttonText: "Browse"
        },
        {
            title: "Sell Fast!",
            desc: "Boost your listings for more reach",
            icon: Zap,
            color: "from-orange-400 to-red-500",
            href: "/promote",
            buttonText: "Promote"
        }
    ];

    return (
        <section className="py-12 bg-white">
            <div className="mx-auto max-w-7xl px-4 md:px-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {promos.map((promo, idx) => (
                        <div
                            key={idx}
                            className="relative overflow-hidden rounded-2xl bg-white border border-slate-200 p-6 hover:shadow-xl transition-all group"
                        >
                            <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${promo.color} opacity-10 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110`} />

                            <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${promo.color} text-white mb-4 shadow-lg shadow-lime-500/20`}>
                                <promo.icon className="w-6 h-6" />
                            </div>

                            <h3 className="text-xl font-bold text-slate-900 mb-1 font-montserrat tracking-tight">{promo.title}</h3>
                            <p className="text-slate-500 text-sm mb-6 font-montserrat">{promo.desc}</p>

                            {promo.external ? (
                                <a
                                    href={promo.href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 text-sm font-bold text-slate-900 hover:gap-3 transition-all font-montserrat"
                                >
                                    {promo.buttonText} <ArrowRight className="w-4 h-4 text-lime-500" />
                                </a>
                            ) : (
                                <Link
                                    href={promo.href}
                                    className="inline-flex items-center gap-2 text-sm font-bold text-slate-900 hover:gap-3 transition-all font-montserrat"
                                >
                                    {promo.buttonText} <ArrowRight className="w-4 h-4 text-lime-500" />
                                </Link>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
