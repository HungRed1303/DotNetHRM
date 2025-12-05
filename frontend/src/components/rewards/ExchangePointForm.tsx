import { useState } from "react";
import { THEME_COLORS } from "../common/THEME_COLORS";

export default function ExchangePointForm({
  current,
  rate,
  openConfirm,
}: {
  current: number;
  rate: number;
  openConfirm: (points: number, money: number) => void;
}) {
  const MIN = 100;
  const STEP = 100;

  const [points, setPoints] = useState("100");
  const [error, setError] = useState("");

  const money = () => (Number(points) / 100) * rate;

  const formatCurrency = (v: number) =>
    v.toLocaleString("vi-VN", { style: "currency", currency: "VND" });

  const handleInput = (value: string) => {
    setPoints(value);
    setError("");

    const num = Number(value);

    if (!value) return;
    if (isNaN(num)) return setError("Vui lòng nhập số hợp lệ.");
    if (num < MIN) return setError(`Tối thiểu: ${MIN}`);
    if (num > current) return setError("Vượt quá điểm hiện có.");
    if (num % STEP !== 0) return setError(`Bội số hợp lệ: ${STEP}`);
  };

  return (
    <div className="bg-white p-3 rounded-md shadow mb-3">
      <h2 className="text-[13px] font-semibold mb-2">Thực hiện quy đổi</h2>

      <label className="text-[11px] font-medium">Số điểm muốn quy đổi</label>

      <input
        value={points}
        onChange={(e) => handleInput(e.target.value)}
        className="w-full border p-2 rounded-md text-[12px] mt-1"
        style={{ borderColor: THEME_COLORS.primary[400] }}
      />

      <div className="flex justify-between text-[10px] text-gray-500 mt-1">
        <p>Tối thiểu: 100</p>
        <p>Tối đa: {current}</p>
      </div>

      <div
        className="mt-3 p-2 rounded-md flex justify-between text-[12px] text-white"
        style={{ backgroundColor: THEME_COLORS.primary[800] }}
      >
        <span>Số tiền nhận:</span>
        <span className="font-bold text-[13px]">{formatCurrency(money())}</span>
      </div>

      {error && <p className="text-red-600 text-[11px] mt-1">{error}</p>}

      <button
        className="w-full mt-3 p-2 text-white rounded-md text-[12px]"
        style={{ backgroundColor: THEME_COLORS.primary[600] }}
        onClick={() => openConfirm(Number(points), money())}
        disabled={!!error}
      >
        Quy đổi ngay
      </button>
    </div>
  );
}
