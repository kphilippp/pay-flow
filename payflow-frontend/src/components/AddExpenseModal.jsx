import { useState } from 'react';
import { X } from 'lucide-react';
import toast from 'react-hot-toast';
import { createExpense, USERS, USER_COLORS } from '../api/client';

export default function AddExpenseModal({ onClose, onSuccess, currentUser }) {
  const [description, setDescription] = useState('');
  const [paidBy, setPaidBy] = useState(currentUser || USERS[0]);
  const [amount, setAmount] = useState('');
  const [splitWith, setSplitWith] = useState([currentUser || USERS[0]]);
  const [loading, setLoading] = useState(false);

  const perPerson = splitWith.length > 0 && parseFloat(amount) > 0
    ? (parseFloat(amount) / splitWith.length).toFixed(2)
    : null;

  const togglePerson = (person) => {
    setSplitWith((prev) =>
      prev.includes(person) ? prev.filter((p) => p !== person) : [...prev, person]
    );
  };

  const validate = () => {
    if (!description.trim()) { toast.error('Description is required'); return false; }
    if (!amount || parseFloat(amount) <= 0) { toast.error('Amount must be greater than 0'); return false; }
    if (splitWith.length < 2) { toast.error('Select at least 2 people to split with'); return false; }
    return true;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      await createExpense({ description, paidBy, totalAmount: parseFloat(amount), splitWith });
      const others = splitWith.filter((p) => p !== paidBy);
      toast.success(`${others.join(' and ')} each owe $${perPerson}`);
      onSuccess();
      onClose();
    } catch {
      toast.error('Failed to create expense');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: '100%',
    background: 'var(--bg-hover)',
    border: '1px solid var(--border)',
    borderRadius: 8,
    padding: '9px 12px',
    color: 'var(--text-primary)',
    fontFamily: "'DM Sans', sans-serif",
    fontSize: 14,
    outline: 'none',
    boxSizing: 'border-box',
  };

  const labelStyle = { color: 'var(--text-muted)', fontSize: 12, fontWeight: 500, display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14, padding: 28, width: 440, maxWidth: '95vw' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h2 style={{ margin: 0, color: 'var(--text-primary)', fontSize: 18, fontWeight: 600 }}>Add Expense</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 4 }}><X size={20} /></button>
        </div>

        {/* Description */}
        <div style={{ marginBottom: 16 }}>
          <label style={labelStyle}>Description</label>
          <input style={inputStyle} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="e.g. Torchy's Dinner" />
        </div>

        {/* Paid By */}
        <div style={{ marginBottom: 16 }}>
          <label style={labelStyle}>Paid By</label>
          <select style={inputStyle} value={paidBy} onChange={(e) => setPaidBy(e.target.value)}>
            {USERS.map((u) => <option key={u} value={u}>{u}</option>)}
          </select>
        </div>

        {/* Amount */}
        <div style={{ marginBottom: 16 }}>
          <label style={labelStyle}>Total Amount ($)</label>
          <input style={inputStyle} type="number" min="0.01" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" />
        </div>

        {/* Split With */}
        <div style={{ marginBottom: 20 }}>
          <label style={labelStyle}>Split With</label>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {USERS.map((u) => {
              const active = splitWith.includes(u);
              return (
                <button
                  key={u}
                  onClick={() => togglePerson(u)}
                  style={{
                    background: active ? USER_COLORS[u] : 'var(--bg-hover)',
                    color: active ? '#fff' : 'var(--text-muted)',
                    border: `1px solid ${active ? USER_COLORS[u] : 'var(--border)'}`,
                    borderRadius: 20,
                    padding: '5px 14px',
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: 'pointer',
                    fontFamily: "'DM Sans', sans-serif",
                  }}
                >
                  {u}
                </button>
              );
            })}
          </div>
        </div>

        {/* Live preview */}
        {perPerson && (
          <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 20, textAlign: 'center' }}>
            Each person owes <span style={{ color: 'var(--accent)', fontFamily: "'DM Mono', monospace", fontWeight: 600 }}>${perPerson}</span>
          </p>
        )}

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={loading}
          style={{
            width: '100%',
            background: loading ? 'var(--bg-hover)' : 'var(--accent)',
            color: '#fff',
            border: 'none',
            borderRadius: 9,
            padding: '11px 0',
            fontFamily: "'DM Sans', sans-serif",
            fontWeight: 600,
            fontSize: 15,
            cursor: loading ? 'not-allowed' : 'pointer',
          }}
        >
          {loading ? 'Adding…' : 'Add Expense'}
        </button>
      </div>
    </div>
  );
}
