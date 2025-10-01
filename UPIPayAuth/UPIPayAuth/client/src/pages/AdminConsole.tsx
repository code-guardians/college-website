import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Users, Building, Package, TrendingUp, Check, X, Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shop } from "@shared/schema";

export default function AdminConsole() {
  const { data: pendingShops = [] } = useQuery<Shop[]>({
    queryKey: ["/api/admin/shops/pending"],
  });

  const { data: stats } = useQuery({
    queryKey: ["/api/admin/stats"],
  });

  const approveShop = (shopId: string) => {
    // TODO: Implement shop approval
    console.log("Approve shop:", shopId);
  };

  const rejectShop = (shopId: string) => {
    // TODO: Implement shop rejection
    console.log("Reject shop:", shopId);
  };

  return (
    <div className="container px-4 md:px-6 py-8">
      <h1 className="text-3xl font-bold mb-8">Admin Console</h1>
      
      {/* Stats */}
      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Users</p>
                <p className="text-2xl font-bold" data-testid="text-total-users">
                  {stats?.totalUsers?.toLocaleString() || "0"}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Shops</p>
                <p className="text-2xl font-bold" data-testid="text-active-shops">
                  {stats?.activeShops || "0"}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Building className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Orders</p>
                <p className="text-2xl font-bold" data-testid="text-total-platform-orders">
                  {stats?.totalOrders?.toLocaleString() || "0"}
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
                <p className="text-sm text-muted-foreground">Platform Revenue</p>
                <p className="text-2xl font-bold" data-testid="text-platform-revenue">
                  ₹{stats?.platformRevenue?.toLocaleString() || "0"}
                </p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Pending Verifications */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Pending Shop Verifications</CardTitle>
            </CardHeader>
            <CardContent>
              {pendingShops.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No pending verifications</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {pendingShops.map((shop) => (
                    <div key={shop.id} className="border rounded-lg p-4" data-testid={`pending-shop-${shop.id}`}>
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h3 className="font-semibold" data-testid={`text-shop-name-${shop.id}`}>
                            {shop.name}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            Owner: {shop.ownerId}
                          </p>
                        </div>
                        <Badge variant="outline">Pending</Badge>
                      </div>
                      
                      <div className="text-sm text-muted-foreground mb-4">
                        <p><strong>Address:</strong> {shop.address}</p>
                        <p><strong>UPI ID:</strong> {shop.upiId}</p>
                        <p><strong>Submitted:</strong> {new Date(shop.createdAt).toLocaleDateString()}</p>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => approveShop(shop.id)}
                          className="bg-green-600 hover:bg-green-700"
                          data-testid={`button-approve-${shop.id}`}
                        >
                          <Check className="h-4 w-4 mr-2" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => rejectShop(shop.id)}
                          data-testid={`button-reject-${shop.id}`}
                        >
                          <X className="h-4 w-4 mr-2" />
                          Reject
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          data-testid={`button-view-details-${shop.id}`}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Admin Actions & Activity */}
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full" data-testid="button-manage-users">
                Manage Users
              </Button>
              <Button variant="outline" className="w-full" data-testid="button-manage-shops">
                Manage Shops
              </Button>
              <Button variant="outline" className="w-full" data-testid="button-system-logs">
                System Logs
              </Button>
              <Button variant="outline" className="w-full" data-testid="button-platform-settings">
                Platform Settings
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-sm space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">New shop registered</span>
                  <span>2h ago</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">User reported issue</span>
                  <span>4h ago</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shop verified</span>
                  <span>6h ago</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">System backup completed</span>
                  <span>12h ago</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
