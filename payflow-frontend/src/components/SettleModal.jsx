import { useState } from 'react';
import { settleExpense } from '../api/client';
import toast from 'react-hot-toast';

export default function SettleModal({ expense, onConfirm, onCancel }) {
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await settleExpense(expense.id);
      toast.success(`"${expense.description}" marked as settled`);
      onConfirm();
    } catch {
      toast.error('Failed to settle expense');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14, padding: 28, width: 380, maxWidth: '95vw', textAlign: 'center' }}>
        <h2 style={{ margin: '0 0 8px', color: 'var(--text-primary)', fontSize: 18 }}>Settle Up</h2>
        <p style={{ color: 'var(--text-muted)', margin: '0 0 6px', fontSize: 14 }}>
          "{expense.description}"
        </p>
        <p style={{ color: 'var(--text-primary)', fontFamily: "'DM Mono', monospace", fontSize: 22, margin: '0 0 16px' }}>
          ${expense.totalAmount?.toFixed(2)}
        </p>
        <p style={{ color: 'var(--text-muted)', fontSize: 13, margin: '0 0 24px' }}>
          Are you sure you want to mark this as settled?
        </p>
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={onCancel}
            style={{ flex: 1, background: 'var(--bg-hover)', color: 'var(--text-primary)', border: '1px solid var(--border)', borderRadius: 9, padding: '10px 0', fontFamily: "'DM Sans', sans-serif", fontWeight: 600, fontSize: 14, cursor: 'pointer' }}
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={loading}
            style={{ flex: 1, background: 'var(--green)', color: '#fff', border: 'none', borderRadius: 9, padding: '10px 0', fontFamily: "'DM Sans', sans-serif", fontWeight: 600, fontSize: 14, cursor: loading ? 'not-allowed' : 'pointer' }}
          >
            {loading ? 'Settling…' : 'Confirm'}
          </button>
        </div>
      </div>
    </div>
  );
}
