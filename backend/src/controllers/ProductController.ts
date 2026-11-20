import type { Request, Response } from "express";
import { HttpError } from "../errors/HttpError.ts";
import type { ProductService } from "../services/ProductService.ts";
import type { UpdateProductData } from "../repositories/interfaces/IProductRepository.ts";
import { PRODUCT_STATUSES, isProductStatus } from "../types/product.ts";
import {
  getBody,
  optionalNonNegativeNumber,
  optionalString,
  parseId,
  requireString,
} from "../utils/validation.ts";

// Controller de productos: valida la entrada y responde. La lógica está en ProductService.
export class ProductController {
  private readonly productService: ProductService;

  constructor(productService: ProductService) {
    this.productService = productService;
  }

  // GET /api/products
  list = async (req: Request, res: Response) => {
    res.json(await this.productService.list());
  };

  // GET /api/products/:id
  getById = async (req: Request, res: Response) => {
    const id = parseId(req.params.id, "id");
    res.json(await this.productService.getById(id));
  };

  // POST /api/products   body: { name, description?, price? }
  create = async (req: Request, res: Response) => {
    const body = getBody(req.body);
    const product = await this.productService.create({
      name: requireString(body, "name"),
      description: optionalString(body, "description") ?? "",
      price: optionalNonNegativeNumber(body, "price") ?? 0,
    });
    res.status(201).json(product);
  };

  // PUT /api/products/:id   body: cualquiera de { name, description, price }
  update = async (req: Request, res: Response) => {
    const id = parseId(req.params.id, "id");
    const body = getBody(req.body);

    const data: UpdateProductData = {};
    if (body.name !== undefined) data.name = requireString(body, "name");
    const description = optionalString(body, "description");
    if (description !== undefined) data.description = description;
    const price = optionalNonNegativeNumber(body, "price");
    if (price !== undefined) data.price = price;

    if (Object.keys(data).length === 0) {
      throw new HttpError(400, "Indicá al menos un campo para modificar (name, description o price)");
    }

    res.json(await this.productService.update(id, data));
  };

  // PATCH /api/products/:id/status   body: { "status": "SIN_STOCK" }
  changeStatus = async (req: Request, res: Response) => {
    const id = parseId(req.params.id, "id");
    const { status } = getBody(req.body);

    if (!isProductStatus(status)) {
      throw new HttpError(400, `El estado debe ser uno de: ${PRODUCT_STATUSES.join(", ")}`);
    }

    res.json(await this.productService.changeStatus(id, status));
  };

  // DELETE /api/products/:id
  delete = async (req: Request, res: Response) => {
    const id = parseId(req.params.id, "id");
    await this.productService.delete(id);
    res.status(204).send(); // 204: borrado, sin contenido para devolver
  };
}
