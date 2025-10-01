import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Home from "@/pages/Home";
import ProductCatalog from "@/pages/ProductCatalog";
import ProductDetail from "@/pages/ProductDetail";
import Cart from "@/pages/Cart";
import Checkout from "@/pages/Checkout";
import Auth from "@/pages/Auth";
import CustomerDashboard from "@/pages/CustomerDashboard";
import ShopDashboard from "@/pages/ShopDashboard";
import AdminConsole from "@/pages/AdminConsole";
import NotFound from "@/pages/not-found";
import { useAuth } from "@/hooks/use-auth";

function AuthenticatedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Auth />;
  }

  return <>{children}</>;
}

function Router() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/products" component={ProductCatalog} />
          <Route path="/products/:id" component={ProductDetail} />
          <Route path="/cart" component={Cart} />
          <Route path="/auth" component={Auth} />
          
          {/* Protected Routes */}
          <Route path="/checkout">
            <AuthenticatedRoute>
              <Checkout />
            </AuthenticatedRoute>
          </Route>
          
          <Route path="/dashboard">
            <AuthenticatedRoute>
              <CustomerDashboard />
            </AuthenticatedRoute>
          </Route>
          
          <Route path="/shop">
            <AuthenticatedRoute>
              <ShopDashboard />
            </AuthenticatedRoute>
          </Route>
          
          <Route path="/admin">
            <AuthenticatedRoute>
              <AdminConsole />
            </AuthenticatedRoute>
          </Route>
          
          {/* Fallback */}
          <Route component={NotFound} />
        </Switch>
      </main>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
