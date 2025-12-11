// Shared types for the Custom Printing E-commerce Platform

// Product types
export interface Product {
  id: string;
  name: string;
  description: string;
  basePrice: number;
  category: ProductCategory;
  variants: ProductVariant[];
  images: string[];
  createdAt: Date;
  updatedAt: Date;
}

export type ProductCategory = "t-shirt" | "mug" | "hoodie" | "poster" | "sticker" | "other";

export interface ProductVariant {
  id: string;
  name: string;
  priceModifier: number;
  available: boolean;
}

// Order types
export interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  total: number;
  status: OrderStatus;
  shippingAddress: Address;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderItem {
  productId: string;
  variantId: string;
  quantity: number;
  customizations?: Customization[];
  price: number;
}

export type OrderStatus = "pending" | "processing" | "shipped" | "delivered" | "cancelled";

// Customization types
export interface Customization {
  type: CustomizationType;
  value: string;
  position?: CustomizationPosition;
}

export type CustomizationType = "text" | "image" | "design";

export interface CustomizationPosition {
  x: number;
  y: number;
  width?: number;
  height?: number;
}

// Address types
export interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

// User types
export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: Date;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

