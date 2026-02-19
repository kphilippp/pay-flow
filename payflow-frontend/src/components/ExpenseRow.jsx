import { useState } from 'react';
import { ChevronDown, ChevronUp, CheckCircle } from 'lucide-react';
import { USER_COLORS } from '../api/client';

export default function ExpenseRow({ expense, currentUser, onSettle }) {
  const [expanded, setExpanded] = useState(false);

  const share = expense.totalAmount / (expense.splitWith?.length || 1);
  const isPending = expense.status === 'PENDING';
  const canSettle = currentUser === expense.paidBy && isPending;

  return (
    <div
      style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: 10,
        marginBottom: 8,
        overflow: 'hidden',
      }}
    >
      {/* Main row */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          padding: '14px 18px',
          cursor: 'pointer',
          gap: 12,
        }}
        onClick={() => setExpanded((e) => !e)}
      >
        {/* Avatar chip */}
        <span
          style={{
            background: USER_COLORS[expense.paidBy] || 'var(--accent)',
            color: '#fff',
            borderRadius: 20,
            padding: '2px 10px',
            fontSize: 12,
            fontWeight: 600,
            whiteSpace: 'nowrap',
          }}
        >
          {expense.paidBy}
        </span>

        {/* Description */}
        <span style={{ flex: 1, color: 'var(--text-primary)', fontWeight: 500 }}>
          {expense.description}
        </span>

        {/* Amount */}
        <span style={{ fontFamily: "'DM Mono', monospace", color: 'var(--text-primary)', marginRight: 12 }}>
          ${expense.totalAmount?.toFixed(2)}
        </span>

        {/* Status badge */}
        {isPending ? (
          <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--yellow)', fontSize: 12, fontWeight: 600 }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--yellow)', display: 'inline-block' }} />
            PENDING
          </span>
        ) : (
          <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--green)', fontSize: 12, fontWeight: 600 }}>
            <CheckCircle size={13} />
            SETTLED
          </span>
        )}

        {/* Expand icon */}
        <span style={{ color: 'var(--text-muted)', marginLeft: 8 }}>
          {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </span>
      </div>

      {/* Expanded breakdown */}
      {expanded && (
        <div style={{ borderTop: '1px solid var(--border)', padding: '12px 18px', background: 'var(--bg-hover)' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: 12, margin: '0 0 8px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Split breakdown
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
            {expense.splitWith?.map((person) => (
              <span key={person} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--text-primary)' }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: USER_COLORS[person] || 'var(--accent)' }} />
                {person} — <span style={{ fontFamily: "'DM Mono', monospace" }}>${share.toFixed(2)}</span>
              </span>
            ))}
          </div>

          {canSettle && (
            <button
              onClick={(e) => { e.stopPropagation(); onSettle(expense); }}
              style={{
                background: 'var(--accent)',
                color: '#fff',
                border: 'none',
                borderRadius: 8,
                padding: '6px 16px',
                fontFamily: "'DM Sans', sans-serif",
                fontWeight: 600,
                fontSize: 13,
                cursor: 'pointer',
              }}
            >
              Mark as Settled
            </button>
          )}
        </div>
      )}
    </div>
  );
}
