import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info } from "lucide-react";
import UPIQRCode from "@/components/UPIQRCode";
import { deliveryAddressSchema, DeliveryAddress } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";

export default function Checkout() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

  // TODO: Replace with actual cart data
  const mockOrders = [
    {
      shopId: "shop1",
      shopName: "TechHub Store",
      upiId: "techhub@paytm",
      total: 103999,
      items: [
        { name: "MacBook Pro 13\" (2021)", quantity: 1, price: 85000 },
        { name: "Sony WH-1000XM4", quantity: 1, price: 18999 }
      ]
    },
    {
      shopId: "shop2",
      shopName: "BookWorm Store",
      upiId: "bookworm@phonepe",
      total: 1200,
      items: [
        { name: "Data Structures & Algorithms", quantity: 1, price: 1200 }
      ]
    }
  ];

  const form = useForm<DeliveryAddress>({
    resolver: zodResolver(deliveryAddressSchema),
    defaultValues: {
      recipientName: user?.name || "",
      email: user?.email || "",
      phone: "",
      addressLine1: "",
      addressLine2: "",
      campusLocation: "",
      postalCode: "",
      notes: ""
    }
  });

  const onSubmit = async (data: DeliveryAddress) => {
    setIsProcessing(true);
    try {
      // TODO: Submit orders to backend
      console.log("Delivery Address:", data);
      console.log("Orders:", mockOrders);
      
      toast({
        title: "Orders Confirmed!",
        description: "You will receive confirmation emails shortly."
      });
      
      // Redirect to dashboard after successful order
      // navigate("/dashboard");
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to process orders. Please try again."
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const grandTotal = mockOrders.reduce((sum, order) => sum + order.total, 0);
  const deliveryFee = 50;
  const totalWithDelivery = grandTotal + deliveryFee;

  return (
    <div className="container px-4 md:px-6 py-8">
      <h1 className="text-3xl font-bold mb-8">Checkout</h1>
      
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Delivery Details */}
          <Card>
            <CardHeader>
              <CardTitle>Delivery Details</CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="recipientName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter your full name" {...field} data-testid="input-full-name" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone Number</FormLabel>
                          <FormControl>
                            <Input placeholder="+91 12345 67890" {...field} data-testid="input-phone" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input {...field} readOnly data-testid="input-email" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="campusLocation"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Campus Location</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-campus-location">
                                <SelectValue placeholder="Select location" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="main-block-a">Main Campus - Block A</SelectItem>
                              <SelectItem value="main-block-b">Main Campus - Block B</SelectItem>
                              <SelectItem value="hostel">Hostel Area</SelectItem>
                              <SelectItem value="library">Library</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="addressLine1"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Detailed Address</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Room number, floor, landmark..."
                            {...field}
                            data-testid="textarea-address"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Delivery Notes (Optional)</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Any special instructions for delivery..."
                            {...field}
                            data-testid="textarea-notes"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </form>
              </Form>
            </CardContent>
          </Card>

          {/* Payment Method */}
          <Card>
            <CardHeader>
              <CardTitle>Payment Method</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                {mockOrders.map((order) => (
                  <UPIQRCode
                    key={order.shopId}
                    upiId={order.upiId}
                    amount={order.total}
                    shopName={order.shopName}
                  />
                ))}
              </div>

              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  <div className="space-y-2">
                    <p className="font-semibold">Payment Instructions:</p>
                    <ul className="text-sm space-y-1">
                      <li>• Scan each QR code separately for each shop</li>
                      <li>• Pay the exact amount shown for each order</li>
                      <li>• Take screenshot of payment confirmation</li>
                      <li>• Your orders will be automatically processed after payment verification</li>
                    </ul>
                  </div>
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                {mockOrders.map((order) => (
                  <div key={order.shopId} className="border rounded-lg p-3">
                    <div className="flex justify-between font-semibold mb-2">
                      <span data-testid={`text-order-shop-${order.shopId}`}>{order.shopName}</span>
                      <span>₹{order.total.toLocaleString()}</span>
                    </div>
                    <div className="text-sm text-muted-foreground space-y-1">
                      {order.items.map((item, index) => (
                        <p key={index}>
                          {item.name} x{item.quantity}
                        </p>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <Separator />

              <div className="space-y-3">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span data-testid="text-checkout-subtotal">₹{grandTotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery Fee</span>
                  <span data-testid="text-checkout-delivery">₹{deliveryFee}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-semibold text-lg">
                  <span>Total</span>
                  <span data-testid="text-checkout-total">₹{totalWithDelivery.toLocaleString()}</span>
                </div>
              </div>

              <Button
                className="w-full"
                size="lg"
                onClick={form.handleSubmit(onSubmit)}
                disabled={isProcessing}
                data-testid="button-confirm-orders"
              >
                {isProcessing ? "Processing..." : "Confirm Orders"}
              </Button>

              <div className="text-xs text-muted-foreground text-center">
                <p>By placing order, you agree to our Terms of Service</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
