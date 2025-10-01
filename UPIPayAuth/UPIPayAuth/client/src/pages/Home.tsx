import { Link } from "wouter";
import { Book, Laptop, PenTool, Shirt, Dumbbell, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import ProductCard from "@/components/ProductCard";
import { useQuery } from "@tanstack/react-query";
import { Product, ProductCategory } from "@shared/schema";

const categories = [
  { name: "Books", icon: Book, category: ProductCategory.BOOKS },
  { name: "Electronics", icon: Laptop, category: ProductCategory.ELECTRONICS },
  { name: "Stationery", icon: PenTool, category: ProductCategory.STATIONERY },
  { name: "Fashion", icon: Shirt, category: ProductCategory.FASHION },
  { name: "Sports", icon: Dumbbell, category: ProductCategory.SPORTS },
  { name: "Other", icon: Package, category: ProductCategory.OTHER },
];

export default function Home() {
  const { data: featuredProducts = [] } = useQuery<Product[]>({
    queryKey: ["/api/products/featured"],
  });

  const handleAddToCart = (product: Product) => {
    // TODO: Implement cart functionality
    console.log("Add to cart:", product);
  };

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground">
        <div className="container px-4 py-16 md:px-6">
          <div className="grid gap-8 lg:grid-cols-2 items-center">
            <div className="space-y-6">
              <h1 className="text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl">
                Your Campus Marketplace
              </h1>
              <p className="text-xl text-primary-foreground/90 max-w-md">
                Buy and sell with fellow students. From textbooks to gadgets, find everything you need on campus.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/products">
                  <Button 
                    size="lg"
                    className="bg-background text-primary hover:bg-background/90"
                    data-testid="button-start-shopping"
                  >
                    Start Shopping
                  </Button>
                </Link>
                <Link href="/auth">
                  <Button 
                    size="lg"
                    variant="outline"
                    className="border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/10"
                    data-testid="button-sell-items"
                  >
                    Sell Your Items
                  </Button>
                </Link>
              </div>
            </div>
            <div className="lg:flex justify-end">
              <div className="w-full max-w-md h-80 bg-primary-foreground/10 rounded-xl flex items-center justify-center">
                <span className="text-primary-foreground/60">Campus Shopping Illustration</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="container px-4 md:px-6 py-8">
        <h2 className="text-3xl font-bold text-center mb-8">Shop by Category</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map((category) => {
            const Icon = category.icon;
            return (
              <Link key={category.category} href={`/products?category=${category.category}`}>
                <Card className="group cursor-pointer hover:shadow-lg transition-all duration-200 hover:-translate-y-1" data-testid={`card-category-${category.category}`}>
                  <CardContent className="p-6 text-center">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg mx-auto mb-3 flex items-center justify-center">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="font-semibold text-sm">{category.name}</h3>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Featured Products */}
      <section className="container px-4 md:px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold">Popular Products</h2>
          <Link href="/products">
            <Button variant="ghost" className="text-primary hover:text-primary/80 font-semibold" data-testid="button-view-all">
              View All →
            </Button>
          </Link>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onAddToCart={handleAddToCart}
            />
          ))}
        </div>
      </section>

      {/* How It Works Section */}
      <section className="bg-muted py-16">
        <div className="container px-4 md:px-6">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-primary-foreground font-bold text-xl">1</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Browse Products</h3>
              <p className="text-muted-foreground">
                Explore products from verified student and local shops on campus.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-primary-foreground font-bold text-xl">2</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Add to Cart</h3>
              <p className="text-muted-foreground">
                Add items from multiple shops to your cart for convenient checkout.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-primary-foreground font-bold text-xl">3</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Pay & Receive</h3>
              <p className="text-muted-foreground">
                Pay securely with UPI and get your items delivered on campus.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
