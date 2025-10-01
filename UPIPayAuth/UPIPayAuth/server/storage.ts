import { 
  User, 
  InsertUser, 
  Shop, 
  InsertShop, 
  Product, 
  InsertProduct, 
  Order, 
  InsertOrder, 
  Review, 
  InsertReview,
  UserRole,
  OrderStatus,
  ProductCategory 
} from "@shared/schema";
import { MongoClient, Db, Collection, ObjectId } from "mongodb";
import { randomUUID } from "crypto";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<User>): Promise<User>;

  // Shop operations
  getShop(id: string): Promise<Shop | undefined>;
  getShopByOwner(ownerId: string): Promise<Shop | undefined>;
  getShops(filters?: { verified?: boolean }): Promise<Shop[]>;
  createShop(shop: InsertShop): Promise<Shop>;
  updateShop(id: string, updates: Partial<Shop>): Promise<Shop>;

  // Product operations
  getProduct(id: string): Promise<Product | undefined>;
  getProducts(filters?: { 
    shopId?: string; 
    category?: ProductCategory; 
    search?: string;
    featured?: boolean;
  }): Promise<Product[]>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: string, updates: Partial<Product>): Promise<Product>;
  deleteProduct(id: string): Promise<void>;

  // Order operations
  getOrder(id: string): Promise<Order | undefined>;
  getOrders(filters?: { 
    userId?: string; 
    shopId?: string; 
    status?: OrderStatus;
  }): Promise<Order[]>;
  createOrder(order: InsertOrder): Promise<Order>;
  updateOrderStatus(id: string, status: OrderStatus): Promise<Order>;

  // Review operations
  getReviewsForProduct(productId: string): Promise<Review[]>;
  createReview(review: InsertReview): Promise<Review>;
  updateProductRating(productId: string): Promise<void>;

  // Analytics
  getShopStats(shopId: string): Promise<{
    totalSales: number;
    totalOrders: number;
    totalProducts: number;
    averageRating: number;
    weeklyOrders: number;
    weeklyRevenue: number;
    weeklyProductsSold: number;
  }>;

  getAdminStats(): Promise<{
    totalUsers: number;
    activeShops: number;
    totalOrders: number;
    platformRevenue: number;
  }>;
}

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/campus-marketplace';
const client = new MongoClient(MONGODB_URI);
let db: Db;

// Initialize MongoDB connection
let dbInitPromise: Promise<Db> | null = null;

async function initDB() {
  if (!dbInitPromise) {
    dbInitPromise = (async () => {
      await client.connect();
      return client.db();
    })();
  }
  db = await dbInitPromise;
  return db;
}

export class MongoStorage implements IStorage {
  private async getUsersCollection(): Promise<Collection<User>> {
    const database = await initDB();
    return database.collection<User>('users');
  }

  private async getShopsCollection(): Promise<Collection<Shop>> {
    const database = await initDB();
    return database.collection<Shop>('shops');
  }

  private async getProductsCollection(): Promise<Collection<Product>> {
    const database = await initDB();
    return database.collection<Product>('products');
  }

  private async getOrdersCollection(): Promise<Collection<Order>> {
    const database = await initDB();
    return database.collection<Order>('orders');
  }

  private async getReviewsCollection(): Promise<Collection<Review>> {
    const database = await initDB();
    return database.collection<Review>('reviews');
  }

  async getUser(id: string): Promise<User | undefined> {
    const collection = await this.getUsersCollection();
    const user = await collection.findOne({ id });
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const collection = await this.getUsersCollection();
    const user = await collection.findOne({ email });
    return user || undefined;
  }

