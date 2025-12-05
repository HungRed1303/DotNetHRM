export default function ExchangePointConfirmModal(props: {
  open: boolean;
  points: number;
  money: number;
  onConfirm: () => void;
  onClose: () => void;
}) {
  if (!props.open) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
      <div className="bg-white p-4 rounded-md shadow w-72 text-left">
        <h3 className="font-semibold mb-2">Xác nhận quy đổi</h3>

        <p className="text-sm mb-3">
          Bạn có chắc muốn quy đổi <b>{props.points}</b> điểm thành{" "}
          <b>{props.money.toLocaleString("vi-VN")}đ</b>?
        </p>

        <div className="flex gap-2">
          <button
            className="flex-1 p-2 rounded bg-gray-300 text-black text-sm"
            onClick={props.onClose}
          >
            Hủy
          </button>

          <button
            className="flex-1 p-2 rounded bg-blue-600 text-white text-sm"
            onClick={props.onConfirm}
          >
            Đồng ý
          </button>
        </div>
      </div>
    </div>
  );
}
