import { useState } from "react";

interface ResultFilterChipsProps {
  onFilterChange: (filter: string) => void;
}

export default function ResultFilterChips({ onFilterChange }: ResultFilterChipsProps) {
  const [selected, setSelected] = useState("Chưa nhập");

  const chips = [
    { label: "Tất cả", count: 44 },
    { label: "Chưa nhập", count: 24 },
    { label: "Đã nhập", count: 21 },
    { label: "Không hoàn thành", count: 0 },
  ];

  const handleClick = (label: string) => {
    setSelected(label);
    onFilterChange(label);
  };

  return (
    <div className="flex gap-3" style={{ flexWrap: 'wrap' }}>
      {chips.map((chip) => (
        <button
          key={chip.label}
          onClick={() => handleClick(chip.label)}
          className={`filter-chip ${selected === chip.label ? 'active' : ''}`}
        >
          {chip.label} <span style={{ fontWeight: 'var(--font-weight-bold)', color: selected === chip.label ? 'rgba(255,255,255,0.8)' : 'var(--color-text-muted)' }}>({chip.count})</span>
        </button>
      ))}
    </div>
  );
}
