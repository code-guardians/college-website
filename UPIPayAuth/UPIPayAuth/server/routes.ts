import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { authenticateToken, requireRole, requireVerification } from "./middleware/auth";
import { 
  insertUserSchema, 
  insertShopSchema, 
  insertProductSchema, 
  insertOrderSchema, 
  insertReviewSchema,
  UserRole,
  OrderStatus,
  ProductCategory
} from "@shared/schema";


export async function registerRoutes(app: Express): Promise<Server> {
  // Auth endpoints
  app.post('/api/auth/user', async (req, res) => {
    try {
      const { uid, email, name, role = UserRole.CUSTOMER } = req.body;
      
      // Check if user already exists
      let user = await storage.getUser(uid);
      
      if (!user) {
        // Create new user
        const userData = insertUserSchema.parse({
          name: name || '',
          email,
          role,
          verified: email?.endsWith('.edu') || false
        });
        
        user = await storage.createUser({ ...userData });
        // Set the user ID to match Firebase UID
        user = await storage.updateUser(uid, { id: uid });
      }
      
      res.json(user);
    } catch (error) {
      console.error('User creation error:', error);
      res.status(400).json({ message: 'Failed to create user' });
    }
  });

  // User endpoints
  app.get('/api/users/:id', authenticateToken, async (req, res) => {
    try {
      const user = await storage.getUser(req.params.id);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: 'Failed to get user' });
    }
  });

  // Shop endpoints
  app.get('/api/shops', async (req, res) => {
    try {
      const { verified } = req.query;
      const shops = await storage.getShops({ 
        verified: verified === 'true' ? true : verified === 'false' ? false : undefined 
      });
      res.json(shops);
    } catch (error) {
      res.status(500).json({ message: 'Failed to get shops' });
    }
  });

  app.get('/api/shops/:id', async (req, res) => {
    try {
      const shop = await storage.getShop(req.params.id);
      if (!shop) {
        return res.status(404).json({ message: 'Shop not found' });
      }
      res.json(shop);
    } catch (error) {
      res.status(500).json({ message: 'Failed to get shop' });
    }
  });

  app.post('/api/shops', authenticateToken, async (req, res) => {
    try {
      const shopData = insertShopSchema.parse({
        ...req.body,
        ownerId: req.user!.id
      });
      
      const shop = await storage.createShop(shopData);
      
      // Update user role to shop_owner
      await storage.updateUser(req.user!.id, { role: UserRole.SHOP_OWNER });
      
      res.status(201).json(shop);
    } catch (error) {
      console.error('Shop creation error:', error);
      res.status(400).json({ message: 'Failed to create shop' });
    }
  });

  app.patch('/api/shops/:id', authenticateToken, requireRole([UserRole.ADMIN]), async (req, res) => {
    try {
      const shop = await storage.updateShop(req.params.id, req.body);
      res.json(shop);
    } catch (error) {
      res.status(400).json({ message: 'Failed to update shop' });
    }
  });

  // Product endpoints
  app.get('/api/products', async (req, res) => {
    try {
      const { shopId, category, search, featured } = req.query;
      const products = await storage.getProducts({
        shopId: shopId as string,
        category: category as ProductCategory,
        search: search as string,
        featured: featured === 'true'
      });
      res.json(products);
    } catch (error) {
      res.status(500).json({ message: 'Failed to get products' });
    }
  });

  app.get('/api/products/featured', async (req, res) => {
    try {
      const products = await storage.getProducts({ featured: true });
      res.json(products);
    } catch (error) {
      res.status(500).json({ message: 'Failed to get featured products' });
    }
  });

  app.get('/api/products/:id', async (req, res) => {
    try {
      const product = await storage.getProduct(req.params.id);
      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
      }
      res.json(product);
    } catch (error) {
      res.status(500).json({ message: 'Failed to get product' });
    }
  });

  app.post('/api/products', authenticateToken, requireRole([UserRole.SHOP_OWNER]), async (req, res) => {
    try {
      // Get user's shop
      const shop = await storage.getShopByOwner(req.user!.id);
      if (!shop) {
        return res.status(400).json({ message: 'Shop not found' });
      }

      const productData = insertProductSchema.parse({
        ...req.body,
        shopId: shop.id
      });
      
      const product = await storage.createProduct(productData);
      res.status(201).json(product);
    } catch (error) {
      console.error('Product creation error:', error);
      res.status(400).json({ message: 'Failed to create product' });
    }
  });

  app.patch('/api/products/:id', authenticateToken, requireRole([UserRole.SHOP_OWNER]), async (req, res) => {
    try {
      const product = await storage.getProduct(req.params.id);
      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
      }

      const shop = await storage.getShopByOwner(req.user!.id);
      if (!shop || product.shopId !== shop.id) {
        return res.status(403).json({ message: 'Not authorized to update this product' });
      }

      const updatedProduct = await storage.updateProduct(req.params.id, req.body);
      res.json(updatedProduct);
    } catch (error) {
      res.status(400).json({ message: 'Failed to update product' });
    }
  });

  app.delete('/api/products/:id', authenticateToken, requireRole([UserRole.SHOP_OWNER]), async (req, res) => {
    try {
      const product = await storage.getProduct(req.params.id);
      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
      }

      const shop = await storage.getShopByOwner(req.user!.id);
      if (!shop || product.shopId !== shop.id) {
        return res.status(403).json({ message: 'Not authorized to delete this product' });
      }

      await storage.deleteProduct(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: 'Failed to delete product' });
    }
  });

  // Order endpoints
  app.get('/api/orders', authenticateToken, requireRole([UserRole.CUSTOMER, UserRole.SHOP_OWNER, UserRole.ADMIN]), async (req, res) => {
    try {
      let orders;
      
      if (req.user!.role === UserRole.CUSTOMER) {
        orders = await storage.getOrders({ userId: req.user!.id });
      } else if (req.user!.role === UserRole.SHOP_OWNER) {
        const shop = await storage.getShopByOwner(req.user!.id);
        if (!shop) {
          return res.status(400).json({ message: 'Shop not found' });
        }
        orders = await storage.getOrders({ shopId: shop.id });
      } else if (req.user!.role === UserRole.ADMIN) {
        orders = await storage.getOrders();
      } else {
        return res.status(403).json({ message: 'Not authorized' });
      }
      
      res.json(orders);
    } catch (error) {
      res.status(500).json({ message: 'Failed to get orders' });
    }
  });

  app.get('/api/shop/orders', authenticateToken, requireRole([UserRole.SHOP_OWNER]), async (req, res) => {
    try {
      const shop = await storage.getShopByOwner(req.user!.id);
      if (!shop) {
        return res.status(400).json({ message: 'Shop not found' });
      }
      
      const orders = await storage.getOrders({ shopId: shop.id });
      res.json(orders);
    } catch (error) {
      res.status(500).json({ message: 'Failed to get shop orders' });
    }
  });

  app.post('/api/orders', authenticateToken, requireRole([UserRole.CUSTOMER]), async (req, res) => {
    try {
      const orderData = insertOrderSchema.parse({
        ...req.body,
        userId: req.user!.id
      });
      
      const order = await storage.createOrder(orderData);
      res.status(201).json(order);
    } catch (error) {
      console.error('Order creation error:', error);
      res.status(400).json({ message: 'Failed to create order' });
    }
  });

  app.patch('/api/orders/:id/status', authenticateToken, requireRole([UserRole.SHOP_OWNER]), async (req, res) => {
    try {
      const { status } = req.body;
      
      const order = await storage.getOrder(req.params.id);
      if (!order) {
        return res.status(404).json({ message: 'Order not found' });
      }

      const shop = await storage.getShopByOwner(req.user!.id);
      if (!shop || order.shopId !== shop.id) {
        return res.status(403).json({ message: 'Not authorized to update this order' });
      }

      const updatedOrder = await storage.updateOrderStatus(req.params.id, status);
      res.json(updatedOrder);
    } catch (error) {
      res.status(400).json({ message: 'Failed to update order status' });
    }
  });

  // Review endpoints
  app.get('/api/products/:id/reviews', async (req, res) => {
    try {
      const reviews = await storage.getReviewsForProduct(req.params.id);
      res.json(reviews);
    } catch (error) {
      res.status(500).json({ message: 'Failed to get reviews' });
    }
  });

  app.post('/api/reviews', authenticateToken, requireRole([UserRole.CUSTOMER]), async (req, res) => {
    try {
      const reviewData = insertReviewSchema.parse({
        ...req.body,
        userId: req.user!.id
      });
      
      const review = await storage.createReview(reviewData);
      res.status(201).json(review);
    } catch (error) {
      console.error('Review creation error:', error);
      res.status(400).json({ message: 'Failed to create review' });
    }
  });

  // Analytics endpoints
  app.get('/api/shop/stats', authenticateToken, requireRole([UserRole.SHOP_OWNER]), async (req, res) => {
    try {
      const shop = await storage.getShopByOwner(req.user!.id);
      if (!shop) {
        return res.status(400).json({ message: 'Shop not found' });
      }
      
      const stats = await storage.getShopStats(shop.id);
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: 'Failed to get shop stats' });
    }
  });

  app.get('/api/admin/stats', authenticateToken, requireRole([UserRole.ADMIN]), async (req, res) => {
    try {
      const stats = await storage.getAdminStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: 'Failed to get admin stats' });
    }
  });

  app.get('/api/admin/shops/pending', authenticateToken, requireRole([UserRole.ADMIN]), async (req, res) => {
    try {
      const shops = await storage.getShops({ verified: false });
      res.json(shops);
    } catch (error) {
      res.status(500).json({ message: 'Failed to get pending shops' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
