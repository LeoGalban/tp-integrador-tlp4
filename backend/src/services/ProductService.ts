import { HttpError } from "../errors/HttpError.ts";
import type {
  CreateProductData,
  IProductRepository,
  ProductData,
  UpdateProductData,
} from "../repositories/interfaces/IProductRepository.ts";
import type { ProductStatus } from "../types/product.ts";

// Lógica de negocio de los productos (RF3).
// No conoce Express ni Sequelize: depende de la interfaz IProductRepository.
export class ProductService {
  private readonly productRepository: IProductRepository;

  constructor(productRepository: IProductRepository) {
    this.productRepository = productRepository;
  }

  list(): Promise<ProductData[]> {
    return this.productRepository.findAll();
  }

  async getById(id: number): Promise<ProductData> {
    const product = await this.productRepository.findById(id);
    if (!product) {
      throw new HttpError(404, "El producto no existe");
    }
    return product;
  }

  create(data: CreateProductData): Promise<ProductData> {
    return this.productRepository.create(data);
  }

  async update(id: number, data: UpdateProductData): Promise<ProductData> {
    const updated = await this.productRepository.update(id, data);
    if (!updated) {
      throw new HttpError(404, "El producto no existe");
    }
    return updated;
  }

  // Cambia el estado del producto (ej: DISPONIBLE → SIN_STOCK).
  // Es el evento que, más adelante, dispara las notificaciones a los suscriptores.
  async changeStatus(id: number, newStatus: ProductStatus): Promise<ProductData> {
    const product = await this.getById(id); // lanza 404 si no existe
    const previousStatus = product.status;

    if (previousStatus === newStatus) {
      throw new HttpError(400, `El producto ya está en estado ${newStatus}`);
    }

    const updated = await this.productRepository.updateStatus(id, newStatus);
    if (!updated) {
      throw new HttpError(404, "El producto no existe");
    }
    return updated;
  }

  async delete(id: number): Promise<void> {
    const deleted = await this.productRepository.delete(id);
    if (!deleted) {
      throw new HttpError(404, "El producto no existe");
    }
  }
}
