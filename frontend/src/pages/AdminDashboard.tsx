import React from "react";
import { Link } from "react-router-dom";

const AdminDashboard: React.FC = () => {
  return (
    <div className="flex min-h-screen bg-gray-100 font-sans">

      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-xl border-r border-gray-200 flex flex-col py-10 px-6">
        <div className="mb-10 text-3xl font-extrabold text-blue-600 tracking-wide">
          HRM Admin
        </div>

        <nav className="space-y-3">
          {[
            { label: "Quản lý nhân viên", to: "/employees" },
            { label: "Yêu cầu nghỉ phép", to: "/requests" },
            { label: "Quản lý điểm thưởng", to: "/rewards" },
            { label: "Hoạt động/Campaign", to: "/activities" },
            { label: "Bảng công", to: "/timesheet" },
          ].map((item, i) => (
            <Link
              key={i}
              to={item.to}
              className="block py-2.5 px-4 rounded-lg text-gray-700 font-medium hover:bg-blue-50 hover:text-blue-600 transition-all"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 px-10 py-12">
        <h1 className="text-3xl font-bold mb-10 text-gray-800 text-center">
          Dashboard Quản trị
        </h1>

        {/* Widgets */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">

          <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200 hover:shadow-lg transition">
            <div className="text-gray-500">Tổng nhân viên</div>
            <div className="text-4xl font-bold text-gray-800 mt-2">120</div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200 hover:shadow-lg transition">
            <div className="text-gray-500">Yêu cầu nghỉ phép chờ duyệt</div>
            <div className="text-4xl font-bold text-orange-500 mt-2">8</div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200 hover:shadow-lg transition">
            <div className="text-gray-500">Hoạt động đang diễn ra</div>
            <div className="text-4xl font-bold text-green-600 mt-2">3</div>
          </div>

        </div>

        {/* Quick Actions */}
        <h2 className="text-2xl font-bold text-gray-700 mb-6 text-center">
          Thao tác nhanh
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">

          <Link
            to="/employees/add"
            className="bg-blue-600 text-white text-lg font-semibold
              py-4 rounded-xl shadow-md text-center 
              hover:bg-blue-700 active:scale-[.98]
              transition-all duration-200"
            style={{ color: '#ffffff' }}
          >
            Thêm nhân viên mới
          </Link>

          <Link
            to="/activities/create"
            className="bg-green-600 text-white text-lg font-semibold
              py-4 rounded-xl shadow-md text-center 
              hover:bg-green-700 active:scale-[.98]
              transition-all duration-200"
            style={{ color: '#ffffff' }}
          >
            Tạo hoạt động mới
          </Link>

        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
