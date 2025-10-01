import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Plus, Package, Users, Star, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Order, OrderStatus } from "@shared/schema";

export default function ShopDashboard() {
  const { data: orders = [] } = useQuery<Order[]>({
    queryKey: ["/api/shop/orders"],
  });

  const { data: stats } = useQuery({
    queryKey: ["/api/shop/stats"],
  });

  const updateOrderStatus = (orderId: string, status: OrderStatus) => {
    // TODO: Implement order status update
    console.log("Update order", orderId, "to", status);
  };

  const formatStatus = (status: OrderStatus) => {
    return status.replace("_", " ").replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <div className="container px-4 md:px-6 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Shop Dashboard</h1>
        <Button data-testid="button-add-product">
          <Plus className="h-4 w-4 mr-2" />
          Add New Product
        </Button>
      </div>
      
      {/* Stats */}
      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Sales</p>
                <p className="text-2xl font-bold" data-testid="text-total-sales">
                  ₹{stats?.totalSales?.toLocaleString() || "0"}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Orders</p>
                <p className="text-2xl font-bold" data-testid="text-total-orders">
                  {stats?.totalOrders || "0"}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Package className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Products</p>
                <p className="text-2xl font-bold" data-testid="text-total-products">
                  {stats?.totalProducts || "0"}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Package className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Rating</p>
                <p className="text-2xl font-bold" data-testid="text-shop-rating">
                  {stats?.averageRating?.toFixed(1) || "0"}
                </p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Star className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Recent Orders */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Recent Orders</CardTitle>
            </CardHeader>
            <CardContent>
              {orders.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No orders yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map((order) => (
                    <div key={order.id} className="border rounded-lg p-4" data-testid={`shop-order-${order.id}`}>
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h3 className="font-semibold">Order #{order.id}</h3>
                          <p className="text-sm text-muted-foreground">
                            {order.deliveryAddress.recipientName} • {order.deliveryAddress.email}
                          </p>
                        </div>
                        <Select
                          value={order.status}
                          onValueChange={(value) => updateOrderStatus(order.id, value as OrderStatus)}
                        >
                          <SelectTrigger className="w-32" data-testid={`select-status-${order.id}`}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value={OrderStatus.PROCESSING}>Processing</SelectItem>
                            <SelectItem value={OrderStatus.ACCEPTED}>Accepted</SelectItem>
                            <SelectItem value={OrderStatus.IN_TRANSIT}>In Transit</SelectItem>
                            <SelectItem value={OrderStatus.DELIVERED}>Delivered</SelectItem>
                            <SelectItem value={OrderStatus.CANCELLED}>Cancelled</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2 mb-3">
                        {order.items.map((item, index) => (
                          <div key={index} className="flex items-center gap-4">
                            {item.image && (
                              <img
                                src={item.image}
                                alt={item.name}
                                className="w-12 h-12 object-cover rounded-lg"
                              />
                            )}
                            <div className="flex-1">
                              <h4 className="font-semibold">{item.name}</h4>
                              <p className="text-sm text-muted-foreground">
                                Qty: {item.quantity} • ₹{item.price.toLocaleString()}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      <div className="text-sm text-muted-foreground">
                        <p><strong>Address:</strong> {order.deliveryAddress.addressLine1}</p>
                        <p><strong>Phone:</strong> {order.deliveryAddress.phone}</p>
                        <p><strong>Total:</strong> ₹{order.total.toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions & Stats */}
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full" data-testid="button-add-product-quick">
                Add Product
              </Button>
              <Button variant="outline" className="w-full" data-testid="button-manage-inventory">
                Manage Inventory
              </Button>
              <Button variant="outline" className="w-full" data-testid="button-view-analytics">
                View Analytics
              </Button>
              <Button variant="outline" className="w-full" data-testid="button-shop-settings">
                Shop Settings
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>This Week</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">New Orders</span>
                <span className="font-semibold" data-testid="text-weekly-orders">
                  {stats?.weeklyOrders || "0"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Revenue</span>
                <span className="font-semibold" data-testid="text-weekly-revenue">
                  ₹{stats?.weeklyRevenue?.toLocaleString() || "0"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Products Sold</span>
                <span className="font-semibold" data-testid="text-weekly-products-sold">
                  {stats?.weeklyProductsSold || "0"}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
