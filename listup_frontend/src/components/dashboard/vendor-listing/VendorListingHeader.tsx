import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface VendorListingHeaderProps {
    searchInput: string;
    setSearchInput: (value: string) => void;
    showFilters: boolean;
    setShowFilters: (value: boolean) => void;
    hasActiveSearch: boolean;
    clearSearch: () => void;
}

export function VendorListingHeader({
    searchInput,
    setSearchInput,
    showFilters,
    setShowFilters,
    hasActiveSearch,
    clearSearch,
}: VendorListingHeaderProps) {
    return (
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
                <h2 className="text-2xl font-semibold">My Listings</h2>
                <p className="text-gray-600">Manage your product listings and inventory</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto sm:items-center">
                <div className="w-full sm:w-64">
                    <Input
                        placeholder="Search listings..."
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                    />
                </div>
                <Button onClick={() => setShowFilters(!showFilters)} variant="outline">
                    Filters
                </Button>
                <Button variant="outline" onClick={clearSearch} disabled={!hasActiveSearch && !searchInput}>
                    Clear search
                </Button>
            </div>
        </div>
    );
}
