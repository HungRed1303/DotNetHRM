// Sidebar hồ sơ
import Avatar from "../../components/common/Avatar";
import { HiOutlineCheckCircle, HiOutlinePencil } from "react-icons/hi";
import { THEME_COLORS } from "../../components/common/THEME_COLORS";

export default function ProfileSidebar({ data }: any) {
  return (
    <aside
      className="w-[320px] rounded-xl border bg-white p-6 shadow-sm flex flex-col items-center gap-5"
      style={{ borderColor: THEME_COLORS.primary[500] }}
    >
      <Avatar src={data.avatar} name={data.fullName} size="xl" />

      <div className="text-center">
        <h2 className="text-xl font-semibold" style={{ color: THEME_COLORS.primary[700] }}>
          {data.fullName}
        </h2>
        <p className="text-sm mt-1 text-gray-600">{data.position || "-"}</p>
        <p className="text-xs text-gray-500">{data.department || "-"}</p>
      </div>

      <div
        className="inline-flex items-center gap-2 text-xs px-3 py-1.5 rounded-full font-medium border"
        style={{
          background: THEME_COLORS.primary[50],
          color: THEME_COLORS.primary[600],
          borderColor: THEME_COLORS.primary[300],
        }}
      >
        <HiOutlineCheckCircle size={16} />
        Đang làm việc
      </div>

      <button
        className="mt-3 px-4 py-2 w-full rounded-lg text-sm font-medium flex items-center justify-center gap-2 bg-blue-600 text-white hover:bg-blue-700 transition"
      >
        <HiOutlinePencil size={16} /> Chỉnh sửa hồ sơ
      </button>
    </aside>
  );
}
