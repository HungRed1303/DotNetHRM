interface FilterChipsProps {
  selected: string;
  onFilterChange: (filter: string) => void;
}

export default function FilterChips({ selected, onFilterChange }: FilterChipsProps) {
  const filters = ["Tất cả", "Đang diễn ra", "Sắp diễn ra", "Đã kết thúc"];

  return (
    <div className="flex gap-2 flex-wrap">
      {filters.map((filter) => (
        <button
          key={filter}
          onClick={() => onFilterChange(filter)}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
            selected === filter
              ? "bg-blue-600 text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          {filter}
        </button>
      ))}
    </div>
  );
}
