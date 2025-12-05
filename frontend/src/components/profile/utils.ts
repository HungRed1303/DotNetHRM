// Hàm che số
export const maskValue = (v?: string, keep = 4) => {
  if (!v) return "-";
  if (v.length <= keep) return v;
  return "*".repeat(v.length - keep) + v.slice(-keep);
};

// Format ngày dd/mm/yyyy
export const fdate = (v?: string | number | Date) => {
  if (!v) return "-";
  return new Date(v).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};
