"use client";

import { useEffect, useState } from "react";
import { fetchFeatureFlags, updateFeatureFlag, FeatureFlag } from "@/services/featureService";
import Button from "@/components/ui/button";
import { Loader2, Plus, Save } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "react-hot-toast";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";

function Toggle({ checked, onCheckedChange, disabled }: { checked: boolean, onCheckedChange: () => void, disabled?: boolean }) {
    return (
        <button
            type="button"
            role="switch"
            aria-checked={checked}
            disabled={disabled}
            onClick={onCheckedChange}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${checked ? 'bg-lime-600' : 'bg-gray-200'
                }`}
        >
            <span
                className={`pointer-events-none block h-5 w-5 rounded-full bg-white shadow-lg ring-0 transition-transform ${checked ? 'translate-x-5' : 'translate-x-0'
                    }`}
            />
        </button>
    );
}

export default function FeatureFlagsPage() {
    const [flags, setFlags] = useState<FeatureFlag[]>([]);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState<string | null>(null); // Key being updated

    // New flag state
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [newKey, setNewKey] = useState("");
    const [newDescription, setNewDescription] = useState("");
    const [isCreating, setIsCreating] = useState(false);

    useEffect(() => {
        loadFlags();
    }, []);

    const loadFlags = async () => {
        try {
            const data = await fetchFeatureFlags();
            setFlags(data);
        } catch (error) {
            console.error("Failed to load flags", error);
            toast.error("Failed to load feature flags");
        } finally {
            setLoading(false);
        }
    };

    const handleToggle = async (flag: FeatureFlag) => {
        setUpdating(flag.key);
        try {
            const updated = await updateFeatureFlag({
                key: flag.key,
                isEnabled: !flag.isEnabled,
                description: flag.description || undefined
            });

            setFlags(prev => prev.map(f => f.key === updated.key ? updated : f));
            toast.success(`${flag.key} is now ${updated.isEnabled ? 'Enabled' : 'Disabled'}`);
        } catch (error) {
            toast.error("Failed to update flag");
        } finally {
            setUpdating(null);
        }
    };

    const handleCreate = async () => {
        if (!newKey.trim()) return;

        setIsCreating(true);
        try {
            const created = await updateFeatureFlag({
                key: newKey.trim(),
                isEnabled: false,
                description: newDescription
            });

            setFlags(prev => [...prev, created]);
            toast.success("Feature flag created");
            setIsDialogOpen(false);
            setNewKey("");
            setNewDescription("");
        } catch (error) {
            toast.error("Failed to create flag");
        } finally {
            setIsCreating(false);
        }
    };

    if (loading) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Feature Flags</h1>
                    <p className="text-gray-500">Manage global system features.</p>
                </div>

                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            Add Flag
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Add Feature Flag</DialogTitle>
                            <DialogDescription>
                                Create a new feature flag to control system behavior.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="key">Key (e.g., kyc_system)</Label>
                                <Input
                                    id="key"
                                    value={newKey}
                                    onChange={(e) => setNewKey(e.target.value)}
                                    placeholder="my_new_feature"
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="description">Description (Optional)</Label>
                                <Input
                                    id="description"
                                    value={newDescription}
                                    onChange={(e) => setNewDescription(e.target.value)}
                                    placeholder="Controls the visibility of..."
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                            <Button onClick={handleCreate} disabled={isCreating || !newKey}>
                                {isCreating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                                Create Flag
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="grid gap-4">
                {flags.length === 0 ? (
                    <div className="text-center py-10 bg-gray-50 rounded-lg border border-dashed">
                        <p className="text-gray-500">No feature flags found. Create one to get started.</p>
                    </div>
                ) : (
                    flags.map((flag) => (
                        <Card key={flag.id}>
                            <CardContent className="flex items-center justify-between p-6">
                                <div className="space-y-1">
                                    <h3 className="font-medium leading-none">{flag.key}</h3>
                                    <p className="text-sm text-gray-500">
                                        {flag.description || "No description provided"}
                                    </p>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${flag.isEnabled ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                                        {flag.isEnabled ? 'Active' : 'Disabled'}
                                    </div>
                                    <Toggle
                                        checked={flag.isEnabled}
                                        onCheckedChange={() => handleToggle(flag)}
                                        disabled={updating === flag.key}
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
}
