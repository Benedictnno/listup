"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {  
  Filter, 
  Eye, 
  MessageSquare, 
  Truck, 
  CheckCircle, 
  XCircle,
  Clock,

  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Package,
  Download
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import Image from "next/image";

interface Order {
  id: string;
  orderNumber: string;
  customer: {
    name: string;
    email: string;
    phone: string;
    address: string;
  };
  items: Array<{
    id: string;
    name: string;
    price: number;
    quantity: number;
    image?: string;
  }>;
  total: number;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  orderDate: string;
  estimatedDelivery?: string;
  trackingNumber?: string;
  notes?: string;
  priority: 'low' | 'medium' | 'high';
}

interface FilterState {
  search: string;
  status: string;
  paymentStatus: string;
  priority: string;
  dateRange: string;
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    status: '',
    paymentStatus: '',
    priority: '',
    dateRange: ''
  });

  useEffect(() => {
    async function loadOrders() {
      try {
        // Mock data for demonstration - in real app, this would come from API
        const mockOrders: Order[] = [
          {
            id: '1',
            orderNumber: 'ORD-2024-001',
            customer: {
              name: 'John Doe',
              email: 'john.doe@email.com',
              phone: '+234 801 234 5678',
              address: '123 Main St, Lagos, Nigeria'
            },
            items: [
              { id: '1', name: 'iPhone 13 Pro', price: 450000, quantity: 1, image: '/placeholder.png' }
            ],
            total: 450000,
            status: 'confirmed',
            paymentStatus: 'paid',
            orderDate: '2024-01-15T10:30:00Z',
            estimatedDelivery: '2024-01-20T10:30:00Z',
            priority: 'high'
          },
          {
            id: '2',
            orderNumber: 'ORD-2024-002',
            customer: {
              name: 'Jane Smith',
              email: 'jane.smith@email.com',
              phone: '+234 802 345 6789',
              address: '456 Oak Ave, Abuja, Nigeria'
            },
            items: [
              { id: '2', name: 'MacBook Pro M2', price: 320000, quantity: 1, image: '/placeholder.png' },
              { id: '3', name: 'AirPods Pro', price: 120000, quantity: 1, image: '/placeholder.png' }
            ],
            total: 440000,
            status: 'processing',
            paymentStatus: 'paid',
            orderDate: '2024-01-14T14:20:00Z',
            estimatedDelivery: '2024-01-22T14:20:00Z',
            priority: 'medium'
          },
          {
            id: '3',
            orderNumber: 'ORD-2024-003',
            customer: {
              name: 'Mike Johnson',
              email: 'mike.johnson@email.com',
              phone: '+234 803 456 7890',
              address: '789 Pine Rd, Port Harcourt, Nigeria'
            },
            items: [
              { id: '4', name: 'Samsung Galaxy S23', price: 280000, quantity: 1, image: '/placeholder.png' }
            ],
            total: 280000,
            status: 'pending',
            paymentStatus: 'pending',
            orderDate: '2024-01-13T09:15:00Z',
            priority: 'low'
          },
          {
            id: '4',
            orderNumber: 'ORD-2024-004',
            customer: {
              name: 'Sarah Wilson',
              email: 'sarah.wilson@email.com',
              phone: '+234 804 567 8901',
              address: '321 Elm St, Kano, Nigeria'
            },
            items: [
              { id: '5', name: 'iPad Air', price: 180000, quantity: 1, image: '/placeholder.png' }
            ],
            total: 180000,
            status: 'shipped',
            paymentStatus: 'paid',
            orderDate: '2024-01-12T16:45:00Z',
            estimatedDelivery: '2024-01-18T16:45:00Z',
            trackingNumber: 'TRK-123456789',
            priority: 'medium'
          }
        ];

        setOrders(mockOrders);
        setFilteredOrders(mockOrders);
      } catch (error) {
        console.error('Error loading orders:', error);
      } finally {
        setLoading(false);
      }
    }

    loadOrders();
  }, []);

  // Apply filters whenever filters or orders change
  useEffect(() => {
    let filtered = [...orders];

    // Search filter
    if (filters.search) {
      filtered = filtered.filter(order =>
        order.orderNumber.toLowerCase().includes(filters.search.toLowerCase()) ||
        order.customer.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        order.customer.email.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    // Status filter
    if (filters.status) {
      filtered = filtered.filter(order => order.status === filters.status);
    }

    // Payment status filter
    if (filters.paymentStatus) {
      filtered = filtered.filter(order => order.paymentStatus === filters.paymentStatus);
    }

    // Priority filter
    if (filters.priority) {
      filtered = filtered.filter(order => order.priority === filters.priority);
    }

    setFilteredOrders(filtered);
  }, [orders, filters]);

  const updateOrderStatus = async (orderId: string, newStatus: Order['status']) => {
    try {
      // In real app, this would call an API
      setOrders(orders.map(order => 
        order.id === orderId ? { ...order, status: newStatus } : order
      ));
    } catch (error) {
      console.error('Error updating order status:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'processing': return 'bg-purple-100 text-purple-800';
      case 'shipped': return 'bg-indigo-100 text-indigo-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'refunded': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock size={16} />;
      case 'confirmed': return <CheckCircle size={16} />;
      case 'processing': return <Package size={16} />;
      case 'shipped': return <Truck size={16} />;
      case 'delivered': return <CheckCircle size={16} />;
      case 'cancelled': return <XCircle size={16} />;
      default: return <Clock size={16} />;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-NG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Orders Management</h1>
          <p className="text-gray-600">Track and manage customer orders</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setShowFilters(!showFilters)} variant="outline">
            <Filter size={16} className="mr-2" />
            Filters
          </Button>
          <Button>
            <Download size={16} className="mr-2" />
            Export Orders
          </Button>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <Card>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Search</label>
                <Input
                  placeholder="Order #, customer name..."
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Order Status</label>
                <Select value={filters.status} onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Statuses</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="processing">Processing</SelectItem>
                    <SelectItem value="shipped">Shipped</SelectItem>
                    <SelectItem value="delivered">Delivered</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Payment Status</label>
                <Select value={filters.paymentStatus} onValueChange={(value) => setFilters(prev => ({ ...prev, paymentStatus: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Payments" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Payments</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                    <SelectItem value="refunded">Refunded</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Priority</label>
                <Select value={filters.priority} onValueChange={(value) => setFilters(prev => ({ ...prev, priority: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Priorities" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Priorities</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Date Range</label>
                <Select value={filters.dateRange} onValueChange={(value) => setFilters(prev => ({ ...prev, dateRange: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Time" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Time</SelectItem>
                    <SelectItem value="today">Today</SelectItem>
                    <SelectItem value="week">This Week</SelectItem>
                    <SelectItem value="month">This Month</SelectItem>
                    <SelectItem value="quarter">This Quarter</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-end mt-4">
              <Button
                variant="outline"
                onClick={() => setFilters({
                  search: '',
                  status: '',
                  paymentStatus: '',
                  priority: '',
                  dateRange: ''
                })}
              >
                Clear All Filters
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Orders List */}
      <div className="space-y-4">
        {filteredOrders.map((order) => (
          <Card key={order.id} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row gap-6">
                {/* Order Info */}
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold">{order.orderNumber}</h3>
                      <p className="text-sm text-gray-500">
                        <Calendar size={14} className="inline mr-1" />
                        {formatDate(order.orderDate)}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Badge className={getStatusColor(order.status)}>
                        {getStatusIcon(order.status)}
                        <span className="ml-1">{order.status.charAt(0).toUpperCase() + order.status.slice(1)}</span>
                      </Badge>
                      <Badge className={getPaymentStatusColor(order.paymentStatus)}>
                        {order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}
                      </Badge>
                      <Badge className={getPriorityColor(order.priority)}>
                        {order.priority.charAt(0).toUpperCase() + order.priority.slice(1)} Priority
                      </Badge>
                    </div>
                  </div>

                  {/* Customer Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <User size={16} className="text-gray-400" />
                        <span className="font-medium">{order.customer.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail size={16} className="text-gray-400" />
                        <span className="text-sm text-gray-600">{order.customer.email}</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Phone size={16} className="text-gray-400" />
                        <span className="text-sm text-gray-600">{order.customer.phone}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin size={16} className="text-gray-400" />
                        <span className="text-sm text-gray-600">{order.customer.address}</span>
                      </div>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="space-y-2">
                    {order.items.map((item) => (
                      <div key={item.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <Image 
                        sizes="100"
                          src={item.image || '/placeholder.png'} 
                          alt={item.name}
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                        <div className="flex-1">
                          <p className="font-medium">{item.name}</p>
                          <p className="text-sm text-gray-500">
                            Qty: {item.quantity} × {formatCurrency(item.price)}
                          </p>
                        </div>
                        <p className="font-semibold">{formatCurrency(item.price * item.quantity)}</p>
                      </div>
                    ))}
                  </div>

                  {/* Order Total */}
                  <div className="flex justify-between items-center mt-4 pt-4 border-t">
                    <div>
                      <p className="text-lg font-bold text-lime-600">
                        Total: {formatCurrency(order.total)}
                      </p>
                      {order.estimatedDelivery && (
                        <p className="text-sm text-gray-500">
                          Est. Delivery: {formatDate(order.estimatedDelivery)}
                        </p>
                      )}
                    </div>
                    {order.trackingNumber && (
                      <div className="text-right">
                        <p className="text-sm font-medium">Tracking: {order.trackingNumber}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2 lg:w-48">
                  <Button 
                    variant="outline" 
                    onClick={() => setSelectedOrder(order)}
                    className="w-full"
                  >
                    <Eye size={16} className="mr-2" />
                    View Details
                  </Button>
                  <Button variant="outline" className="w-full">
                    <MessageSquare size={16} className="mr-2" />
                    Message Customer
                  </Button>
                  
                  {/* Status Update Buttons */}
                  {order.status === 'pending' && (
                    <Button 
                      onClick={() => updateOrderStatus(order.id, 'confirmed')}
                      className="w-full"
                    >
                      Confirm Order
                    </Button>
                  )}
                  {order.status === 'confirmed' && (
                    <Button 
                      onClick={() => updateOrderStatus(order.id, 'processing')}
                      className="w-full"
                    >
                      Start Processing
                    </Button>
                  )}
                  {order.status === 'processing' && (
                    <Button 
                      onClick={() => updateOrderStatus(order.id, 'shipped')}
                      className="w-full"
                    >
                      Mark Shipped
                    </Button>
                  )}
                  {order.status === 'shipped' && (
                    <Button 
                      onClick={() => updateOrderStatus(order.id, 'delivered')}
                      className="w-full"
                    >
                      Mark Delivered
                    </Button>
                  )}
                  
                  {order.status !== 'cancelled' && order.status !== 'delivered' && (
                    <Button 
                      variant="destructive" 
                      onClick={() => updateOrderStatus(order.id, 'cancelled')}
                      className="w-full"
                    >
                      Cancel Order
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredOrders.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <div className="text-gray-400 mb-4">
              <Package size={48} className="mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No orders found</h3>
            <p className="text-gray-500">
              {filters.search || filters.status || filters.paymentStatus 
                ? 'Try adjusting your filters or search terms'
                : 'Orders will appear here once customers start placing them'
              }
            </p>
          </CardContent>
        </Card>
      )}

      {/* Order Details Modal */}
      {selectedOrder && (
        <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Order Details - {selectedOrder.orderNumber}</DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              {/* Order Summary */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm text-gray-600">Order Date</p>
                  <p className="font-medium">{formatDate(selectedOrder.orderDate)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Amount</p>
                  <p className="font-bold text-lime-600">{formatCurrency(selectedOrder.total)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Items</p>
                  <p className="font-medium">{selectedOrder.items.length}</p>
                </div>
              </div>

              {/* Customer Information */}
              <div>
                <h4 className="font-semibold mb-3">Customer Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Name</p>
                    <p className="font-medium">{selectedOrder.customer.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="font-medium">{selectedOrder.customer.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Phone</p>
                    <p className="font-medium">{selectedOrder.customer.phone}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Address</p>
                    <p className="font-medium">{selectedOrder.customer.address}</p>
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div>
                <h4 className="font-semibold mb-3">Order Items</h4>
                <div className="space-y-3">
                  {selectedOrder.items.map((item) => (
                    <div key={item.id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                      <Image 
                      sizes="100"
                        src={item.image || '/placeholder.png'} 
                        alt={item.name}
                        className="w-16 h-16 rounded-lg object-cover"
                      />
                      <div className="flex-1">
                        <p className="font-medium">{item.name}</p>
                        <p className="text-sm text-gray-500">
                          Quantity: {item.quantity} | Unit Price: {formatCurrency(item.price)}
                        </p>
                      </div>
                      <p className="font-bold">{formatCurrency(item.price * item.quantity)}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order Notes */}
              {selectedOrder.notes && (
                <div>
                  <h4 className="font-semibold mb-3">Order Notes</h4>
                  <p className="text-gray-600">{selectedOrder.notes}</p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button variant="outline" onClick={() => setSelectedOrder(null)}>
                  Close
                </Button>
                <Button>
                  <MessageSquare size={16} className="mr-2" />
                  Contact Customer
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
