import { Card, CardContent } from "@/components/ui/card";
import { Package, CreditCard } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface VendorListingEmptyStateProps {
    hasFilters: boolean;
    isLimitReached?: boolean;
}

export function VendorListingEmptyState({ hasFilters, isLimitReached }: VendorListingEmptyStateProps) {
    return (
        <Card>
            <CardContent className="p-12 text-center">
                <div className="text-gray-400 mb-4">
                    <Package size={48} className="mx-auto" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {isLimitReached ? 'Limit Reached' : 'No listings found'}
                </h3>
                <p className="text-gray-500 mb-6">
                    {isLimitReached 
                        ? 'You have reached your current listing limit. Top up your slots to keep growing your store.'
                        : (hasFilters ? 'Try adjusting your filters or search terms' : 'Get started by creating your first listing')
                    }
                </p>
                {isLimitReached && (
                    <Link href="/dashboard/buy-listings">
                        <Button className="bg-lime-500 hover:bg-lime-600 text-white font-bold py-6 px-10 rounded-xl shadow-lg shadow-lime-100 transition-all hover:scale-105">
                            <CreditCard className="mr-2 h-5 w-5" />
                            Buy Top-Up Slots
                        </Button>
                    </Link>
                )}
            </CardContent>
        </Card>
    );
}
