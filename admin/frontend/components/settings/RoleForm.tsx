import { useState, useEffect } from "react";
import { Role } from "@/services/rolesService";
import Button from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type RoleFormProps = {
  role?: Role | null;
  onSubmit: (formData: RoleFormData) => void;
  onCancel: () => void;
};

export type RoleFormData = {
  name: string;
  description: string;
  permissions: string[];
};

const defaultPermissions = [
  "users:read",
  "users:write",
  "vendors:read",
  "vendors:write",
  "listings:read",
  "listings:write",
  "categories:read",
  "categories:write",
  "addresses:read",
  "addresses:write",
  "analytics:read",
  "settings:read",
  "settings:write"
];

export default function RoleForm({ role, onSubmit, onCancel }: RoleFormProps) {
  const [formData, setFormData] = useState<RoleFormData>({
    name: "",
    description: "",
    permissions: []
  });

  useEffect(() => {
    if (role) {
      setFormData({
        name: role.name,
        description: role.description,
        permissions: role.permissions
      });
    }
  }, [role]);

  const handlePermissionToggle = (permission: string) => {
    if (formData.permissions.includes(permission)) {
      setFormData({
        ...formData,
        permissions: formData.permissions.filter(p => p !== permission)
      });
    } else {
      setFormData({
        ...formData,
        permissions: [...formData.permissions, permission]
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="text-sm font-medium">Name</label>
        <Input 
          value={formData.name} 
          onChange={(e) => setFormData({...formData, name: e.target.value})}
          placeholder="Role name"
          required
        />
      </div>
      <div>
        <label className="text-sm font-medium">Description</label>
        <Input 
          value={formData.description} 
          onChange={(e) => setFormData({...formData, description: e.target.value})}
          placeholder="Role description"
        />
      </div>
      <div>
        <label className="text-sm font-medium">Permissions</label>
        <div className="grid grid-cols-2 gap-2 mt-2">
          {defaultPermissions.map((permission) => (
            <div key={permission} className="flex items-center">
              <input
                type="checkbox"
                id={permission}
                checked={formData.permissions.includes(permission)}
                onChange={() => handlePermissionToggle(permission)}
                className="mr-2"
              />
              <label htmlFor={permission} className="text-sm">{permission}</label>
            </div>
          ))}
        </div>
      </div>
      <div className="flex justify-end gap-2 mt-6">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          {role ? "Update" : "Create"}
        </Button>
      </div>
    </form>
  );
}