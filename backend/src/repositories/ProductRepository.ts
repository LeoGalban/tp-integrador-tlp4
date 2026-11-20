import { Product } from "../models/index.ts";
import type { ProductStatus } from "../types/product.ts";
import type {
  CreateProductData,
  IProductRepository,
  ProductData,
  UpdateProductData,
} from "./interfaces/IProductRepository.ts";

// Implementación del repositorio de productos usando Sequelize.
// Es el único lugar que toca el modelo Product.
export class ProductRepository implements IProductRepository {
  async findAll(): Promise<ProductData[]> {
    const products = await Product.findAll({ order: [["id", "ASC"]] });
    return products.map((product) => this.toProductData(product));
  }

  async findById(id: number): Promise<ProductData | null> {
    const product = await Product.findByPk(id);
    return product ? this.toProductData(product) : null;
  }

  async create(data: CreateProductData): Promise<ProductData> {
    const product = await Product.create(data);
    return this.toProductData(product);
  }

  async update(id: number, data: UpdateProductData): Promise<ProductData | null> {
    const product = await Product.findByPk(id);
    if (!product) {
      return null;
    }
    await product.update(data); // también actualiza updatedAt
    return this.toProductData(product);
  }

  async updateStatus(id: number, status: ProductStatus): Promise<ProductData | null> {
    const product = await Product.findByPk(id);
    if (!product) {
      return null;
    }
    await product.update({ status });
    return this.toProductData(product);
  }

  async delete(id: number): Promise<boolean> {
    const deletedRows = await Product.destroy({ where: { id } });
    return deletedRows > 0;
  }

  // Convierte el modelo de Sequelize en un objeto simple
  private toProductData(product: Product): ProductData {
    return {
      id: product.id,
      name: product.name,
      description: product.description,
      price: product.price,
      status: product.status,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    };
  }
}
