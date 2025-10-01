import { useCart as useCartContext } from '@/context/CartContext';
import { Product } from '@shared/schema';
import { useToast } from '@/hooks/use-toast';

export function useCart() {
  const cartContext = useCartContext();
  const { toast } = useToast();

  const addProductToCart = (product: Product, quantity: number = 1) => {
    if (product.stock === 0) {
      toast({
        variant: "destructive",
        title: "Out of Stock",
        description: "This product is currently out of stock."
      });
      return;
    }

    if (quantity > product.stock) {
      toast({
        variant: "destructive",
        title: "Insufficient Stock",
        description: `Only ${product.stock} items available.`
      });
      return;
    }

    // TODO: Get shop information from API
    const cartItem = {
      productId: product.id,
      shopId: product.shopId,
      shopName: "Shop Name", // This should be fetched from the shop data
      title: product.title,
      price: product.price,
      quantity,
      image: product.images[0],
      stock: product.stock
    };

    cartContext.addItem(cartItem);
    
    toast({
      title: "Added to Cart",
      description: `${product.title} has been added to your cart.`
    });
  };

  return {
    ...cartContext,
    addProductToCart
  };
}
