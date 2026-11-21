import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import {
  changeProductStatus,
  deleteProduct,
  getProduct,
  getSubscription,
  subscribe,
  unsubscribe,
} from "../api/products.api";
import { Can } from "../components/Can";
import { formatDate, formatPrice } from "../utils/format";
import { PRODUCT_STATUSES } from "../types";
import type { Product, ProductStatus } from "../types";

export function ProductDetailPage() {
  const params = useParams();
  const id = Number(params.id);
  const navigate = useNavigate();

  const [product, setProduct] = useState<Product | null>(null);
  const [subscribed, setSubscribed] = useState(false);
  const [newStatus, setNewStatus] = useState<ProductStatus>("DISPONIBLE");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  // Cargar el producto y si el usuario está suscripto (las dos cosas a la vez)
  useEffect(() => {
    Promise.all([getProduct(id), getSubscription(id)])
      .then(([productData, subscription]) => {
        setProduct(productData);
        setNewStatus(productData.status);
        setSubscribed(subscription.subscribed);
      })
      .catch((err: Error) => setError(err.message));
  }, [id]);

  // Ejecuta una acción mostrando "ocupado" y capturando el error
  async function run(action: () => Promise<void>) {
    setBusy(true);
    setError("");
    setMessage("");
    try {
      await action();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error");
    } finally {
      setBusy(false);
    }
  }

  function toggleSubscription() {
    return run(async () => {
      const result = subscribed ? await unsubscribe(id) : await subscribe(id);
      setSubscribed(result.subscribed);
    });
  }

  function handleChangeStatus() {
    return run(async () => {
      const updated = await changeProductStatus(id, newStatus);
      setProduct(updated);
      setMessage(`Estado cambiado a ${updated.status}. Se notificó a los suscriptores.`);
    });
  }

  function handleDelete() {
    if (!window.confirm("¿Seguro que querés eliminar este producto?")) return;
    return run(async () => {
      await deleteProduct(id);
      navigate("/products");
    });
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

      {/* Cambio de estado: solo admin y operador */}
      <Can permission="producto:change-status">
        <div className="actions">
          <select value={newStatus} onChange={(e) => setNewStatus(e.target.value as ProductStatus)}>
            {PRODUCT_STATUSES.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
          <button onClick={handleChangeStatus} disabled={busy || newStatus === product.status}>
            Cambiar estado
          </button>
        </div>
      </Can>

      <div className="actions">
        <Can permission="producto:update">
          <Link to={`/products/${id}/edit`} className="button secondary">
            Editar
          </Link>
        </Can>
        <Can permission="producto:delete">
          <button className="danger" onClick={handleDelete} disabled={busy}>
            Eliminar
          </button>
        </Can>
      </div>

      {message && <p>{message}</p>}
      {error && <p className="error">{error}</p>}
    </div>
  );
}
