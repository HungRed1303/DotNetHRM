interface LoadMoreProps {
  shown: number;
  total: number;
  onLoadMore: () => void;
}

export default function LoadMore({ shown, total, onLoadMore }: LoadMoreProps) {
  if (shown >= total) {
    return (
      <p className="text-center text-sm text-gray-500 py-4">
        Đã hiển thị tất cả {total} hoạt động
      </p>
    );
  }

  return (
    <div className="text-center py-4">
      <button
        onClick={onLoadMore}
        className="px-6 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
      >
        Xem thêm ({shown}/{total})
      </button>
    </div>
  );
}
