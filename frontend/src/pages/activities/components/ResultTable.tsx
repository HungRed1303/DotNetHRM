import { FileText, Paperclip } from "lucide-react";

export interface ParticipantResult {
  id: string;
  name: string;
  code: string;
  score: number | null;
  rank: number | null;
  rating: string;
  hasEvidence: boolean;
  completed: boolean;
}

interface ResultTableProps {
  participants: ParticipantResult[];
  selectedIds: string[];
  onSelectChange: (id: string, checked: boolean) => void;
  onSelectAll: (checked: boolean) => void;
  onScoreChange: (id: string, score: number) => void;
  onRatingChange: (id: string, rating: string) => void;
  onRankChange: (id: string, rank: number) => void;
  onUploadEvidence: (id: string) => void;
}

export default function ResultTable({
  participants,
  selectedIds,
  onSelectChange,
  onSelectAll,
  onScoreChange,
  onRatingChange,
  onRankChange,
  onUploadEvidence,
}: ResultTableProps) {
  const allSelected = participants.length > 0 && selectedIds.length === participants.length;
  const someSelected = selectedIds.length > 0 && !allSelected;

  return (
    <div className="card" style={{ overflow: 'hidden' }}>
      <div style={{ overflowX: 'auto' }}>
        <table className="data-table">
          <thead style={{ position: 'sticky', top: 0 }}>
            <tr>
              <th style={{ width: '2.5rem', textAlign: 'left' }}>
                <input
                  type="checkbox"
                  checked={allSelected}
                  ref={(el) => {
                    if (el) el.indeterminate = someSelected;
                  }}
                  onChange={(e) => onSelectAll(e.target.checked)}
                  style={{ width: '1rem', height: '1rem', accentColor: 'var(--color-primary)' }}
                />
              </th>
              <th style={{ textAlign: 'left' }}>Nhân viên</th>
              <th style={{ width: '7rem', textAlign: 'center' }}>Điểm số</th>
              <th style={{ width: '11rem', textAlign: 'left' }}>Đánh giá</th>
              <th style={{ width: '7rem', textAlign: 'center' }}>Thứ hạng</th>
              <th style={{ width: '4rem', textAlign: 'center' }}>MC</th>
            </tr>
          </thead>
          <tbody>
            {participants.map((participant) => (
              <ResultRow
                key={participant.id}
                participant={participant}
                isSelected={selectedIds.includes(participant.id)}
                onSelectChange={onSelectChange}
                onScoreChange={onScoreChange}
                onRatingChange={onRatingChange}
                onRankChange={onRankChange}
                onUploadEvidence={onUploadEvidence}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

interface ResultRowProps {
  participant: ParticipantResult;
  isSelected: boolean;
  onSelectChange: (id: string, checked: boolean) => void;
  onScoreChange: (id: string, score: number) => void;
  onRatingChange: (id: string, rating: string) => void;
  onRankChange: (id: string, rank: number) => void;
  onUploadEvidence: (id: string) => void;
}

function ResultRow({
  participant,
  isSelected,
  onSelectChange,
  onScoreChange,
  onRatingChange,
  onRankChange,
  onUploadEvidence,
}: ResultRowProps) {
  const getRatingBadge = (rating: string) => {
    const badges: Record<string, { bg: string; text: string }> = {
      "Xuất sắc": { bg: "bg-green-600", text: "text-white" },
      "Tốt": { bg: "bg-indigo-600", text: "text-white" },
      "Trung bình": { bg: "bg-yellow-500", text: "text-white" },
      "Cần cải thiện": { bg: "bg-gray-600", text: "text-white" },
    };
    return badges[rating] || { bg: "bg-gray-100", text: "text-gray-600" };
  };

  const getRankBadge = (rank: number | null) => {
    if (rank === 1) return { text: "1st", class: "bg-yellow-500 text-white" };
    if (rank === 2) return { text: "2nd", class: "bg-gray-700 text-white" };
    if (rank === 3) return { text: "3rd", class: "bg-orange-500 text-white" };
    return null;
  };

  const badge = getRatingBadge(participant.rating);
  const rankBadge = getRankBadge(participant.rank);

  return (
    <tr>
      <td>
        <input
          type="checkbox"
          checked={isSelected}
          onChange={(e) => onSelectChange(participant.id, e.target.checked)}
          style={{ width: '1rem', height: '1rem', accentColor: 'var(--color-primary)' }}
        />
      </td>
      <td>
        <div className="flex items-center" style={{ gap: 'var(--spacing-3)' }}>
          <div style={{
            width: '2rem',
            height: '2rem',
            backgroundColor: 'var(--color-primary-light)',
            borderRadius: 'var(--radius-lg)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <span className="text-xs font-bold text-accent">
              {participant.code.substring(0, 3).toUpperCase()}
            </span>
          </div>
          <div>
            <div className="text-sm font-semibold text-primary">{participant.name}</div>
            <div style={{ marginTop: '2px' }}>
              <span className="badge badge-primary" style={{ letterSpacing: '0.025em' }}>
                {participant.code}
              </span>
            </div>
          </div>
          {participant.completed && (
            <span className="badge badge-success">
              Hoàn thành
            </span>
          )}
        </div>
      </td>
      <td>
        <input
          type="number"
          min="0"
          max="100"
          value={participant.score ?? ""}
          onChange={(e) => onScoreChange(participant.id, Number(e.target.value))}
          placeholder="0-100"
          className="input-field font-semibold text-primary"
          style={{ textAlign: 'center', padding: 'var(--spacing-2) var(--spacing-3)' }}
        />
      </td>
      <td>
        <select
          value={participant.rating}
          onChange={(e) => onRatingChange(participant.id, e.target.value)}
          className="input-field font-semibold"
          style={{ 
            padding: 'var(--spacing-2) var(--spacing-3)',
            backgroundColor: badge.bg,
            color: badge.text
          }}
        >
          <option value="" style={{ backgroundColor: 'var(--color-bg-card)', color: 'var(--color-text-primary)' }}>---</option>
          <option value="Xuất sắc" style={{ backgroundColor: 'var(--color-bg-card)', color: 'var(--color-text-primary)' }}>Xuất sắc</option>
          <option value="Tốt" style={{ backgroundColor: 'var(--color-bg-card)', color: 'var(--color-text-primary)' }}>Tốt</option>
          <option value="Trung bình" style={{ backgroundColor: 'var(--color-bg-card)', color: 'var(--color-text-primary)' }}>Trung bình</option>
          <option value="Cần cải thiện" style={{ backgroundColor: 'var(--color-bg-card)', color: 'var(--color-text-primary)' }}>Cần cải thiện</option>
        </select>
      </td>
      <td>
        <div className="flex items-center" style={{ justifyContent: 'center', gap: 'var(--spacing-2)' }}>
          <select
            value={participant.rank ?? ""}
            onChange={(e) => onRankChange(participant.id, Number(e.target.value))}
            className="input-field font-bold text-primary"
            style={{ 
              width: '4rem', 
              padding: 'var(--spacing-2)',
              textAlign: 'center'
            }}
          >
            <option value="">-</option>
            {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
          {rankBadge && (
            <span className="badge text-xs font-bold" style={{ 
              backgroundColor: rankBadge.class.includes('yellow') ? '#eab308' : rankBadge.class.includes('gray') ? '#6b7280' : '#f97316',
              color: 'white',
              borderRadius: 'var(--radius-md)',
              padding: 'var(--spacing-1) var(--spacing-2)'
            }}>
              {rankBadge.text}
            </span>
          )}
        </div>
      </td>
      <td style={{ textAlign: 'center' }}>
        <button
          onClick={() => onUploadEvidence(participant.id)}
          style={{
            padding: 'var(--spacing-2)',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            borderRadius: 'var(--radius-lg)',
            transition: 'background-color 0.2s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--color-bg-hover)'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          title="Upload minh chứng"
        >
          {participant.hasEvidence ? (
            <Paperclip style={{ width: '1.125rem', height: '1.125rem', color: 'var(--color-primary)' }} />
          ) : (
            <FileText style={{ width: '1.125rem', height: '1.125rem', color: 'var(--color-text-muted)' }} />
          )}
        </button>
      </td>
    </tr>
  );
}
