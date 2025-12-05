import { THEME_COLORS } from "../common/THEME_COLORS";

export default function ExchangePointHeader() {
  return (
    <div
      className="p-3 rounded-md mb-3"
      style={{
        backgroundColor: THEME_COLORS.primary[800],
        color: "white",
        textAlign: "left"
      }}
    >
      <h1
        style={{
          fontSize: "16px",
          fontWeight: 600,
          margin: 0
        }}
      >
        Quy đổi điểm thưởng
      </h1>

     <p
  style={{
    fontSize: "10px",
    opacity: 0.9,
    margin: "2px 0 0 0",
    color: "white",
    fontWeight: "600"  
  }}
>
  Chuyển đổi điểm thưởng thành tiền mặt
</p>


    </div>
  );
}
