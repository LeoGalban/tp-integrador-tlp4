import { apiFetch } from "./client";
import type { Product, ProductInput, ProductStatus } from "../types";

export function getProducts(): Promise<Product[]> {
  return apiFetch<Product[]>("/products");
}

export function getProduct(id: number): Promise<Product> {
  return apiFetch<Product>(`/products/${id}`);
}

export function createProduct(data: ProductInput): Promise<Product> {
  return apiFetch<Product>("/products", { method: "POST", body: data });
}

export function updateProduct(id: number, data: ProductInput): Promise<Product> {
  return apiFetch<Product>(`/products/${id}`, { method: "PUT", body: data });
}

export function changeProductStatus(id: number, status: ProductStatus): Promise<Product> {
  return apiFetch<Product>(`/products/${id}/status`, { method: "PATCH", body: { status } });
}

export function deleteProduct(id: number): Promise<void> {
  return apiFetch<void>(`/products/${id}`, { method: "DELETE" });
}

// ---- Suscripciones ----

interface SubscriptionStatus {
  subscribed: boolean;
}

export function getSubscription(productId: number): Promise<SubscriptionStatus> {
  return apiFetch<SubscriptionStatus>(`/products/${productId}/subscription`);
}

export function subscribe(productId: number): Promise<SubscriptionStatus> {
  return apiFetch<SubscriptionStatus>(`/products/${productId}/subscription`, { method: "POST" });
}

export function unsubscribe(productId: number): Promise<SubscriptionStatus> {
  return apiFetch<SubscriptionStatus>(`/products/${productId}/subscription`, { method: "DELETE" });
}
