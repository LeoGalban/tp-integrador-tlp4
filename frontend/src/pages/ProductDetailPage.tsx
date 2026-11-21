import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import { getProduct, getSubscription, subscribe, unsubscribe } from "../api/products.api";
import { Can } from "../components/Can";
import { formatDate, formatPrice } from "../utils/format";
import type { Product } from "../types";

export function ProductDetailPage() {
  const params = useParams();
  const id = Number(params.id);

  const [product, setProduct] = useState<Product | null>(null);
  const [subscribed, setSubscribed] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  // Cargar el producto y si el usuario está suscripto (las dos cosas a la vez)
  useEffect(() => {
    Promise.all([getProduct(id), getSubscription(id)])
      .then(([productData, subscription]) => {
        setProduct(productData);
        setSubscribed(subscription.subscribed);
      })
      .catch((err: Error) => setError(err.message));
  }, [id]);

  async function toggleSubscription() {
    setBusy(true);
    setError("");
    try {
      const result = subscribed ? await unsubscribe(id) : await subscribe(id);
      setSubscribed(result.subscribed);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error");
    } finally {
      setBusy(false);
    }
  }

  if (error && !product) return <p className="container error">{error}</p>;
  if (!product) return <p className="container">Cargando…</p>;

  return (
    <div className="container">
      <p>
        <Link to="/products">← Volver al listado</Link>
      </p>
      <h1>{product.name}</h1>
      <p>
        <span className={`badge ${product.status}`}>{product.status}</span>
      </p>
      <p>{product.description || <em>Sin descripción</em>}</p>
      <p>
        <strong>Precio:</strong> {formatPrice(product.price)}
      </p>
      <p className="hint">
        Creado: {formatDate(product.createdAt)} · Actualizado: {formatDate(product.updatedAt)}
      </p>

      {/* Suscribirse / desuscribirse: cada botón exige su permiso */}
      <div className="actions">
        {subscribed ? (
          <Can permission="subscription:delete">
            <button onClick={toggleSubscription} disabled={busy}>
              Desuscribirme
            </button>
          </Can>
        ) : (
          <Can permission="subscription:create">
            <button onClick={toggleSubscription} disabled={busy}>
              Suscribirme a cambios de estado
            </button>
          </Can>
        )}
        {subscribed && <span className="hint">Vas a recibir una notificación cuando cambie el estado.</span>}
      </div>

      {error && <p className="error">{error}</p>}
    </div>
  );
}
