import { useEffect, useRef, useState } from 'react';
import Ember from './Ember.jsx';
import { Ico } from './Brand.jsx';
import { money, avatarHue, avatarInitial } from '../utils.js';

// Add (product = null) and Edit (product = existing row) in one modal, with the first activity's live preview card.
export default function ProductModal({ product, saving, error, onSave, onClose }) {
  const editing = !!product;
  const [form, setForm] = useState(
    product
      ? { product_name: product.product_name, description: product.description ?? '', price: String(product.price), quantity: String(product.quantity) }
      : { product_name: '', description: '', price: '', quantity: '' }
  );
  const [focus, setFocus] = useState('');
  const [tick, setTick] = useState(0);
  const [localErr, setLocalErr] = useState('');
  const refs = { product_name: useRef(null), description: useRef(null), price: useRef(null), quantity: useRef(null) };
  const set = (k) => (e) => { setForm({ ...form, [k]: e.target.value }); setTick((t) => t + 1); setLocalErr(''); };
  const bump = () => setTick((t) => t + 1);

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape' && !saving) onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [saving, onClose]);

  const submit = (e) => {
    e.preventDefault();
    const price = Number(form.price), qty = Number(form.quantity);
    if (!form.product_name.trim()) return setLocalErr('Product name is required.');
    if (form.price === '' || !(price >= 0)) return setLocalErr('Price must be a number, 0 or more.');
    if (form.quantity === '' || !Number.isInteger(qty) || qty < 0) return setLocalErr('Quantity must be a whole number, 0 or more.');
    onSave({ product_name: form.product_name.trim(), description: form.description.trim(), price, quantity: qty });
  };

  // ---- Ember (watches you fill in the form) ----
  const qtyRaw = form.quantity.trim(), qty = parseInt(qtyRaw, 10), price = parseFloat(form.price);
  const zero = qtyRaw !== '' && qty === 0;
  const good = !zero && qtyRaw !== '' && qty > 0 && price > 0;
  const textFocus = focus === 'product_name' || focus === 'description';
  let moods = '', say = editing ? 'Tweaking something?' : 'What are we selling today?', aim = null;
  if (textFocus) { aim = { el: refs[focus].current, caret: true }; say = 'Ooh, tell me more...'; if (form[focus]) moods = 'is-user'; }
  else if (focus === 'price' || focus === 'quantity') aim = { el: refs[focus].current, xr: 0.3 };
  if (zero) { moods += ' is-worried'; say = 'No stock? Oh no...'; }
  else if (good) { moods += ' is-glad'; say = 'Looking good!'; }
  if (saving) { moods = 'is-joy'; say = 'Saving it!'; aim = null; }
  if (error || localErr) { moods = (moods + ' is-error').trim(); say = 'Hmm, something’s off.'; }

  const bind = (name) => ({ onFocus: () => setFocus(name), onBlur: () => setFocus((x) => (x === name ? '' : x)) });
  const name = form.product_name.trim(), desc = form.description.trim();

  return (
    <div className="scrim" onMouseDown={(e) => { if (e.target === e.currentTarget && !saving) onClose(); }}>
      <div className="modal-wrap">
        <Ember perch="c" size={150} sink={0.08} hideSmall moods={moods} say={say} aim={aim} aimTick={tick} />
        <form className="sheet modal" role="dialog" aria-modal="true" aria-labelledby="pm-title" onSubmit={submit} noValidate>
          <div className="sheet-head">
            <h2 id="pm-title">{editing ? 'Edit product' : 'Add product'}</h2>
            <button type="button" className="icon sm" onClick={onClose} aria-label="Close"><Ico n="x" s={16} /></button>
          </div>
          {(error || localErr) && <div className="note risk" role="alert">{localErr || error}</div>}

          <div className="pm-grid">
            <div className="pm-fields">
              <label><span>Product name</span>
                <input ref={refs.product_name} value={form.product_name} onChange={set('product_name')} {...bind('product_name')} maxLength={100} autoFocus
                  onKeyUp={bump} onClick={bump} />
              </label>
              <label><span>Description <span className="hint">(optional)</span></span>
                <textarea ref={refs.description} rows={3} value={form.description} onChange={set('description')} {...bind('description')} onKeyUp={bump} onClick={bump} />
              </label>
              <div className="two">
                <label><span>Price <span className="hint">(PHP)</span></span>
                  <span className="prefixed"><i aria-hidden="true">₱</i>
                    <input ref={refs.price} type="number" min="0" step="0.01" inputMode="decimal" value={form.price} onChange={set('price')} {...bind('price')} />
                  </span>
                </label>
                <label><span>Quantity</span>
                  <input ref={refs.quantity} type="number" min="0" step="1" inputMode="numeric" value={form.quantity} onChange={set('quantity')} {...bind('quantity')} />
                </label>
              </div>
            </div>

            <aside className="preview" aria-label="Live preview" style={{ '--h': avatarHue(name) }}>
              <p className="preview-title">Live preview</p>
              <span className="p-avatar" aria-hidden="true">{avatarInitial(name)}</span>
              <h3 className={'preview-name' + (name ? '' : ' ph')}>{name || 'Product name'}</h3>
              <p className={'preview-desc' + (desc ? '' : ' ph')}>{desc || 'Your description will appear here.'}</p>
              <div className="preview-foot">
                <span className="preview-price">₱{money(form.price || 0)}</span>
                {qtyRaw === '' ? <span className="badge neutral">Set quantity</span>
                  : <span className={'badge' + (qty === 0 ? ' out' : '')}>{Number.isNaN(qty) ? 0 : qty} in stock</span>}
              </div>
            </aside>
          </div>

          <div className="actions end">
            <button type="button" className="btn outline" onClick={onClose} disabled={saving}>Cancel</button>
            <button className="btn" disabled={saving}><Ico n={editing ? 'pencil' : 'plus'} s={16} />{saving ? 'Saving…' : editing ? 'Save changes' : 'Create product'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
