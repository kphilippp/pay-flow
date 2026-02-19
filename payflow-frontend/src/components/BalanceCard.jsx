import { useState, useEffect } from 'react';

export default function BalanceCard({ title, amount, type }) {
  const [displayed, setDisplayed] = useState(0);

  useEffect(() => {
    const target = Math.abs(amount || 0);
    const duration = 800;
    const steps = 40;
    const increment = target / steps;
    let current = 0;
    let step = 0;

    const timer = setInterval(() => {
      step++;
      current = Math.min(current + increment, target);
      setDisplayed(current);
      if (step >= steps) clearInterval(timer);
    }, duration / steps);

    return () => clearInterval(timer);
  }, [amount]);

  const color =
    type === 'positive' ? 'var(--green)' :
    type === 'negative' ? 'var(--red)' :
    'var(--text-primary)';

  const glow =
    type === 'positive' ? '0 0 12px rgba(34,197,94,0.25)' :
    type === 'negative' ? '0 0 12px rgba(239,68,68,0.2)' :
    'none';

  return (
    <div
      style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: 12,
        padding: '20px 24px',
        flex: 1,
        minWidth: 160,
        boxShadow: glow,
      }}
    >
      <p style={{ color: 'var(--text-muted)', fontSize: 12, fontWeight: 500, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
        {title}
      </p>
      <p style={{ color, fontSize: 28, fontWeight: 500, fontFamily: "'DM Mono', monospace", margin: 0 }}>
        ${displayed.toFixed(2)}
      </p>
    </div>
  );
}
