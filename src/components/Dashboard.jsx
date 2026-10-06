import { useEffect, useMemo, useRef, useState } from 'react';
import { getProducts, createProduct, updateProduct, deleteProduct, errorMessage } from '../api.js';
import Ember from './Ember.jsx';
import ProductModal from './ProductModal.jsx';
import ConfirmDialog from './ConfirmDialog.jsx';
import { Logo, CountUp, Ico, ThemeButton } from './Brand.jsx';
import { money, fmtDate, avatarHue, avatarInitial } from '../utils.js';

const SORTS = {
  newest: ['Newest first', (a, b) => b.id - a.id],
  oldest: ['Oldest first', (a, b) => a.id - b.id],
  name: ['Name A–Z', (a, b) => a.product_name.localeCompare(b.product_name)],
  priceHi: ['Price: high to low', (a, b) => b.price - a.price],
  priceLo: ['Price: low to high', (a, b) => a.price - b.price],
  stockLo: ['Stock: low to high', (a, b) => a.quantity - b.quantity],
};

const LOW = 5;   // display only: "running low" threshold for the badges and filters
const statusOf = (p) => { const q = Number(p.quantity); return q === 0 ? 'out' : q <= LOW ? 'low' : 'ok'; };
const stockLabel = (p) => (Number(p.quantity) === 0 ? 'Out of stock' : `${p.quantity} in stock`);
const greeting = () => { const h = new Date().getHours(); return h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening'; };
const FILTERS = [['all', 'All'], ['ok', 'Well stocked'], ['low', 'Running low'], ['out', 'Out of stock']];

export default function Dashboard({ user, dark, toggle, onLogout, notify }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [q, setQ] = useState('');
  const [sort, setSort] = useState('newest');
  const [filter, setFilter] = useState('all');
  const [view, setView] = useState('grid');          // 'grid' | 'list' (display only)
  const [editing, setEditing] = useState(undefined);   // undefined = closed, null = adding, object = editing
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [deleting, setDeleting] = useState(null);      // product awaiting confirmation
  const [delBusy, setDelBusy] = useState(false);
  const [mood, setMood] = useState({ moods: '', say: 'Got new stock to add?', aim: null });
  const addRef = useRef(null);
  const celebrate = useRef(null);

  const load = async (quiet) => {
    if (!quiet) setLoading(true);
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
  useEffect(() => () => clearTimeout(celebrate.current), []);

  const cheer = (say = 'Nice work!') => {
    clearTimeout(celebrate.current);
    setMood({ moods: 'is-joy is-rainbow', say, aim: null });
    celebrate.current = setTimeout(() => setMood({ moods: '', say: 'Got new stock to add?', aim: null }), 1900);
  };

  const save = async (payload) => {
    setSaving(true);
    setFormError('');
    try {
      if (editing) await updateProduct(editing.id, payload);
      else await createProduct(payload);
      const wasEdit = !!editing;
      setEditing(undefined);
      await load(true);
      notify(wasEdit ? 'Product updated.' : 'Product added.');
      cheer();
    } catch (err) {
      setFormError(errorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    setDelBusy(true);
    try {
      await deleteProduct(deleting.id);
      const name = deleting.product_name;
      setDeleting(null);
      await load(true);
      notify(`“${name}” deleted.`);
    } catch (err) {
      setDeleting(null);
      setError(errorMessage(err));
    } finally {
      setDelBusy(false);
    }
  };

  const openForm = (p) => { setFormError(''); setEditing(p); };

  const stats = useMemo(() => ({
    value: products.reduce((s, p) => s + Number(p.price) * Number(p.quantity), 0),
    count: products.length,
    units: products.reduce((s, p) => s + Number(p.quantity), 0),
  }), [products]);

  const counts = useMemo(() => {
    const c = { all: products.length, ok: 0, low: 0, out: 0 };
    products.forEach((p) => { c[statusOf(p)] += 1; });
    return c;
  }, [products]);
  const maxQty = useMemo(() => Math.max(1, ...products.map((p) => Number(p.quantity))), [products]);

  const shown = useMemo(() => {
    const t = q.trim().toLowerCase();
    let list = t ? products.filter((p) => (p.product_name + ' ' + (p.description || '')).toLowerCase().includes(t)) : products.slice();
    if (filter !== 'all') list = list.filter((p) => statusOf(p) === filter);
    return list.sort(SORTS[sort][1]);
  }, [products, q, sort, filter]);

  const barW = (p) => (Number(p.quantity) === 0 ? 0 : Math.max(6, (Number(p.quantity) / maxQty) * 100));

  // Ember reacts to what you hover in the table (delete -> worried, edit -> curious)
  const over = (e) => {
    const b = e.target.closest && e.target.closest('[data-act]');
    if (!b) return;
    if (b.dataset.act === 'delete') setMood({ moods: 'is-worried', say: 'Wait... really?!', aim: { el: b, xr: 0.5 } });
    else setMood({ moods: 'is-curious', say: 'Ooh, some tweaking?', aim: { el: b, xr: 0.5 } });
  };
  const out = (e) => {
    if (e.target.closest && e.target.closest('[data-act]') && !(e.relatedTarget && e.relatedTarget.closest && e.relatedTarget.closest('[data-act]')))
      setMood({ moods: '', say: 'Got new stock to add?', aim: null });
  };

  return (
    <div className="wrap dash">
      <nav className="topnav pill">
        <Logo />
        <span className="acts">
          <span className="who"><span className="av" style={{ width: 30, height: 30, '--h': avatarHue(user.username) }}>{avatarInitial(user.username)}</span>
            <span className="who-t"><b>{user.username}</b><small>{user.role}</small></span></span>
          <ThemeButton dark={dark} toggle={toggle} />
          <button className="btn sm outline" onClick={onLogout}><Ico n="out" s={15} />Logout</button>
        </span>
      </nav>

      <main>
        <section className="hello">
          <div className="hello-bg" aria-hidden="true" />
          <div className="hello-txt">
            <p className="hello-hi">{greeting()}, {user.username}</p>
            <h1 className="heading">Products</h1>
            <p className="mut">Keep your catalog clear, current, and ready for your next customer.</p>
          </div>
          <div className="cta-host">
            {!loading && products.length > 0 && <Ember perch="c" size={128} sink={0.06} sayLeft hideSmall moods={mood.moods} say={mood.say} aim={mood.aim} />}
            <button ref={addRef} className="btn big" onClick={() => openForm(null)}
              onPointerEnter={() => setMood({ moods: 'is-excited', say: 'Add something shiny!', aim: { el: addRef.current, xr: 0.5 } })}
              onPointerLeave={() => setMood({ moods: '', say: 'Got new stock to add?', aim: null })}><Ico n="plus" s={18} />Add product</button>
          </div>
        </section>

        <div className="stats-grid">
          <div className="kpi hero"><span className="stat-icon"><Ico n="wallet" s={22} /></span><div><strong><CountUp to={stats.value} decimals={2} prefix="₱" /></strong><small>Inventory value</small></div></div>
          <div className="kpi"><span className="stat-icon t-blue"><Ico n="boxes" s={22} /></span><div><strong><CountUp to={stats.count} /></strong><small>Total products</small></div></div>
          <div className="kpi"><span className="stat-icon t-green"><Ico n="layers" s={22} /></span><div><strong><CountUp to={stats.units} /></strong><small>Units in stock</small></div></div>
        </div>

        {error && (
          <div className="note risk row-note" role="alert"><Ico n="alert" s={18} /><span>{error}</span>
            <button className="btn sm outline" onClick={() => load()}><Ico n="refresh" s={14} />Retry</button></div>
        )}

        <section className="panel table-wrap" onPointerOver={over} onPointerOut={out}>
          {loading ? (
            <div className={'skeleton ' + view} aria-busy="true" aria-label="Loading products">{[0, 1, 2, 3, 4, 5].map((k) => <i key={k} style={{ animationDelay: k * 0.12 + 's' }} />)}</div>
          ) : products.length === 0 && !error ? (
            <div className="empty-state">
              <Ember size={230} say="It’s quiet in here..." autoFlick />
              <strong>Your catalog is empty</strong>
              <p className="mut">Add your first product to get started.</p>
              <button className="btn big" onClick={() => openForm(null)}><Ico n="plus" s={18} />Add product</button>
            </div>
          ) : products.length > 0 && (
            <>
              <div className="toolbar">
                <label className="search"><Ico n="search" s={16} /><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search products…" aria-label="Search products" /></label>
                <select className="sort" value={sort} onChange={(e) => setSort(e.target.value)} aria-label="Sort products">
                  {Object.entries(SORTS).map(([k, [l]]) => <option key={k} value={k}>{l}</option>)}
                </select>
                <div className="vt" role="group" aria-label="Layout" data-v={view}>
                  <button type="button" className={view === 'grid' ? 'on' : ''} onClick={() => setView('grid')} aria-pressed={view === 'grid'} aria-label="Grid view" title="Grid view"><Ico n="grid" s={17} /></button>
                  <button type="button" className={view === 'list' ? 'on' : ''} onClick={() => setView('list')} aria-pressed={view === 'list'} aria-label="List view" title="List view"><Ico n="list" s={17} /></button>
                </div>
              </div>
              <div className="hbar thin" role="img" aria-label={`${counts.ok} well stocked, ${counts.low} running low, ${counts.out} out of stock`}>
                <i className="ok" style={{ flexGrow: counts.ok }} /><i className="low" style={{ flexGrow: counts.low }} /><i className="out" style={{ flexGrow: counts.out }} />
              </div>
              <div className="fchips" role="group" aria-label="Filter by stock">
                {FILTERS.map(([k, l]) => (
                  <button type="button" key={k} className={'fchip ' + k + (filter === k ? ' on' : '')} onClick={() => setFilter(k)} aria-pressed={filter === k}>{l}<b>{counts[k]}</b></button>
                ))}
                <span className="mut count">{shown.length} of {products.length}</span>
              </div>

              {shown.length === 0 ? (
                <p className="no-match">{q.trim() ? <>No products match “{q}”.</> : 'No products in this view.'}</p>
              ) : view === 'grid' ? (
                <div className="pgrid">
                  {shown.map((p, i) => (
                    <article key={p.id} className={'pcard ' + statusOf(p)} data-tilt style={{ '--h': avatarHue(p.product_name), '--i': Math.min(i, 12) }}>
                      <div className="pc-cover">
                        <span className="pc-initial" aria-hidden="true">{avatarInitial(p.product_name)}</span>
                        <span className={'badge' + (statusOf(p) === 'out' ? ' out' : statusOf(p) === 'low' ? ' low' : '')}>{stockLabel(p)}</span>
                      </div>
                      <div className="pc-body">
                        <h3 className="product-name">{p.product_name}</h3>
                        <p className="pc-desc">{p.description || 'No description yet.'}</p>
                        <div className="pc-price"><strong className="price">₱{money(p.price)}</strong><small>Added {fmtDate(p.created_at)}</small></div>
                        <div className="sbar" title={`${p.quantity} units`}><i style={{ width: barW(p) + '%' }} /></div>
                      </div>
                      <div className="pc-actions">
                        <button data-act="edit" className="btn sm tonal" onClick={() => openForm(p)}><Ico n="pencil" s={14} />Edit</button>
                        <button data-act="delete" className="btn sm red" onClick={() => setDeleting(p)}><Ico n="trash" s={14} />Delete</button>
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="table-scroll">
                  <table className="table table-cards">
                    <thead><tr><th>Product</th><th>Price</th><th>Quantity</th><th>Created</th><th><span className="sr-only">Actions</span></th></tr></thead>
                    <tbody>
                      {shown.map((p, i) => (
                        <tr key={p.id} style={{ '--i': Math.min(i, 12) }}>
                          <td className="td-product"><div className="product-cell">
                            <span className="p-avatar sm" style={{ '--h': avatarHue(p.product_name) }} aria-hidden="true">{avatarInitial(p.product_name)}</span>
                            <div><div className="product-name">{p.product_name}</div><div className="description">{p.description}</div></div></div></td>
                          <td className="td-price price" data-label="Price">₱{money(p.price)}</td>
                          <td className="td-stock" data-label="Stock"><span className={'badge' + (statusOf(p) === 'out' ? ' out' : statusOf(p) === 'low' ? ' low' : '')}>{stockLabel(p)}</span><div className="sbar thin"><i style={{ width: barW(p) + '%' }} /></div></td>
                          <td className="td-date description" data-label="Created">{fmtDate(p.created_at)}</td>
                          <td className="td-actions"><div className="actions">
                            <button data-act="edit" className="btn sm tonal" onClick={() => openForm(p)}><Ico n="pencil" s={14} />Edit</button>
                            <button data-act="delete" className="btn sm red" onClick={() => setDeleting(p)}><Ico n="trash" s={14} />Delete</button>
                          </div></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </section>
      </main>

      {editing !== undefined && (
        <ProductModal key={editing ? editing.id : 'new'} product={editing} saving={saving} error={formError} onSave={save} onClose={() => setEditing(undefined)} />
      )}
      {deleting && (
        <ConfirmDialog title="Delete this product?" body={`“${deleting.product_name}” will be permanently removed from your catalog.`} action="Delete product"
          busy={delBusy} onConfirm={confirmDelete} onCancel={() => setDeleting(null)} />
      )}
    </div>
  );
}
