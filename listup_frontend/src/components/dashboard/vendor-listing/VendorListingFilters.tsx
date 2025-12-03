import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SortAsc, SortDesc } from "lucide-react";
import { Category } from "@/lib/api/categories";

export interface FilterState {
    search: string;
    status: string;
    category: string;
    priceRange: { min: number; max: number };
    stockLevel: string;
    sortBy: string;
    sortOrder: 'asc' | 'desc';
}

interface VendorListingFiltersProps {
    showFilters: boolean;
    filters: FilterState;
    setFilters: (filters: FilterState) => void;
    draftFilters: FilterState;
    setDraftFilters: (filters: FilterState | ((prev: FilterState) => FilterState)) => void;
    searchInput: string;
    setSearchInput: (value: string) => void;
    categories: Category[];
    applyFilters: () => void;
    resetFilters: () => void;
    defaultFilters: FilterState;
}

export function VendorListingFilters({
    showFilters,
    filters,
    setFilters,
    draftFilters,
    setDraftFilters,
    searchInput,
    setSearchInput,
    categories,
    applyFilters,
    resetFilters,
    defaultFilters,
}: VendorListingFiltersProps) {

    const hasActiveFilters = () => {
        return (
            !!filters.search ||
            !!filters.status ||
            !!filters.category ||
            filters.priceRange.min !== defaultFilters.priceRange.min ||
            filters.priceRange.max !== defaultFilters.priceRange.max ||
            !!filters.stockLevel ||
            filters.sortBy !== defaultFilters.sortBy ||
            filters.sortOrder !== defaultFilters.sortOrder
        );
    };

    return (
        <div className="space-y-4">
            {showFilters && (
                <Card>
                    <CardContent className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">Search</label>
                                <Input
                                    placeholder="Search listings..."
                                    value={searchInput}
                                    onChange={(e) => setSearchInput(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Status</label>
                                <Select value={draftFilters.status} onValueChange={(value) => setDraftFilters(prev => ({ ...prev, status: value === 'all' ? '' : value }))}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="All Statuses" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Statuses</SelectItem>
                                        <SelectItem value="active">Active</SelectItem>
                                        <SelectItem value="inactive">Inactive</SelectItem>
                                        <SelectItem value="pending">Pending</SelectItem>
                                        <SelectItem value="sold">Sold</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Category</label>
                                <Select value={draftFilters.category} onValueChange={(value) => setDraftFilters(prev => ({ ...prev, category: value === 'all' ? '' : value }))}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="All Categories" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Categories</SelectItem>
                                        {categories.map((cat) => (
                                            <SelectItem key={cat.id} value={cat.name}>
                                                {cat.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Stock Level</label>
                                <Select value={draftFilters.stockLevel} onValueChange={(value) => setDraftFilters(prev => ({ ...prev, stockLevel: value === 'all' ? '' : value }))}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="All Stock Levels" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Stock Levels</SelectItem>
                                        <SelectItem value="low">Low Stock (≤5)</SelectItem>
                                        <SelectItem value="out">Out of Stock</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">Min Price (₦)</label>
                                <Input
                                    type="number"
                                    placeholder="0"
                                    value={draftFilters.priceRange.min}
                                    onChange={(e) => setDraftFilters(prev => ({
                                        ...prev,
                                        priceRange: { ...prev.priceRange, min: Number(e.target.value) }
                                    }))}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Max Price (₦)</label>
                                <Input
                                    type="number"
                                    placeholder="1000000"
                                    value={draftFilters.priceRange.max}
                                    onChange={(e) => setDraftFilters(prev => ({
                                        ...prev,
                                        priceRange: { ...prev.priceRange, max: Number(e.target.value) }
                                    }))}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Sort By</label>
                                <Select value={draftFilters.sortBy} onValueChange={(value) => setDraftFilters(prev => ({ ...prev, sortBy: value }))}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="createdAt">Date Created</SelectItem>
                                        <SelectItem value="title">Title</SelectItem>
                                        <SelectItem value="price">Price</SelectItem>
                                        <SelectItem value="views">Views</SelectItem>
                                        <SelectItem value="sales">Sales</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="flex justify-between items-center mt-4">
                            <Button
                                variant="outline"
                                onClick={resetFilters}
                            >
                                Clear All Filters
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => setDraftFilters(prev => ({
                                    ...prev,
                                    sortOrder: prev.sortOrder === 'asc' ? 'desc' : 'asc'
                                }))}
                            >
                                {draftFilters.sortOrder === 'asc' ? <SortAsc size={16} /> : <SortDesc size={16} />}
                                {draftFilters.sortOrder === 'asc' ? 'Ascending' : 'Descending'}
                            </Button>
                            <Button onClick={applyFilters}>
                                Apply Filters
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Active filter chips */}
            {hasActiveFilters() && (
                <div className="flex flex-wrap gap-2 text-sm">
                    {filters.search && (
                        <button
                            className="px-2 py-1 bg-gray-100 rounded-full flex items-center gap-1"
                            onClick={() => {
                                const updated = { ...filters, search: '' };
                                setFilters(updated);
                                setDraftFilters(updated);
                                setSearchInput('');
                            }}
                        >
                            <span>Search: "{filters.search}"</span>
                            <span className="text-gray-500">×</span>
                        </button>
                    )}
                    {filters.status && (
                        <button
                            className="px-2 py-1 bg-gray-100 rounded-full flex items-center gap-1"
                            onClick={() => {
                                const updated = { ...filters, status: '' };
                                setFilters(updated);
                                setDraftFilters(updated);
                            }}
                        >
                            <span>Status: {filters.status}</span>
                            <span className="text-gray-500">×</span>
                        </button>
                    )}
                    {filters.category && (
                        <button
                            className="px-2 py-1 bg-gray-100 rounded-full flex items-center gap-1"
                            onClick={() => {
                                const updated = { ...filters, category: '' };
                                setFilters(updated);
                                setDraftFilters(updated);
                            }}
                        >
                            <span>Category: {filters.category}</span>
                            <span className="text-gray-500">×</span>
                        </button>
                    )}
                    {(filters.priceRange.min !== defaultFilters.priceRange.min || filters.priceRange.max !== defaultFilters.priceRange.max) && (
                        <button
                            className="px-2 py-1 bg-gray-100 rounded-full flex items-center gap-1"
                            onClick={() => {
                                const updated = { ...filters, priceRange: defaultFilters.priceRange };
                                setFilters(updated);
                                setDraftFilters(updated);
                            }}
                        >
                            <span>Price: ₦{filters.priceRange.min} - ₦{filters.priceRange.max}</span>
                            <span className="text-gray-500">×</span>
                        </button>
                    )}
                    {filters.stockLevel && (
                        <button
                            className="px-2 py-1 bg-gray-100 rounded-full flex items-center gap-1"
                            onClick={() => {
                                const updated = { ...filters, stockLevel: '' };
                                setFilters(updated);
                                setDraftFilters(updated);
                            }}
                        >
                            <span>Stock: {filters.stockLevel}</span>
                            <span className="text-gray-500">×</span>
                        </button>
                    )}
                    {(filters.sortBy !== defaultFilters.sortBy || filters.sortOrder !== defaultFilters.sortOrder) && (
                        <button
                            className="px-2 py-1 bg-gray-100 rounded-full flex items-center gap-1"
                            onClick={() => {
                                setFilters(defaultFilters);
                                setDraftFilters(defaultFilters);
                                setSearchInput('');
                            }}
                        >
                            <span>Sorting</span>
                            <span className="text-gray-500">×</span>
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}
