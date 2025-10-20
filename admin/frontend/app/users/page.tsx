"use client";

import { useMemo, useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import Button  from "@/components/ui/button";
import { Users, Search } from "lucide-react";

interface UserRow {
  id: string;
  name: string;
  email: string;
  status: "ACTIVE" | "SUSPENDED";
}

const sampleUsers: UserRow[] = [
  { id: "u1", name: "Jane Cooper", email: "jane@example.com", status: "ACTIVE" },
  { id: "u2", name: "Cody Fisher", email: "cody@example.com", status: "SUSPENDED" },
  { id: "u3", name: "Kristin Watson", email: "kristin@example.com", status: "ACTIVE" },
];

export default function UsersPage() {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<"ALL" | UserRow["status"]>("ALL");

  const filtered = useMemo(() => {
    return sampleUsers.filter((u) => {
      const matchesQuery = (u.name + u.email).toLowerCase().includes(query.toLowerCase());
      const matchesStatus = status === "ALL" ? true : u.status === status;
      return matchesQuery && matchesStatus;
    });
  }, [query, status]);

  return (
    <DashboardLayout>
      <div className="p-4 md:p-6 space-y-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Users</h1>
            <p className="text-muted-foreground">Manage platform users and access</p>
          </div>
          <div className="flex items-center gap-2">
            <Button>
              <Users className="mr-2 h-4 w-4" /> Invite User
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search users..." value={query} onChange={(e) => setQuery(e.target.value)} className="pl-8" />
              </div>
              <div>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  className="h-10 w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="ALL">All Status</option>
                  <option value="ACTIVE">Active</option>
                  <option value="SUSPENDED">Suspended</option>
                </select>
              </div>
              <div>
                <Button className="w-full">Export</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-0">
            <table className="w-full text-sm">
              <thead className="text-left text-muted-foreground">
                <tr className="border-b">
                  <th className="py-2 px-3">Name</th>
                  <th className="py-2 px-3">Email</th>
                  <th className="py-2 px-3">Status</th>
                  <th className="py-2 px-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((u) => (
                  <tr key={u.id} className="border-b hover:bg-muted/50">
                    <td className="py-2 px-3">{u.name}</td>
                    <td className="py-2 px-3">{u.email}</td>
                    <td className="py-2 px-3">
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                        u.status === "ACTIVE" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                      }`}>{u.status}</span>
                    </td>
                    <td className="py-2 px-3">
                      <div className="flex gap-2">
                        <Button variant="outline">View</Button>
                        <Button variant={u.status === "ACTIVE" ? "destructive" : "default"}>
                          {u.status === "ACTIVE" ? "Suspend" : "Activate"}
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
    </DashboardLayout>
  );
}