import { useState } from "react";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import CartItem from "@/components/CartItem";
import { CartItem as CartItemType } from "@shared/schema";

export default function Cart() {
  // TODO: Replace with actual cart state management
  const [cartItems, setCartItems] = useState<CartItemType[]>([]);

  const updateQuantity = (productId: string, quantity: number) => {
    setCartItems(items =>
      items.map(item =>
        item.productId === productId ? { ...item, quantity } : item
      )
    );
  };

  const removeItem = (productId: string) => {
    setCartItems(items => items.filter(item => item.productId !== productId));
  };

  // Group items by shop
  const itemsByShop = cartItems.reduce((acc, item) => {
    if (!acc[item.shopId]) {
      acc[item.shopId] = {
        shopId: item.shopId,
        shopName: item.shopName,
        items: []
      };
    }
    acc[item.shopId].items.push(item);
    return acc;
  }, {} as Record<string, { shopId: string; shopName: string; items: CartItemType[] }>);

  const shops = Object.values(itemsByShop);

  const calculateShopTotal = (items: CartItemType[]) => {
    return items.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const subtotal = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  const deliveryFee = cartItems.length > 0 ? 50 : 0;
  const total = subtotal + deliveryFee;

  if (cartItems.length === 0) {
    return (
      <div className="container px-4 md:px-6 py-8">
        <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground mb-4">Your cart is empty</p>
            <Link href="/products">
              <Button data-testid="button-continue-shopping">Continue Shopping</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container px-4 md:px-6 py-8">
      <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>
      
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Multi-Shop Cart */}
          {shops.map((shop) => (
            <Card key={shop.shopId}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span data-testid={`text-shop-name-${shop.shopId}`}>{shop.shopName}</span>
                  <span className="text-sm text-muted-foreground">
                    {shop.items.length} item{shop.items.length !== 1 ? 's' : ''}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {shop.items.map((item) => (
                  <CartItem
                    key={item.productId}
                    item={item}
                    onUpdateQuantity={updateQuantity}
                    onRemove={removeItem}
                  />
                ))}
                
                <Separator />
                <div className="flex justify-between font-semibold">
                  <span>Shop Total:</span>
                  <span data-testid={`text-shop-total-${shop.shopId}`}>
                    ₹{calculateShopTotal(shop.items).toLocaleString()}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span data-testid="text-subtotal">₹{subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery Fee</span>
                  <span data-testid="text-delivery-fee">₹{deliveryFee}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-semibold text-lg">
                  <span>Total</span>
                  <span data-testid="text-total">₹{total.toLocaleString()}</span>
                </div>
              </div>

              <Link href="/checkout">
                <Button className="w-full" size="lg" data-testid="button-checkout">
                  Proceed to Checkout
                </Button>
              </Link>

              <div className="text-xs text-muted-foreground text-center">
                <p>Orders will be split by shop for individual processing</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
