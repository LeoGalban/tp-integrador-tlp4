import { useEffect, useState } from "react";
import { Link } from "react-router";
import { getProducts } from "../api/products.api";
import { formatPrice } from "../utils/format";
import type { Product } from "../types";

export function ProductListPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getProducts()
      .then(setProducts)
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="container">Cargando productos…</p>;
  if (error) return <p className="container error">{error}</p>;

  return (
    <div className="container">
      <h1>Productos</h1>

      {products.length === 0 ? (
        <p>Todavía no hay productos cargados.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Nombre</th>
              <th>Precio</th>
              <th>Estado</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id}>
                <td>{product.id}</td>
                <td>{product.name}</td>
                <td>{formatPrice(product.price)}</td>
                <td>
                  <span className={`badge ${product.status}`}>{product.status}</span>
                </td>
                <td>
                  <Link to={`/products/${product.id}`}>Ver detalle</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
