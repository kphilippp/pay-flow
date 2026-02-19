import { useState, useEffect, useCallback } from 'react';
import BalanceCard from '../components/BalanceCard';
import ExpenseRow from '../components/ExpenseRow';
import SettleModal from '../components/SettleModal';
import { getBalanceForUser, getExpensesByUser, USERS, USER_COLORS } from '../api/client';

export default function Dashboard({ currentUser, setCurrentUser }) {
  const [balances, setBalances] = useState({});
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [settleTarget, setSettleTarget] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [bal, exps] = await Promise.all([
        getBalanceForUser(currentUser),
        getExpensesByUser(currentUser),
      ]);
      setBalances(bal || {});
      setExpenses(exps || []);
    } catch {
      setBalances({});
      setExpenses([]);
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const positiveTotal = Object.values(balances).filter((v) => v > 0).reduce((a, b) => a + b, 0);
  const negativeTotal = Math.abs(Object.values(balances).filter((v) => v < 0).reduce((a, b) => a + b, 0));
  const netBalance = positiveTotal - negativeTotal;

  const recent = [...expenses].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5);

  const sectionLabel = { color: 'var(--text-muted)', fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', margin: '0 0 12px' };

  return (
    <div style={{ padding: '32px 36px', flex: 1, overflowY: 'auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
        <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: 'var(--text-primary)' }}>Dashboard</h1>
        <select
          value={currentUser}
          onChange={(e) => setCurrentUser(e.target.value)}
          style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, padding: '8px 12px', color: 'var(--text-primary)', fontFamily: "'DM Sans', sans-serif", fontSize: 14, cursor: 'pointer' }}
        >
          {USERS.map((u) => <option key={u} value={u}>{u}</option>)}
        </select>
      </div>

      {loading ? (
        <p style={{ color: 'var(--text-muted)' }}>Loading…</p>
      ) : (
        <>
          {/* Balance cards */}
          <div style={{ display: 'flex', gap: 16, marginBottom: 32, flexWrap: 'wrap' }}>
            <BalanceCard title="You're Owed" amount={positiveTotal} type="positive" />
            <BalanceCard title="You Owe" amount={negativeTotal} type="negative" />
            <BalanceCard title="Net Balance" amount={Math.abs(netBalance)} type={netBalance >= 0 ? 'positive' : 'negative'} />
          </div>

          {/* Who owes who */}
          {Object.keys(balances).length > 0 && (
            <div style={{ marginBottom: 32 }}>
              <p style={sectionLabel}>Who Owes Who</p>
              {Object.entries(balances).map(([person, amount]) => amount !== 0 && (
                <div
                  key={person}
                  style={{ display: 'flex', alignItems: 'center', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, padding: '12px 16px', marginBottom: 8, gap: 12 }}
                >
                  <span style={{ width: 10, height: 10, borderRadius: '50%', background: USER_COLORS[person] || 'var(--accent)' }} />
                  <span style={{ flex: 1, color: 'var(--text-primary)', fontSize: 14 }}>
                    {amount > 0 ? <><strong>{person}</strong> owes you</> : <>You owe <strong>{person}</strong></>}
                  </span>
                  <span style={{ fontFamily: "'DM Mono', monospace", color: amount > 0 ? 'var(--green)' : 'var(--red)', fontSize: 14 }}>
                    ${Math.abs(amount).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Recent expenses */}
          <div>
            <p style={sectionLabel}>Recent Expenses</p>
            {recent.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>No expenses yet.</p>
            ) : (
              recent.map((exp) => (
                <ExpenseRow
                  key={exp.id}
                  expense={exp}
                  currentUser={currentUser}
                  onSettle={setSettleTarget}
                />
              ))
            )}
          </div>
        </>
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
