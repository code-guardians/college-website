import { Link } from "wouter";

export default function Footer() {
  return (
    <footer className="bg-muted border-t">
      <div className="container px-4 md:px-6 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-lg">C</span>
              </div>
              <span className="font-bold text-xl">Campus Marketplace</span>
            </div>
            <p className="text-muted-foreground mb-4">
              Your trusted campus community for buying and selling student essentials.
            </p>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4">For Students</h3>
            <ul className="space-y-2 text-muted-foreground">
              <li><Link href="/products" className="hover:text-foreground">Browse Products</Link></li>
              <li><Link href="/how-to-buy" className="hover:text-foreground">How to Buy</Link></li>
              <li><Link href="/safety" className="hover:text-foreground">Safety Guidelines</Link></li>
              <li><Link href="/deals" className="hover:text-foreground">Student Deals</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4">For Sellers</h3>
            <ul className="space-y-2 text-muted-foreground">
              <li><Link href="/sell" className="hover:text-foreground">Start Selling</Link></li>
              <li><Link href="/seller-guidelines" className="hover:text-foreground">Seller Guidelines</Link></li>
              <li><Link href="/verification" className="hover:text-foreground">Shop Verification</Link></li>
              <li><Link href="/seller-support" className="hover:text-foreground">Seller Support</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4">Support</h3>
            <ul className="space-y-2 text-muted-foreground">
              <li><Link href="/help" className="hover:text-foreground">Help Center</Link></li>
              <li><Link href="/contact" className="hover:text-foreground">Contact Us</Link></li>
              <li><Link href="/terms" className="hover:text-foreground">Terms of Service</Link></li>
              <li><Link href="/privacy" className="hover:text-foreground">Privacy Policy</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t mt-8 pt-8 text-center text-muted-foreground">
          <p>&copy; 2024 Campus Marketplace. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
