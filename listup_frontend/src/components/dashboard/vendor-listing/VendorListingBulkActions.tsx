import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useFeatureFlag } from "@/context/FeatureFlagContext";
import { CheckSquare, Trash2, TrendingUp } from "lucide-react";

interface VendorListingBulkActionsProps {
    selectedCount: number;
    bulkLoading: boolean;
    bulkLabel: string | null;
    selectAllVisible: () => void;
    clearSelection: () => void;
    handleBulkStatusUpdate: (status: 'active' | 'inactive' | 'pending' | 'sold') => void;
    handlePromoteProducts: () => void;
    handleBulkDelete: () => void;
}

export function VendorListingBulkActions({
    selectedCount,
    bulkLoading,
    bulkLabel,
    selectAllVisible,
    clearSelection,
    handleBulkStatusUpdate,
    handlePromoteProducts,
    handleBulkDelete,
}: VendorListingBulkActionsProps) {
    const { isEnabled } = useFeatureFlag();
    if (selectedCount === 0) return null;

    return (
        <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="flex items-center gap-2">
                        <CheckSquare size={20} className="text-blue-600" />
                        <span className="font-medium text-blue-900">
                            {selectedCount} listing(s) selected
                        </span>
                        {bulkLoading && bulkLabel && (
                            <span className="text-sm text-blue-700">{bulkLabel}</span>
                        )}
                    </div>
                    <div className="flex gap-2 flex-wrap">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={selectAllVisible}
                            disabled={bulkLoading}
                        >
                            Select all on page
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={clearSelection}
                            disabled={bulkLoading}
                        >
                            Clear selection
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleBulkStatusUpdate('active')}
                            disabled={bulkLoading}
                        >
                            Activate All
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleBulkStatusUpdate('inactive')}
                            disabled={bulkLoading}
                        >
                            Deactivate All
                        </Button>
                        {isEnabled('Paid_Listing_Promotion') && <Button
                            variant="default"
                            size="sm"
                            onClick={handlePromoteProducts}
                            disabled={bulkLoading}
                            className="bg-blue-600 hover:bg-blue-700"
                        >
                            <TrendingUp size={16} className="mr-2" />
                            Promote Selected
                        </Button>}
                        <Button
                            variant="destructive"
                            size="sm"
                            onClick={handleBulkDelete}
                            disabled={bulkLoading}
                            className="bg-red-600 hover:bg-red-700"

                        >
                            <Trash2 size={16} className="mr-2" />
                            Delete All
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
