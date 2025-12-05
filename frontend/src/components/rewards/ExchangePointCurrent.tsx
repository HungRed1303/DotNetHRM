import { THEME_COLORS } from "../common/THEME_COLORS";

export default function ExchangePointCurrent(props: { current: number; rate: number }) {
  const formatCurrency = (v: number) =>
    v.toLocaleString("vi-VN", { style: "currency", currency: "VND" });

  return (
    <div className="bg-white p-3 rounded-md shadow mb-3">
      <h2 className="text-[13px] font-semibold mb-1">Điểm thưởng hiện tại</h2>

      <div className="flex justify-between items-center">
        <p className="text-[11px] text-gray-600">
          📈 100 điểm = {formatCurrency(props.rate)}
        </p>

        <p
          style={{
            fontSize: "17px",
            fontWeight: "bold",
            color: THEME_COLORS.primary[800]
          }}
        >
          {props.current}
          <span className="text-[10px] text-gray-600 ml-1">điểm</span>
        </p>
      </div>
    </div>
  );
}
