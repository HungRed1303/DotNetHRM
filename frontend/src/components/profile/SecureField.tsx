// Row thông tin nhạy cảm có ẩn/hiện
import { HiOutlineIdentification, HiOutlineEye, HiOutlineEyeOff } from "react-icons/hi";

const mask = (v?: string, keep = 4) => {
  if (!v) return "-";
  if (v.length <= keep) return v;
  return "*".repeat(v.length - keep) + v.slice(-keep);
};

export default function SecureRow({ label, value, show, onToggle }: any) {
  return (
    <div className="flex flex-col items-start text-left gap-1.5">
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <HiOutlineIdentification size={16} color="#2563eb" />
        {label}
      </div>

      <div className="flex items-center justify-between w-full">
        <div className="text-[15px] font-semibold font-mono text-gray-900">
          {show ? value : mask(value)}
        </div>

        <button className="text-gray-500 hover:text-black" onClick={onToggle} type="button">
          {show ? <HiOutlineEyeOff size={20} color="black" /> : <HiOutlineEye size={20} color="black" />}
        </button>
      </div>
    </div>
  );
}
