import { useEffect, useState } from 'react';
import { getProducts, createProduct, updateProduct, deleteProduct, errorMessage } from '../api.js';
import ProductForm from './ProductForm.jsx';

const money = (n) => Number(n).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default function ProductList() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(undefined); // undefined = closed, null = adding, object = editing
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  const load = async () => {
    setError('');
    try {
      setProducts(await getProducts());
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const save = async (payload) => {
    setSaving(true);
    setFormError('');
    try {
      if (editing) await updateProduct(editing.id, payload);
      else await createProduct(payload);
      setEditing(undefined);
      await load();
    } catch (err) {
      setFormError(errorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const remove = async (p) => {
    if (!window.confirm(`Delete "${p.product_name}"?`)) return;
    try {
      await deleteProduct(p.id);
      await load();
    } catch (err) {
      setError(errorMessage(err));
    }
  };

  const openForm = (product) => { setFormError(''); setEditing(product); };

  return (
    <main>
      <div className="toolbar">
        <h2>Products</h2>
        <button className="btn btn-primary" onClick={() => openForm(null)}>+ Add product</button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="card table-wrap">
        {loading ? (
          <p className="empty">Loading…</p>
        ) : products.length === 0 ? (
          <p className="empty">No products yet. Click “Add product” to create one.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>ID</th><th>Name</th><th>Description</th>
                <th className="num">Price</th><th className="num">Qty</th><th>Created</th><th></th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id}>
                  <td>{p.id}</td>
                  <td>{p.product_name}</td>
                  <td className="desc">{p.description}</td>
                  <td className="num">{money(p.price)}</td>
                  <td className="num">{p.quantity}</td>
                  <td>{p.created_at}</td>
                  <td className="row-actions">
                    <button className="btn btn-small" onClick={() => openForm(p)}>Edit</button>
                    <button className="btn btn-small btn-danger" onClick={() => remove(p)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {editing !== undefined && (
        <ProductForm
          key={editing ? editing.id : 'new'}
          product={editing}
          saving={saving}
          error={formError}
          onSave={save}
          onCancel={() => setEditing(undefined)}
        />
      )}
    </main>
  );
}
