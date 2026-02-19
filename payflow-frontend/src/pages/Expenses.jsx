import { useState, useEffect, useCallback } from 'react';
import { Plus } from 'lucide-react';
import ExpenseRow from '../components/ExpenseRow';
import AddExpenseModal from '../components/AddExpenseModal';
import SettleModal from '../components/SettleModal';
import { getExpensesByUser } from '../api/client';

const FILTERS = ['All', 'Pending', 'Settled'];

export default function Expenses({ currentUser }) {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const [showAdd, setShowAdd] = useState(false);
  const [settleTarget, setSettleTarget] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getExpensesByUser(currentUser);
      setExpenses(data || []);
    } catch {
      setExpenses([]);
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const filtered = expenses.filter((e) => {
    if (filter === 'All') return true;
    return e.status?.toUpperCase() === filter.toUpperCase();
  });

  const filterBtn = (label) => ({
    background: filter === label ? 'var(--accent)' : 'var(--bg-card)',
    color: filter === label ? '#fff' : 'var(--text-muted)',
    border: '1px solid var(--border)',
    borderRadius: 8,
    padding: '6px 16px',
    fontFamily: "'DM Sans', sans-serif",
    fontWeight: 600,
    fontSize: 13,
    cursor: 'pointer',
  });

  return (
    <div style={{ padding: '32px 36px', flex: 1, overflowY: 'auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: 'var(--text-primary)' }}>Expenses</h1>
        <button
          onClick={() => setShowAdd(true)}
          style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 9, padding: '9px 16px', fontFamily: "'DM Sans', sans-serif", fontWeight: 600, fontSize: 14, cursor: 'pointer' }}
        >
          <Plus size={15} /> Add Expense
        </button>
      </div>

      {/* Filter bar */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {FILTERS.map((f) => (
          <button key={f} style={filterBtn(f)} onClick={() => setFilter(f)}>{f}</button>
        ))}
      </div>

      {/* Expense list */}
      {loading ? (
        <p style={{ color: 'var(--text-muted)' }}>Loading…</p>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--text-muted)' }}>
          <p style={{ fontSize: 15 }}>No {filter !== 'All' ? filter.toLowerCase() + ' ' : ''}expenses found.</p>
        </div>
      ) : (
        filtered.map((exp) => (
          <ExpenseRow
            key={exp.id}
            expense={exp}
            currentUser={currentUser}
            onSettle={setSettleTarget}
          />
        ))
      )}

      {showAdd && (
        <AddExpenseModal
          onClose={() => setShowAdd(false)}
          onSuccess={fetchData}
          currentUser={currentUser}
        />
      )}

      {settleTarget && (
        <SettleModal
          expense={settleTarget}
          onConfirm={() => { setSettleTarget(null); fetchData(); }}
          onCancel={() => setSettleTarget(null)}
        />
      )}
    </div>
  );
}
