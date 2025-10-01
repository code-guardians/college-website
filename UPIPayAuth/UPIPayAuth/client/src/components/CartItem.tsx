import { Minus, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CartItem as CartItemType } from "@shared/schema";

interface CartItemProps {
  item: CartItemType;
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemove: (productId: string) => void;
}

export default function CartItem({ item, onUpdateQuantity, onRemove }: CartItemProps) {
  const handleQuantityChange = (delta: number) => {
    const newQuantity = item.quantity + delta;
    if (newQuantity > 0 && newQuantity <= item.stock) {
      onUpdateQuantity(item.productId, newQuantity);
    }
  };

  return (
    <div className="flex items-center gap-4 p-4 border rounded-lg" data-testid={`cart-item-${item.productId}`}>
      {/* Product Image */}
      <div className="w-16 h-16 bg-muted rounded-lg overflow-hidden">
        {item.image ? (
          <img
            src={item.image}
            alt={item.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-muted flex items-center justify-center">
            <span className="text-xs text-muted-foreground">No Image</span>
          </div>
        )}
      </div>

      {/* Product Details */}
      <div className="flex-1">
        <h4 className="font-semibold" data-testid={`text-item-title-${item.productId}`}>
          {item.title}
        </h4>
        <p className="text-sm text-muted-foreground">
          From: {item.shopName}
        </p>
        <p className="font-semibold text-primary" data-testid={`text-item-price-${item.productId}`}>
          ₹{item.price.toLocaleString()}
        </p>
      </div>

      {/* Quantity Controls */}
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="icon"
          className="w-8 h-8"
          onClick={() => handleQuantityChange(-1)}
          disabled={item.quantity <= 1}
          data-testid={`button-decrease-${item.productId}`}
        >
          <Minus className="h-4 w-4" />
        </Button>
        <span className="w-8 text-center" data-testid={`text-quantity-${item.productId}`}>
          {item.quantity}
        </span>
        <Button
          variant="outline"
          size="icon"
          className="w-8 h-8"
          onClick={() => handleQuantityChange(1)}
          disabled={item.quantity >= item.stock}
          data-testid={`button-increase-${item.productId}`}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {/* Remove Button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => onRemove(item.productId)}
        className="text-destructive hover:text-destructive"
        data-testid={`button-remove-${item.productId}`}
      >
        <Trash2 className="h-5 w-5" />
      </Button>
    </div>
  );
}
