// Tipos de los datos que devuelve la API del backend

export interface User {
  id: number;
  name: string;
  email: string;
  roleId: number;
  roleName: string;
  permissions: string[];
}

export interface AuthResponse {
  token: string;
  user: User;
}

export const PRODUCT_STATUSES = ["DISPONIBLE", "SIN_STOCK", "DISCONTINUADO"] as const;
export type ProductStatus = (typeof PRODUCT_STATUSES)[number];

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  status: ProductStatus;
  createdAt: string; // en JSON las fechas llegan como texto
  updatedAt: string;
}

export interface ProductInput {
  name: string;
  description: string;
  price: number;
}

export interface Role {
  id: number;
  name: string;
  permissions: string[];
}

export interface AppNotification {
  id: number;
  productId: number;
  productName: string;
  previousStatus: ProductStatus;
  newStatus: ProductStatus;
  message: string;
  read: boolean;
  createdAt: string;
}