  async createUser(user: InsertUser): Promise<User> {
    const collection = await this.getUsersCollection();
    const id = randomUUID();
    const now = new Date();
    const newUser: User = {
      ...user,
      id,
      createdAt: now,
      updatedAt: now
    };
    
    await collection.insertOne(newUser);
    return newUser;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User> {
    const collection = await this.getUsersCollection();
    const updatedUser = { ...updates, updatedAt: new Date() };
    await collection.updateOne({ id }, { $set: updatedUser });
    
    const user = await collection.findOne({ id });
    if (!user) throw new Error('User not found after update');
    return user;
  }

  async getShop(id: string): Promise<Shop | undefined> {
    const collection = await this.getShopsCollection();
    const shop = await collection.findOne({ id });
    return shop || undefined;
  }

  async getShopByOwner(ownerId: string): Promise<Shop | undefined> {
    const collection = await this.getShopsCollection();
    const shop = await collection.findOne({ ownerId });
    return shop || undefined;
  }

  async getShops(filters?: { verified?: boolean }): Promise<Shop[]> {
    const collection = await this.getShopsCollection();
    const query: any = {};
    
    if (filters?.verified !== undefined) {
      query.verified = filters.verified;
    }

    const shops = await collection.find(query).sort({ createdAt: -1 }).toArray();
    return shops;
  }

  async createShop(shop: InsertShop): Promise<Shop> {
    const collection = await this.getShopsCollection();
    const id = randomUUID();
    const now = new Date();
    const newShop: Shop = {
      ...shop,
      id,
      createdAt: now,
      updatedAt: now
    };
    
    await collection.insertOne(newShop);
    return newShop;
  }

  async updateShop(id: string, updates: Partial<Shop>): Promise<Shop> {
    const collection = await this.getShopsCollection();
    const updatedShop = { ...updates, updatedAt: new Date() };
    await collection.updateOne({ id }, { $set: updatedShop });
    
    const shop = await collection.findOne({ id });
    if (!shop) throw new Error('Shop not found after update');
    return shop;
  }

  async getProduct(id: string): Promise<Product | undefined> {
    const collection = await this.getProductsCollection();
    const product = await collection.findOne({ id });
    return product || undefined;
  }

  async getProducts(filters?: { 
    shopId?: string; 
    category?: ProductCategory; 
    search?: string;
    featured?: boolean;
  }): Promise<Product[]> {
    const collection = await this.getProductsCollection();
    const query: any = {};

    if (filters?.shopId) {
      query.shopId = filters.shopId;
    }

    if (filters?.category) {
      query.category = filters.category;
    }

    let products = await collection.find(query).sort({ createdAt: -1 }).toArray();

    // Apply client-side filtering for search and featured
    if (filters?.search) {
      const searchTerm = filters.search.toLowerCase();
      products = products.filter(product => 
        product.title.toLowerCase().includes(searchTerm) ||
        product.description.toLowerCase().includes(searchTerm) ||
        (product.tags ?? []).some(tag => tag.toLowerCase().includes(searchTerm))
      );
    }

    if (filters?.featured) {
      // Return top-rated products for featured
      products = products
        .filter(p => p.reviewCount > 0)
        .sort((a, b) => b.ratingAvg - a.ratingAvg)
        .slice(0, 8);
    }

    return products;
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    const collection = await this.getProductsCollection();
    const id = randomUUID();
    const now = new Date();
    const newProduct: Product = {
      ...product,
      id,
      ratingAvg: 0,
      reviewCount: 0,
      createdAt: now,
      updatedAt: now
    };
    
    await collection.insertOne(newProduct);
    return newProduct;
  }

  async updateProduct(id: string, updates: Partial<Product>): Promise<Product> {
    const collection = await this.getProductsCollection();
    const updatedProduct = { ...updates, updatedAt: new Date() };
    await collection.updateOne({ id }, { $set: updatedProduct });
    
    const product = await collection.findOne({ id });
    if (!product) throw new Error('Product not found after update');
    return product;
  }

  async deleteProduct(id: string): Promise<void> {
    const collection = await this.getProductsCollection();
    await collection.deleteOne({ id });
  }

  async getOrder(id: string): Promise<Order | undefined> {
    const collection = await this.getOrdersCollection();
    const order = await collection.findOne({ id });
    return order || undefined;
  }

  async getOrders(filters?: { 
    userId?: string; 
    shopId?: string; 
    status?: OrderStatus;
  }): Promise<Order[]> {
    const collection = await this.getOrdersCollection();
    const query: any = {};

    if (filters?.userId) {
      query.userId = filters.userId;
    }

    if (filters?.shopId) {
      query.shopId = filters.shopId;
    }

    if (filters?.status) {
      query.status = filters.status;
    }

    const orders = await collection.find(query).sort({ createdAt: -1 }).toArray();
    return orders;
  }

  async createOrder(order: InsertOrder): Promise<Order> {
    const collection = await this.getOrdersCollection();
    const id = randomUUID();
    const now = new Date();
    const newOrder: Order = {
      ...order,
      id,
      createdAt: now,
      updatedAt: now
    };
    
    await collection.insertOne(newOrder);
    return newOrder;
  }

  async updateOrderStatus(id: string, status: OrderStatus): Promise<Order> {
    const collection = await this.getOrdersCollection();
    await collection.updateOne(
      { id }, 
      { $set: { status, updatedAt: new Date() } }
    );
    
    const order = await collection.findOne({ id });
    if (!order) throw new Error('Order not found after update');
    return order;
  }

  async getReviewsForProduct(productId: string): Promise<Review[]> {
    const collection = await this.getReviewsCollection();
    const reviews = await collection
      .find({ productId })
      .sort({ createdAt: -1 })
      .toArray();
    
    return reviews;
  }

  async createReview(review: InsertReview): Promise<Review> {
    const collection = await this.getReviewsCollection();
    const id = randomUUID();
    const now = new Date();
    const newReview: Review = {
      ...review,
      id,
      createdAt: now,
      updatedAt: now
    };
    
    await collection.insertOne(newReview);
    
    // Update product rating
    await this.updateProductRating(review.productId);
    
    return newReview;
  }

  async updateProductRating(productId: string): Promise<void> {
    const reviews = await this.getReviewsForProduct(productId);
    const productsCollection = await this.getProductsCollection();
    
    if (reviews.length === 0) {
      await productsCollection.updateOne(
        { id: productId },
        { $set: { ratingAvg: 0, reviewCount: 0 } }
      );
      return;
    }

    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = totalRating / reviews.length;

    await productsCollection.updateOne(
      { id: productId },
      { $set: { ratingAvg: averageRating, reviewCount: reviews.length } }
    );
  }

  async getShopStats(shopId: string): Promise<{
    totalSales: number;
    totalOrders: number;
    totalProducts: number;
    averageRating: number;
    weeklyOrders: number;
    weeklyRevenue: number;
    weeklyProductsSold: number;
  }> {
    const [orders, products] = await Promise.all([
      this.getOrders({ shopId }),
      this.getProducts({ shopId })
    ]);

    const totalSales = orders.reduce((sum, order) => sum + order.total, 0);
    const totalOrders = orders.length;
    const totalProducts = products.length;

    // Calculate average rating across all products
    const productsWithRatings = products.filter(p => p.reviewCount > 0);
    const averageRating = productsWithRatings.length > 0
      ? productsWithRatings.reduce((sum, p) => sum + p.ratingAvg, 0) / productsWithRatings.length
      : 0;

    // Weekly stats (last 7 days)
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    const weeklyOrders = orders.filter(order => order.createdAt >= oneWeekAgo);
    const weeklyRevenue = weeklyOrders.reduce((sum, order) => sum + order.total, 0);
    const weeklyProductsSold = weeklyOrders.reduce((sum, order) => 
      sum + order.items.reduce((itemSum, item) => itemSum + item.quantity, 0), 0
    );

    return {
      totalSales,
      totalOrders,
      totalProducts,
      averageRating,
      weeklyOrders: weeklyOrders.length,
      weeklyRevenue,
      weeklyProductsSold
    };
  }

  async getAdminStats(): Promise<{
    totalUsers: number;
    activeShops: number;
    totalOrders: number;
    platformRevenue: number;
  }> {
    const [usersCollection, shopsCollection, ordersCollection] = await Promise.all([
      this.getUsersCollection(),
      this.getShopsCollection(),
      this.getOrdersCollection()
    ]);

    const [totalUsers, activeShops, totalOrders, orders] = await Promise.all([
      usersCollection.countDocuments(),
      shopsCollection.countDocuments({ verified: true }),
      ordersCollection.countDocuments(),
      ordersCollection.find().toArray()
    ]);

    const platformRevenue = orders.reduce((sum, order) => sum + order.total, 0);

    return {
      totalUsers,
      activeShops,
      totalOrders,
      platformRevenue
    };
  }
}

export const storage = new MongoStorage();
