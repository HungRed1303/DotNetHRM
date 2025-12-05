// Row thông tin thường
import React from "react";

export default function Field({ label, icon, children }: any) {
  return (
    <div className="flex flex-col items-start text-left gap-1.5">
      <div className="flex items-center gap-2 text-sm text-gray-500">
        {icon && React.cloneElement(icon, { className: "w-4 h-4 text-gray-500" })}
        {label}
      </div>

      <div className="text-[15px] font-medium text-gray-900 font-mono">
        {children || "-"}
      </div>
    </div>
  );
}
