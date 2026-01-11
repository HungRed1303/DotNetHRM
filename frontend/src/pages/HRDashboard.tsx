import React from "react";
import { Link } from "react-router-dom";

const HRDashboard: React.FC = () => {
  return (
    <div className="px-10 py-12">
        <h1 className="text-3xl font-bold mb-10 text-gray-800 text-center">
          Dashboard HR
        </h1>

        {/* Widgets */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">

          <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200 hover:shadow-lg transition">
            <div className="text-gray-500">Tổng nhân viên</div>
            <div className="text-4xl font-bold text-gray-800 mt-2">120</div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200 hover:shadow-lg transition">
            <div className="text-gray-500">Hoạt động đang diễn ra</div>
            <div className="text-4xl font-bold text-green-600 mt-2">3</div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200 hover:shadow-lg transition">
            <div className="text-gray-500">Yêu cầu chờ xử lý</div>
            <div className="text-4xl font-bold text-orange-500 mt-2">8</div>
          </div>

        </div>

        {/* Quick Actions */}
        <h2 className="text-2xl font-bold text-gray-700 mb-6 text-center">
          Thao tác nhanh
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">

          <Link
            to="/activities/create"
            className="bg-blue-600 text-white text-lg font-semibold
              py-4 rounded-xl shadow-md text-center 
              hover:bg-blue-700 active:scale-[.98]
              transition-all duration-200"
            style={{ color: '#ffffff' }}
          >
            Tạo hoạt động mới
          </Link>

          <Link
            to="/rewards/hr-reward"
            className="bg-green-600 text-white text-lg font-semibold
              py-4 rounded-xl shadow-md text-center
              hover:bg-green-700 active:scale-[.98]
              transition-all duration-200"
            style={{ color: '#ffffff' }}
          >
            Thưởng điểm nhân viên
          </Link>

          <Link
            to="/activities/cancel"
            className="bg-orange-600 text-white text-lg font-semibold
              py-4 rounded-xl shadow-md text-center
              hover:bg-orange-700 active:scale-[.98]
              transition-all duration-200"
            style={{ color: '#ffffff' }}
          >
            Hủy hoạt động
          </Link>

          <Link
            to="/requests"
            className="bg-purple-600 text-white text-lg font-semibold
              py-4 rounded-xl shadow-md text-center
              hover:bg-purple-700 active:scale-[.98]
              transition-all duration-200"
            style={{ color: '#ffffff' }}
          >
            Xem yêu cầu nghỉ phép
          </Link>

        </div>
    </div>
  );
};

export default HRDashboard;
