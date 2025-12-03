import { Card, CardContent } from "@/components/ui/card";
import { Package } from "lucide-react";

interface VendorListingEmptyStateProps {
    hasFilters: boolean;
}

export function VendorListingEmptyState({ hasFilters }: VendorListingEmptyStateProps) {
    return (
        <Card>
            <CardContent className="p-12 text-center">
                <div className="text-gray-400 mb-4">
                    <Package size={48} className="mx-auto" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No listings found</h3>
                <p className="text-gray-500 mb-4">
                    {hasFilters
                        ? 'Try adjusting your filters or search terms'
                        : 'Get started by creating your first listing'
                    }
                </p>
            </CardContent>
        </Card>
    );
}
