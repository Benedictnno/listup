"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import  Button from "@/components/ui/button";
import  Badge from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Plus, Edit, Trash } from "lucide-react";

type Role = {
  id: string;
  name: string;
  description: string;
  permissions: string[];
};

const initialRoles = [
  {
    id: "1",
    name: "Admin",
    description: "Full system access",
    permissions: ["users:read", "users:write", "vendors:read", "vendors:write"]
  },
  {
    id: "2",
    name: "Editor",
    description: "Can edit content but not manage users",
    permissions: ["vendors:read", "vendors:write", "listings:read", "listings:write"]
  },
  {
    id: "3",
    name: "Viewer",
    description: "Read-only access",
    permissions: ["vendors:read", "listings:read", "categories:read"]
  }
];

export default function RolesPage() {
  const [roles] = useState<Role[]>(initialRoles);

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Role Management</h1>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Role
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Roles</CardTitle>
        </CardHeader>
        <CardContent>
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4">Name</th>
                <th className="text-left py-3 px-4">Description</th>
                <th className="text-left py-3 px-4">Permissions</th>
                <th className="text-right py-3 px-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {roles.map((role) => (
                <tr key={role.id} className="border-b">
                  <td className="py-3 px-4 font-medium">{role.name}</td>
                  <td className="py-3 px-4">{role.description}</td>
                  <td className="py-3 px-4">
                    <div className="flex flex-wrap gap-1">
                      {role.permissions.slice(0, 2).map((permission) => (
                        <Badge key={permission} variant="outline">{permission}</Badge>
                      ))}
                      {role.permissions.length > 2 && (
                        <Badge variant="outline">+{role.permissions.length - 2} more</Badge>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}