import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Image from "next/image";
import { Listing } from "./VendorListingGrid";
import { Category } from "@/lib/api/categories";

interface EditListingModalProps {
    editing: Listing | null;
    setEditing: (listing: Listing | null) => void;
    categories: Category[];
    imagePreviews: string[];
    removeImageAt: (index: number) => void;
    moveImage: (from: number, to: number) => void;
    handleImageInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    formError: string | null;
    handleSave: () => void;
    saving: boolean;
}

export function EditListingModal({
    editing,
    setEditing,
    categories,
    imagePreviews,
    removeImageAt,
    moveImage,
    handleImageInputChange,
    formError,
    handleSave,
    saving,
}: EditListingModalProps) {
    if (!editing) return null;

    return (
        <Dialog open={!!editing} onOpenChange={() => setEditing(null)}>
            <DialogContent className="max-w-2xl bg-white overflow-y-auto h-[calc(100vh-5rem)]">
                <DialogHeader>
                    <DialogTitle>Edit Listing</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-2">Title</label>
                        <Input
                            value={editing.title}
                            onChange={(e) => setEditing({ ...editing, title: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-2">Description</label>
                        <textarea
                            value={editing.description}
                            onChange={(e) => setEditing({ ...editing, description: e.target.value })}
                            className="w-full border rounded-lg px-3 py-2"
                            rows={4}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-2">Price (₦)</label>
                            <Input
                                type="number"
                                value={editing.price}
                                onChange={(e) => setEditing({ ...editing, price: Number(e.target.value) })}
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 ">
                        <div className="bg-white">
                            <label className="block text-sm font-medium mb-2">Condition</label>
                            <Input
                                value={editing.condition || ""}
                                onChange={(e) => setEditing({ ...editing, condition: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">Location</label>
                            <Input
                                value={editing.location || ""}
                                onChange={(e) => setEditing({ ...editing, location: e.target.value })}
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 ">
                        <div>
                            <label className="block text-sm font-medium mb-2">Status</label>
                            <Select value={editing.status} onValueChange={(value) => setEditing({ ...editing, status: value as 'active' | 'inactive' | 'pending' | 'sold' })}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-white">
                                    <SelectItem value="active">Active</SelectItem>
                                    <SelectItem value="inactive">Inactive</SelectItem>
                                    <SelectItem value="pending">Pending</SelectItem>
                                    <SelectItem value="sold">Sold</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div >
                            <label className="block text-sm font-medium mb-2 ">Category</label>
                            <Select value={editing.category} onValueChange={(value) => setEditing({ ...editing, category: value })}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-white">
                                    {categories.map((cat) => (
                                        <SelectItem key={cat.id} value={cat.name}>
                                            {cat.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-2">Images</label>
                        <div className="space-y-3">
                            <div className="flex flex-wrap gap-3">
                                {imagePreviews.map((src, index) => (
                                    <div key={index} className="relative w-24 h-24">
                                        <Image
                                            src={src}
                                            alt={editing.title}
                                            fill
                                            className="object-cover rounded-md border"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => removeImageAt(index)}
                                            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs"
                                        >
                                            ×
                                        </button>
                                        <div className="absolute bottom-1 left-1 flex gap-1">
                                            {index > 0 && (
                                                <button
                                                    type="button"
                                                    onClick={() => moveImage(index, index - 1)}
                                                    className="px-1 py-0.5 text-[10px] bg-white/80 rounded"
                                                >
                                                    ↑
                                                </button>
                                            )}
                                            {index < imagePreviews.length - 1 && (
                                                <button
                                                    type="button"
                                                    onClick={() => moveImage(index, index + 1)}
                                                    className="px-1 py-0.5 text-[10px] bg-white/80 rounded"
                                                >
                                                    ↓
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Add Images</label>
                                <Input
                                    type="file"
                                    accept="image/jpeg,image/png,image/webp"
                                    multiple
                                    onChange={handleImageInputChange}
                                />
                                <p className="text-xs text-gray-500 mt-1">JPG, PNG, WEBP. Max ~2MB per image. Images will be compressed before upload if needed.</p>
                            </div>
                        </div>
                    </div>
                    {formError && (
                        <p className="text-sm text-red-600">{formError}</p>
                    )}
                    <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setEditing(null)}>
                            Cancel
                        </Button>
                        <Button onClick={handleSave} disabled={saving}>
                            {saving ? "Saving..." : "Save Changes"}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
