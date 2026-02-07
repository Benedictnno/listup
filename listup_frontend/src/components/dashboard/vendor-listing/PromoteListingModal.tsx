import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Listing } from "@/types/listing";

interface PromoteListingModalProps {
    showPromoteModal: boolean;
    setShowPromoteModal: (show: boolean) => void;
    promoteListings: string[];
    listings: Listing[];
    promotePlan: string;
    setPromotePlan: (plan: string) => void;
    promotionPlans: { type: string; name: string; price: number; description: string }[];
    promoteDuration: number;
    setPromoteDuration: (duration: number) => void;
    calculatePromotionCost: () => number;
    createPromotionAds: () => void;
}

export function PromoteListingModal({
    showPromoteModal,
    setShowPromoteModal,
    promoteListings,
    listings,
    promotePlan,
    setPromotePlan,
    promotionPlans,
    promoteDuration,
    setPromoteDuration,
    calculatePromotionCost,
    createPromotionAds,
}: PromoteListingModalProps) {
    if (!showPromoteModal) return null;

    return (
        <Dialog open={showPromoteModal} onOpenChange={setShowPromoteModal}>
            <DialogContent className="max-w-2xl bg-white">
                <DialogHeader>
                    <DialogTitle>Promote Selected Products</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                    <div>
                        <p className="text-sm text-gray-600 mb-3">
                            Promoting {promoteListings.length} selected product{promoteListings.length > 1 ? 's' : ''}
                        </p>

                        <div className="max-h-32 overflow-y-auto border rounded-lg p-3 bg-gray-50">
                            {promoteListings.map(listingId => {
                                const listing = listings.find(l => l.id === listingId);
                                return listing ? (
                                    <div key={listingId} className="flex items-center gap-2 py-1">
                                        <span className="text-sm font-medium">{listing.title}</span>
                                        <span className="text-sm text-gray-500">₦{listing.price.toLocaleString()}</span>
                                    </div>
                                ) : null;
                            })}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">Promotion Plan</label>
                        <Select value={promotePlan} onValueChange={setPromotePlan}>
                            <SelectTrigger>
                                <SelectValue placeholder="Choose a promotion plan" />
                            </SelectTrigger>
                            <SelectContent className="bg-white">
                                {promotionPlans.map((plan) => (
                                    <SelectItem key={plan.type} value={plan.type}>
                                        <div>
                                            <div className="font-medium">{plan.name}</div>
                                            <div className="text-sm text-gray-500">₦{plan.price}/day - {plan.description}</div>
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">Duration (days)</label>
                        <Input
                            type="number"
                            placeholder="Duration in days"
                            value={promoteDuration}
                            onChange={(e) => setPromoteDuration(Number(e.target.value))}
                            min="1"
                            max="365"
                        />
                    </div>

                    {promotePlan && promoteDuration > 0 && (
                        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                            <h4 className="font-medium text-blue-900 mb-2">Cost Breakdown</h4>
                            <div className="space-y-1 text-sm text-blue-800">
                                <p>Price per day: ₦{promotionPlans.find(p => p.type === promotePlan)?.price}</p>
                                <p>Duration: {promoteDuration} days</p>
                                <p>Products: {promoteListings.length}</p>
                                <p className="text-lg font-semibold border-t pt-2">
                                    Total Cost: ₦{calculatePromotionCost().toLocaleString()}
                                </p>
                            </div>
                        </div>
                    )}

                    <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setShowPromoteModal(false)}>
                            Cancel
                        </Button>
                        <Button
                            onClick={createPromotionAds}
                            disabled={!promotePlan || promoteDuration <= 0}
                            className="bg-blue-600 hover:bg-blue-700"
                        >
                            Create Promotion Ads
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
