import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { createProduct, getProduct, updateProduct } from "../api/products.api";

// Formulario para CREAR (/products/new) o EDITAR (/products/:id/edit) un producto.
// Si en la URL hay un id, es edición.
export function ProductFormPage() {
  const params = useParams();
  const editingId = params.id ? Number(params.id) : null;
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("0");
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);

  // En modo edición, cargar los datos actuales del producto
  useEffect(() => {
    if (editingId === null) return;
    getProduct(editingId)
      .then((product) => {
        setName(product.name);
        setDescription(product.description);
        setPrice(String(product.price));
      })
      .catch((err: Error) => setError(err.message));
  }, [editingId]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");
    setSending(true);
    try {
      const data = { name, description, price: Number(price) };
      const saved =
        editingId === null ? await createProduct(data) : await updateProduct(editingId, data);
      navigate(`/products/${saved.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="container narrow">
      <p>
        <Link to={editingId === null ? "/products" : `/products/${editingId}`}>← Volver</Link>
      </p>
      <h1>{editingId === null ? "Nuevo producto" : "Editar producto"}</h1>
      <form onSubmit={handleSubmit} className="form">
        <label>
          Nombre
          <input value={name} onChange={(e) => setName(e.target.value)} required />
        </label>
        <label>
          Descripción
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} />
        </label>
        <label>
          Precio
          <input
            type="number"
            min="0"
            step="0.01"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            required
          />
        </label>
        {error && <p className="error">{error}</p>}
        <button type="submit" disabled={sending}>
          {sending ? "Guardando…" : "Guardar"}
        </button>
      </form>
    </div>
  );
}
