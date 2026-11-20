import type { ProductStatus } from "../../types/product.ts";

// Datos de un producto tal como los usa el resto de la aplicación
export interface ProductData {
  id: number;
  name: string;
  description: string;
  price: number;
  status: ProductStatus;
  createdAt: Date;
  updatedAt: Date;
}

// Datos para crear un producto (el estado arranca en DISPONIBLE)
export interface CreateProductData {
  name: string;
  description: string;
  price: number;
}

// Datos para editar: todos opcionales (solo se cambia lo que llega).
// El estado NO se edita acá: tiene su propio método (cambio de estado).
export type UpdateProductData = Partial<CreateProductData>;

// Contrato del repositorio de productos
export interface IProductRepository {
  findAll(): Promise<ProductData[]>;
  findById(id: number): Promise<ProductData | null>;
  create(data: CreateProductData): Promise<ProductData>;
  update(id: number, data: UpdateProductData): Promise<ProductData | null>;
  updateStatus(id: number, status: ProductStatus): Promise<ProductData | null>;
  delete(id: number): Promise<boolean>;
}
