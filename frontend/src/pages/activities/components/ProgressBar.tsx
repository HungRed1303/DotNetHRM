interface ProgressBarProps {
  done: number;
  total: number;
}

export default function ProgressBar({ done, total }: ProgressBarProps) {
  const percent = total > 0 ? Math.round((done / total) * 100) : 0;

  return (
    <div className="progress-container">
      <div className="flex justify-between items-center" style={{ marginBottom: 'var(--spacing-2)' }}>
        <div>
          <span className="text-xs font-semibold text-secondary" style={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Tiến độ nhập liệu
          </span>
          <div className="text-xl font-bold text-primary" style={{ marginTop: 'var(--spacing-1)' }}>
            <span className="text-accent">{done}</span>
            <span className="text-muted" style={{ fontSize: 'var(--font-size-base)', margin: '0 var(--spacing-1)' }}>/</span>
            <span className="text-secondary">{total}</span>
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div className="text-xl font-bold text-accent">{percent}%</div>
          <div className="text-xs text-muted font-medium" style={{ marginTop: '2px' }}>hoàn thành</div>
        </div>
      </div>
      <div className="progress-bar">
        <div
          className="progress-fill"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
