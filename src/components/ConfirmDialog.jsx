import { useEffect, useRef, useState } from 'react';
import Ember from './Ember.jsx';

// Delete confirmation. Ember gets nervous, begs when you hover "Delete", and relaxes when you hover "Cancel".
export default function ConfirmDialog({ title, body, action, busy, onConfirm, onCancel }) {
  const [hover, setHover] = useState('');
  const [, mounted] = useState(false);               // re-render once so Ember can aim at the buttons
  const okRef = useRef(null), noRef = useRef(null);

  useEffect(() => {
    mounted(true);
    noRef.current?.focus();
    const onKey = (e) => { if (e.key === 'Escape' && !busy) onCancel(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [busy, onCancel]);

  let moods = 'is-worried', say = 'Wait, are you sure?', aim = { el: okRef.current, xr: 0.5 };
  if (hover === 'ok') { moods = 'is-error'; say = 'Noooo!'; }
  if (hover === 'no') { moods = 'is-glad'; say = 'Phew, thank you!'; aim = { el: noRef.current, xr: 0.5 }; }

  return (
    <div className="scrim center" onMouseDown={(e) => { if (e.target === e.currentTarget && !busy) onCancel(); }}>
      <div className="modal-wrap narrow">
        <Ember perch="c" size={130} sink={0.08} moods={moods} say={say} aim={aim} hideSmall />
        <div className="alertbox" role="alertdialog" aria-modal="true" aria-labelledby="cd-title" aria-describedby="cd-body">
          <h3 id="cd-title">{title}</h3>
          <p id="cd-body">{body}</p>
          <div className="alert-btns">
            <button ref={noRef} className="ab" onClick={onCancel} disabled={busy}
              onPointerEnter={() => setHover('no')} onPointerLeave={() => setHover('')}>Cancel</button>
            <button ref={okRef} className="ab danger" onClick={onConfirm} disabled={busy}
              onPointerEnter={() => setHover('ok')} onPointerLeave={() => setHover('')}
              onFocus={() => setHover('ok')} onBlur={() => setHover('')}>{busy ? 'Deleting…' : action}</button>
          </div>
        </div>
      </div>
    </div>
  );
}
