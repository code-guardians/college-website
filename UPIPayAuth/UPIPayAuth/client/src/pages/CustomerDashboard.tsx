import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Order, OrderStatus } from "@shared/schema";

export default function CustomerDashboard() {
  const [activeTab, setActiveTab] = useState("orders");

  const { data: orders = [] } = useQuery<Order[]>({
    queryKey: ["/api/orders"],
  });

  const getStatusBadgeVariant = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.DELIVERED:
        return "default";
      case OrderStatus.IN_TRANSIT:
        return "secondary";
      case OrderStatus.PROCESSING:
        return "outline";
      case OrderStatus.CANCELLED:
        return "destructive";
      default:
        return "outline";
    }
  };

  const formatStatus = (status: OrderStatus) => {
    return status.replace("_", " ").replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <div className="container px-4 md:px-6 py-8">
      <h1 className="text-3xl font-bold mb-8">My Dashboard</h1>
      
      <div className="grid lg:grid-cols-4 gap-8">
        {/* Sidebar Navigation */}
        <aside className="lg:col-span-1">
          <Card>
            <CardContent className="p-6">
              <nav className="space-y-2">
                <Button
                  variant={activeTab === "orders" ? "default" : "ghost"}
                  className="w-full justify-start"
                  onClick={() => setActiveTab("orders")}
                  data-testid="button-nav-orders"
                >
                  Orders
                </Button>
                <Button
                  variant={activeTab === "wishlist" ? "default" : "ghost"}
                  className="w-full justify-start"
                  onClick={() => setActiveTab("wishlist")}
                  data-testid="button-nav-wishlist"
                >
                  Wishlist
                </Button>
                <Button
                  variant={activeTab === "reviews" ? "default" : "ghost"}
                  className="w-full justify-start"
                  onClick={() => setActiveTab("reviews")}
                  data-testid="button-nav-reviews"
                >
                  Reviews
                </Button>
                <Button
                  variant={activeTab === "settings" ? "default" : "ghost"}
                  className="w-full justify-start"
                  onClick={() => setActiveTab("settings")}
                  data-testid="button-nav-settings"
                >
                  Account Settings
                </Button>
              </nav>
            </CardContent>
          </Card>
        </aside>

        {/* Main Content */}
        <main className="lg:col-span-3">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsContent value="orders" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Orders</CardTitle>
                </CardHeader>
                <CardContent>
                  {orders.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground mb-4">No orders yet</p>
                      <Button data-testid="button-start-shopping">Start Shopping</Button>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {orders.map((order) => (
                        <div key={order.id} className="border rounded-lg p-4" data-testid={`order-card-${order.id}`}>
                          <div className="flex items-center justify-between mb-4">
                            <div>
                              <h3 className="font-semibold" data-testid={`text-order-id-${order.id}`}>
                                Order #{order.id}
                              </h3>
                              <p className="text-sm text-muted-foreground">
                                Placed on {new Date(order.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                            <Badge variant={getStatusBadgeVariant(order.status)} data-testid={`badge-order-status-${order.id}`}>
                              {formatStatus(order.status)}
                            </Badge>
                          </div>
                          
                          <div className="space-y-3">
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
                                <span className="font-semibold">
                                  ₹{(item.price * item.quantity).toLocaleString()}
                                </span>
                              </div>
                            ))}
                          </div>
                          
                          <div className="mt-4 pt-4 border-t flex items-center justify-between">
                            <span className="font-semibold">
                              Total: ₹{order.total.toLocaleString()}
                            </span>
                            <div className="flex gap-2">
                              <Button variant="outline" size="sm" data-testid={`button-track-${order.id}`}>
                                Track Order
                              </Button>
                              {order.status === OrderStatus.DELIVERED && (
                                <Button size="sm" data-testid={`button-review-${order.id}`}>
                                  Write Review
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="wishlist">
              <Card>
                <CardHeader>
                  <CardTitle>Wishlist</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">Your wishlist is empty</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="reviews">
              <Card>
                <CardHeader>
                  <CardTitle>My Reviews</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No reviews yet</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="settings">
              <Card>
                <CardHeader>
                  <CardTitle>Account Settings</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">Settings coming soon</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
}
