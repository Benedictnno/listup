import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckSquare, Edit, Eye, Square, Trash2, TrendingUp, BarChart3 } from "lucide-react";
import Image from "next/image";

export interface Listing {
    id: string;
    title: string;
    price: number;
    stock: number;
    description: string;
    images?: string[];
    status: 'active' | 'inactive' | 'pending' | 'sold';
    category: string;
    views: number;
    sales: number;
    revenue: number;
    createdAt: string;
    seoScore?: number;
    location?: string;
    condition?: string;
}

interface VendorListingGridProps {
    listings: Listing[];
    selectedListings: string[];
    toggleListingSelection: (id: string) => void;
    openEdit: (listing: Listing) => void;
    handleDelete: (id: string) => void;
    metricsByListing: Record<string, { views: number; saves: number; messages: number }>;
}

export function VendorListingGrid({
    listings,
    selectedListings,
    toggleListingSelection,
    openEdit,
    handleDelete,
    metricsByListing,
}: VendorListingGridProps) {

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active': return 'bg-green-100 text-green-800';
            case 'inactive': return 'bg-gray-100 text-gray-800';
            case 'pending': return 'bg-yellow-100 text-yellow-800';
            case 'sold': return 'bg-blue-100 text-blue-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getStockColor = (stock: number) => {
        if (stock === 0) return 'text-red-600';
        if (stock <= 5) return 'text-orange-600';
        return 'text-green-600';
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {listings.map((listing) => {
                const metrics = metricsByListing[listing.id] || { views: 0, saves: 0, messages: 0 };
                return (
                    <Card key={listing.id} className="hover:shadow-lg transition-shadow">
                        <CardContent className="p-4 space-y-3">
                            {/* Selection Checkbox */}
                            <div className="flex justify-between items-start">
                                <button
                                    onClick={() => toggleListingSelection(listing.id)}
                                    className="mt-1"
                                >
                                    {selectedListings.includes(listing.id) ? (
                                        <CheckSquare size={18} className="text-lime-600" />
                                    ) : (
                                        <Square size={18} className="text-gray-400" />
                                    )}
                                </button>
                                <div className="flex gap-1">
                                    <Button variant="ghost" size="sm" onClick={() => openEdit(listing)}>
                                        <Edit size={16} />
                                    </Button>
                                    <Button variant="ghost" size="sm" onClick={() => handleDelete(listing.id)}>
                                        <Trash2 size={16} />
                                    </Button>
                                </div>
                            </div>

                            {/* Product Image */}
                            <div className="relative w-full h-40">
                                <Image
                                    src={listing.images?.[0] || "/placeholder.svg"}
                                    alt={listing.title}
                                    fill
                                    className="object-cover rounded-lg"
                                />
                            </div>

                            {/* Product Info */}
                            <div>
                                <h3 className="text-lg font-semibold line-clamp-2">{listing.title}</h3>
                                <p className="text-sm text-gray-500 line-clamp-2">{listing.description}</p>

                                {/* Status and Category */}
                                <div className="flex items-center gap-2 mt-2">
                                    <p className={`text-sm font-medium ${getStockColor(listing.stock)}`}>
                                        {/* Stock: {listing.stock} */}
                                    </p>
                                    <span className="px-2 py-1 bg-gray-100 rounded-full text-xs text-gray-600">
                                        {/* {listing.category} */}
                                    </span>
                                </div>

                                {/* Price and Stock */}
                                <div className="flex justify-between items-center mt-3">
                                    <p className="text-lg font-bold text-lime-600">₦{listing.price.toLocaleString()}</p>
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(listing.status)}`}>
                                        {listing.status.charAt(0).toUpperCase() + listing.status.slice(1)}
                                    </span>
                                </div>

                                {/* Performance Metrics */}
                                <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t">
                                    <div className="text-center">
                                        <div className="flex items-center justify-center gap-1 text-blue-600">
                                            <Eye size={14} />
                                            <span className="text-xs font-medium">{metrics.views}</span>
                                        </div>
                                        <span className="text-xs text-gray-500">Views</span>
                                    </div>
                                    <div className="text-center">
                                        <div className="flex items-center justify-center gap-1 text-green-600">
                                            <TrendingUp size={14} />
                                            <span className="text-xs font-medium">{metrics.saves}</span>
                                        </div>
                                        <span className="text-xs text-gray-500">Saves</span>
                                    </div>
                                    <div className="text-center">
                                        <div className="flex items-center justify-center gap-1 text-purple-600">
                                            <BarChart3 size={14} />
                                            <span className="text-xs font-medium">{metrics.messages}</span>
                                        </div>
                                        <span className="text-xs text-gray-500">Messages</span>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                );
            })}
        </div>
    );
}
