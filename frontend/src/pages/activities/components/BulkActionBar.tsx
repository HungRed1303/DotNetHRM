interface BulkActionBarProps {
  selected: number;
  onClearSelection: () => void;
  onBulkScore: () => void;
  onBulkRating: () => void;
  onBulkUpload: () => void;
}

export default function BulkActionBar({
  selected,
  onClearSelection,
  onBulkScore,
  onBulkRating,
  onBulkUpload,
}: BulkActionBarProps) {
  if (selected === 0) return null;

  return (
    <div className="bulk-action-bar">
      <div className="flex items-center gap-3">
        <div style={{
          width: '2rem',
          height: '2rem',
          backgroundColor: 'white',
          borderRadius: 'var(--radius-lg)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: 'var(--shadow-sm)'
        }}>
          <span style={{ color: 'var(--color-primary)', fontSize: 'var(--font-size-base)', fontWeight: 'var(--font-weight-bold)' }}>✓</span>
        </div>
        <span className="font-semibold text-white text-sm">
          Đã chọn <span className="font-bold">{selected}</span> nhân viên
        </span>
      </div>

      <div style={{ height: '2rem', width: '1px', backgroundColor: 'rgba(255,255,255,0.2)', margin: '0 var(--spacing-1)' }}></div>

      <button
        onClick={onBulkScore}
        className="btn"
        style={{ backgroundColor: 'white', color: 'var(--color-primary)', padding: 'var(--spacing-2) var(--spacing-4)' }}
      >
        Nhập điểm
      </button>
      <button
        onClick={onBulkRating}
        className="btn"
        style={{ backgroundColor: 'white', color: 'var(--color-primary)', padding: 'var(--spacing-2) var(--spacing-4)' }}
      >
        Gán đánh giá
      </button>
      <button
        onClick={onBulkUpload}
        className="btn"
        style={{ backgroundColor: 'white', color: 'var(--color-primary)', padding: 'var(--spacing-2) var(--spacing-4)' }}
      >
        Upload minh chứng
      </button>

      <button
        onClick={onClearSelection}
        className="font-semibold text-sm"
        style={{ 
          marginLeft: 'auto', 
          color: 'white', 
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          transition: 'color 0.2s'
        }}
        onMouseEnter={(e) => e.currentTarget.style.color = 'rgba(255,255,255,0.7)'}
        onMouseLeave={(e) => e.currentTarget.style.color = 'white'}
      >
        Hủy chọn
      </button>
    </div>
  );
}
