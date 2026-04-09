"use client";

import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  History, 
  Search, 
  Filter, 
  User as UserIcon, 
  Target, 
  Activity, 
  Info,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Loader2
} from "lucide-react";
import auditService, { AuditLog } from "@/services/auditService";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [actions, setActions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({
    action: "all",
    targetType: "all",
    userId: "",
    startDate: "",
    endDate: "",
  });

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const response = await auditService.getLogs({
        ...filters,
        action: filters.action === "all" ? undefined : filters.action,
        targetType: filters.targetType === "all" ? undefined : filters.targetType,
        page,
        limit: 15,
      });
      if (response.success) {
        setLogs(response.data);
        setTotalPages(response.pagination.totalPages);
      }
    } catch (error) {
      console.error("Failed to fetch logs:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchActions = async () => {
    try {
      const response = await auditService.getActions();
      if (response.success) {
        setActions(response.data);
      }
    } catch (error) {
      console.error("Failed to fetch actions:", error);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [page, filters]);

  useEffect(() => {
    fetchActions();
  }, []);

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPage(1);
  };

  const getActionBadgeColor = (action: string) => {
    if (action.includes("DELETE")) return "destructive";
    if (action.includes("CREATE") || action.includes("REGISTER")) return "success";
    if (action.includes("UPDATE")) return "warning";
    return "secondary";
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <History className="h-8 w-8 text-lime-600" />
            Audit System
          </h1>
          <p className="text-slate-500 font-medium">Track every action across the ListUp ecosystem</p>
        </div>
      </div>

      {/* Filters */}
      <Card className="border-none shadow-sm bg-slate-50/50">
        <CardContent className="p-4 flex flex-wrap gap-4">
          <div className="w-full md:w-48">
            <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Action</label>
            <Select value={filters.action} onValueChange={(v) => handleFilterChange("action", v)}>
              <SelectTrigger className="bg-white border-slate-200">
                <SelectValue placeholder="All Actions" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Actions</SelectItem>
                {actions.map(action => (
                  <SelectItem key={action} value={action}>{action}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="w-full md:w-48">
            <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Target Type</label>
            <Select value={filters.targetType} onValueChange={(v) => handleFilterChange("targetType", v)}>
              <SelectTrigger className="bg-white border-slate-200">
                <SelectValue placeholder="All Targets" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Targets</SelectItem>
                <SelectItem value="USER">User</SelectItem>
                <SelectItem value="LISTING">Listing</SelectItem>
                <SelectItem value="PAYMENT">Payment</SelectItem>
                <SelectItem value="KYC">KYC</SelectItem>
                <SelectItem value="STORE">Store</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex-1 min-w-[200px]">
            <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">User ID / Email</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input 
                placeholder="Filter by user..." 
                className="pl-9 bg-white border-slate-200"
                value={filters.userId}
                onChange={(e) => handleFilterChange("userId", e.target.value)}
              />
            </div>
          </div>

          <div className="flex gap-2">
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">From</label>
              <Input 
                type="date" 
                className="bg-white border-slate-200" 
                value={filters.startDate}
                onChange={(e) => handleFilterChange("startDate", e.target.value)}
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">To</label>
              <Input 
                type="date" 
                className="bg-white border-slate-200"
                value={filters.endDate}
                onChange={(e) => handleFilterChange("endDate", e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Logs Table */}
      <Card className="border-none shadow-sm overflow-hidden">
        <CardContent className="p-0">
          <div className="relative">
            {loading && (
              <div className="absolute inset-0 bg-white/50 backdrop-blur-[1px] z-10 flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-lime-600" />
              </div>
            )}
            
            <Table>
              <TableHeader className="bg-slate-50">
                <TableRow>
                  <TableHead className="font-black text-slate-900">User</TableHead>
                  <TableHead className="font-black text-slate-900">Action</TableHead>
                  <TableHead className="font-black text-slate-900">Target</TableHead>
                  <TableHead className="font-black text-slate-900">IP Address</TableHead>
                  <TableHead className="font-black text-slate-900">Timestamp</TableHead>
                  <TableHead className="font-black text-slate-900 text-right">Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.length === 0 && !loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-32 text-center text-slate-500 font-medium">
                      No audit logs found matching your filters
                    </TableCell>
                  </TableRow>
                ) : (
                  logs.map((log) => (
                    <TableRow key={log.id} className="hover:bg-slate-50/50 transition-colors">
                      <TableCell>
                        {log.user ? (
                          <div className="flex flex-col">
                            <span className="font-bold text-slate-900">{log.user.name}</span>
                            <span className="text-xs text-slate-500">{log.user.email}</span>
                          </div>
                        ) : (
                          <span className="text-slate-400 font-medium">System</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant={getActionBadgeColor(log.action) as any} className="font-bold">
                          {log.action}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {log.targetType ? (
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-black text-slate-500 uppercase bg-slate-100 px-2 py-0.5 rounded">
                              {log.targetType}
                            </span>
                            <span className="text-xs font-mono text-slate-400 truncate max-w-[100px]">
                              {log.targetId}
                            </span>
                          </div>
                        ) : (
                          <span className="text-slate-300">-</span>
                        )}
                      </TableCell>
                      <TableCell className="font-mono text-xs text-slate-500">
                        {log.ipAddress || "Unknown"}
                      </TableCell>
                      <TableCell className="text-slate-600 font-medium">
                        {format(new Date(log.createdAt), "MMM d, HH:mm:ss")}
                      </TableCell>
                      <TableCell className="text-right">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <Info className="h-4 w-4 text-slate-400" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-xl">
                            <DialogHeader>
                              <DialogTitle className="flex items-center gap-2">
                                <Activity className="h-5 w-5 text-lime-600" />
                                Activity Detail
                              </DialogTitle>
                              <DialogDescription>
                                Full audit trail for event ID: {log.id}
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                  <label className="text-[10px] font-black text-slate-400 uppercase">IP Address</label>
                                  <p className="text-sm font-mono font-medium">{log.ipAddress || "N/A"}</p>
                                </div>
                                <div className="space-y-1">
                                  <label className="text-[10px] font-black text-slate-400 uppercase">User Agent</label>
                                  <p className="text-sm truncate font-medium" title={log.userAgent || ""}>
                                    {log.userAgent || "N/A"}
                                  </p>
                                </div>
                              </div>
                              <div className="space-y-1">
                                <label className="text-[10px] font-black text-slate-400 uppercase">Metadata / Payload</label>
                                <pre className="bg-slate-950 text-lime-400 p-4 rounded-xl text-[11px] overflow-auto max-h-[300px] font-mono leading-relaxed">
                                  {JSON.stringify(log.metadata, null, 2)}
                                </pre>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <div className="p-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
            <p className="text-sm text-slate-500 font-medium">
              Page <span className="font-black text-slate-900">{page}</span> of <span className="font-black text-slate-900">{totalPages}</span>
            </p>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                disabled={page <= 1}
                onClick={() => setPage(p => p - 1)}
                className="border-slate-200"
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                disabled={page >= totalPages}
                onClick={() => setPage(p => p + 1)}
                className="border-slate-200"
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
