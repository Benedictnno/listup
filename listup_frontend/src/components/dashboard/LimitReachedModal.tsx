"use client";

import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CreditCard, PackageX } from "lucide-react";
import { useRouter } from "next/navigation";

interface LimitReachedModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function LimitReachedModal({ isOpen, onClose }: LimitReachedModalProps) {
    const router = useRouter();

    const handleRedirect = () => {
        router.push("/dashboard/buy-listings");
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md bg-white">
                <DialogHeader className="flex flex-col items-center gap-4 text-center">
                    <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center">
                        <PackageX className="w-10 h-10 text-red-600" />
                    </div>
                    <DialogTitle className="text-2xl font-bold text-gray-900">Listing Limit Reached</DialogTitle>
                    <DialogDescription className="text-gray-600">
                        You have reached your current listing limit. To continue growing your store and reaching more customers, you need to top up your slots.
                    </DialogDescription>
                </DialogHeader>

                <div className="bg-gray-50 border border-gray-100 rounded-xl p-6 my-2">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-2 h-2 rounded-full bg-lime-500" />
                        <p className="text-sm font-medium text-gray-700">Immediate slot activation</p>
                    </div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-2 h-2 rounded-full bg-lime-500" />
                        <p className="text-sm font-medium text-gray-700">One-time affordable bundles</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-lime-500" />
                        <p className="text-sm font-medium text-gray-700">Boosted search visibility</p>
                    </div>
                </div>

                <DialogFooter className="flex flex-col sm:flex-row gap-3 mt-4">
                    <Button 
                        variant="outline" 
                        onClick={onClose}
                        className="w-full sm:flex-1 border-gray-200"
                    >
                        Not Now
                    </Button>
                    <Button 
                        onClick={handleRedirect}
                        className="w-full sm:flex-1 bg-lime-500 hover:bg-lime-600 text-white font-bold"
                    >
                        <CreditCard className="mr-2 h-4 w-4" />
                        Get More Slots
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
