import { z } from "zod";

// User roles enum
export enum UserRole {
  CUSTOMER = "customer",
  SHOP_OWNER = "shop_owner",
  ADMIN = "admin"
}

// Order status enum
export enum OrderStatus {
  PROCESSING = "processing",
  ACCEPTED = "accepted",
  IN_TRANSIT = "in_transit",
  DELIVERED = "delivered",
  CANCELLED = "cancelled"
}

// Category enum
export enum ProductCategory {
  BOOKS = "books",
  ELECTRONICS = "electronics",
  STATIONERY = "stationery",
  FASHION = "fashion",
  SPORTS = "sports",
  OTHER = "other"
}

// User schema
export const userSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  phone: z.string().optional(),
  college: z.string().optional(),
  role: z.nativeEnum(UserRole),
  verified: z.boolean().default(false),
  createdAt: z.date(),
  updatedAt: z.date()
});

export const insertUserSchema = userSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

// Shop schema
export const shopSchema = z.object({
  id: z.string(),
  ownerId: z.string(),
  name: z.string(),
  description: z.string().optional(),
  address: z.string(),
  upiId: z.string(),
  verified: z.boolean().default(false),
  createdAt: z.date(),
  updatedAt: z.date()
});

export const insertShopSchema = shopSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

// Product schema
export const productSchema = z.object({
  id: z.string(),
  shopId: z.string(),
  title: z.string(),
  description: z.string(),
  price: z.number(),
  stock: z.number(),
  category: z.nativeEnum(ProductCategory),
  tags: z.array(z.string()).default([]),
  images: z.array(z.string()).default([]),
  ratingAvg: z.number().default(0),
  reviewCount: z.number().default(0),
  createdAt: z.date(),
  updatedAt: z.date()
});

export const insertProductSchema = productSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  ratingAvg: true,
  reviewCount: true
});

// Order item schema
export const orderItemSchema = z.object({
  productId: z.string(),
  name: z.string(),
  price: z.number(),
  quantity: z.number(),
  image: z.string().optional()
});

// Delivery address schema
export const deliveryAddressSchema = z.object({
  recipientName: z.string(),
  phone: z.string(),
  email: z.string(),
  addressLine1: z.string(),
  addressLine2: z.string().optional(),
  campusLocation: z.string(),
  postalCode: z.string().optional(),
  notes: z.string().optional()
});

// Order schema
export const orderSchema = z.object({
  id: z.string(),
  userId: z.string(),
  shopId: z.string(),
  items: z.array(orderItemSchema),
  subtotal: z.number(),
  tax: z.number().default(0),
  deliveryFee: z.number().default(50),
  total: z.number(),
  status: z.nativeEnum(OrderStatus).default(OrderStatus.PROCESSING),
  deliveryAddress: deliveryAddressSchema,
  paymentScreenshot: z.string().optional(),
  createdAt: z.date(),
  updatedAt: z.date()
});

export const insertOrderSchema = orderSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

// Review schema
export const reviewSchema = z.object({
  id: z.string(),
  productId: z.string(),
  userId: z.string(),
  orderId: z.string(),
  rating: z.number().min(1).max(5),
  comment: z.string().optional(),
  createdAt: z.date(),
  updatedAt: z.date()
});

export const insertReviewSchema = reviewSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

// Cart item schema (for local state)
export const cartItemSchema = z.object({
  productId: z.string(),
  shopId: z.string(),
  shopName: z.string(),
  title: z.string(),
  price: z.number(),
  quantity: z.number(),
  image: z.string().optional(),
  stock: z.number()
});

// Types
export type User = z.infer<typeof userSchema>;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Shop = z.infer<typeof shopSchema>;
export type InsertShop = z.infer<typeof insertShopSchema>;
export type Product = z.infer<typeof productSchema>;
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Order = z.infer<typeof orderSchema>;
export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type OrderItem = z.infer<typeof orderItemSchema>;
export type DeliveryAddress = z.infer<typeof deliveryAddressSchema>;
export type Review = z.infer<typeof reviewSchema>;
export type InsertReview = z.infer<typeof insertReviewSchema>;
export type CartItem = z.infer<typeof cartItemSchema>;
