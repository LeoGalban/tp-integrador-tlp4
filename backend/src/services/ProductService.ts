import { HttpError } from "../errors/HttpError.ts";
import type {
  CreateProductData,
  IProductRepository,
  ProductData,
  UpdateProductData,
} from "../repositories/interfaces/IProductRepository.ts";
import type { ProductStatus } from "../types/product.ts";
import type { ISubject } from "../observer/ISubject.ts";

// Lógica de negocio de los productos (RF3).
// No conoce Express ni Sequelize: depende de interfaces.
export class ProductService {
  private readonly productRepository: IProductRepository;
  // El Subject del patrón Observer (en main.ts se le pasa un EventPublisher)
  private readonly eventPublisher: ISubject;

  constructor(productRepository: IProductRepository, eventPublisher: ISubject) {
    this.productRepository = productRepository;
    this.eventPublisher = eventPublisher;
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

  // Cambia el estado del producto (ej: DISPONIBLE → SIN_STOCK)
  // y avisa a los observers (patrón Observer).
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

    // Publicar el evento. ProductService no sabe quién lo escucha
    // (notificaciones, logs, etc.): solo conoce la interfaz ISubject.
    await this.eventPublisher.notify({
      productId: updated.id,
      productName: updated.name,
      previousStatus,
      newStatus: updated.status,
      changedAt: updated.updatedAt,
    });

    return updated;
  }

  async delete(id: number): Promise<void> {
    const deleted = await this.productRepository.delete(id);
    if (!deleted) {
      throw new HttpError(404, "El producto no existe");
    }
  }
}
