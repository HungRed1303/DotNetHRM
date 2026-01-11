import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchEmployeeStatistics, fetchActivityStatistics } from '../store/employeeSlice';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { statistics, statisticsLoading, activityStatistics, activityStatisticsLoading } = useAppSelector((state) => state.employee);

  useEffect(() => {
    dispatch(fetchEmployeeStatistics());
    dispatch(fetchActivityStatistics());
  }, [dispatch]);

  console.log('Activity Statistics:', activityStatistics);

  return (
    <div className="px-10 py-12">
        <h1 className="text-3xl font-bold mb-10 text-gray-800 text-center">
          Dashboard Quản trị
        </h1>

        {/* Widgets */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">

          <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200 hover:shadow-lg transition">
            <div className="text-gray-500">Tổng nhân viên</div>
            <div className="text-4xl font-bold text-gray-800 mt-2">
              {statisticsLoading ? '...' : statistics?.totalEmployees || 0}
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200 hover:shadow-lg transition">
            <div className="text-gray-500">Yêu cầu nghỉ phép chờ duyệt</div>
            <div className="text-4xl font-bold text-orange-500 mt-2">8</div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200 hover:shadow-lg transition">
            <div className="text-gray-500">Hoạt động đang mở đăng ký</div>
            <div className="text-4xl font-bold text-green-600 mt-2">
              {activityStatisticsLoading ? '...' : activityStatistics?.openRegistration || 0}
            </div>
          </div>

        </div>

        {/* Pie Charts - Side by Side */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {/* Pie Chart - Phân bổ chức vụ */}
          <div>
            <h2 className="text-2xl font-bold text-gray-700 mb-6 text-center">
              Phân bổ chức vụ nhân viên
            </h2>
            <div className="bg-white p-8 rounded-xl shadow-md border border-gray-200">
              {statisticsLoading ? (
                <div className="text-center py-12 text-gray-500">Đang tải dữ liệu...</div>
              ) : statistics?.roleDistribution && statistics.roleDistribution.length > 0 ? (
                <ResponsiveContainer width="100%" height={400}>
                  <PieChart>
                    <Pie
                      data={statistics.roleDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ roleName, percent }) => `${roleName}: ${(percent ? (percent * 100).toFixed(0) : 0)}%`}
                      outerRadius={120}
                      fill="#8884d8"
                      dataKey="count"
                      nameKey="roleName"
                    >
                      {statistics.roleDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value: number) => [`${value} nhân viên`, 'Số lượng']}
                    />
                    <Legend 
                      verticalAlign="bottom" 
                      height={36}
                      formatter={(value) => value}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center py-12 text-gray-500">Không có dữ liệu</div>
              )}
            </div>
          </div>

          {/* Pie Chart - Phân bố hoạt động */}
          <div>
            <h2 className="text-2xl font-bold text-gray-700 mb-6 text-center">
              Phân bố trạng thái hoạt động
            </h2>
            <div className="bg-white p-8 rounded-xl shadow-md border border-gray-200">
              {activityStatisticsLoading ? (
                <div className="text-center py-12 text-gray-500">Đang tải dữ liệu...</div>
              ) : activityStatistics?.statusDistribution && activityStatistics.statusDistribution.length > 0 ? (
                <ResponsiveContainer width="100%" height={400}>
                  <PieChart>
                    <Pie
                      data={activityStatistics.statusDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ status, percent }) => `${status}: ${(percent ? (percent * 100).toFixed(0) : 0)}%`}
                      outerRadius={120}
                      fill="#8884d8"
                      dataKey="count"
                      nameKey="status"
                    >
                      {activityStatistics.statusDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value: number) => [`${value} hoạt động`, 'Số lượng']}
                    />
                    <Legend 
                      verticalAlign="bottom" 
                      height={36}
                      formatter={(value) => value}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center py-12 text-gray-500">Không có dữ liệu</div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <h2 className="text-2xl font-bold text-gray-700 mb-6 text-center">
          Thao tác nhanh
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">

          <button
            onClick={() => navigate("/admin/employee/create")}
            className="bg-blue-600 text-white text-lg font-semibold
              py-4 rounded-xl shadow-md text-center 
              hover:bg-blue-700 active:scale-[.98]
              transition-all duration-200"
          >
            Thêm nhân viên mới
          </button>

          <button
            onClick={() => navigate("/admin/activities/create")}
            className="bg-green-600 text-white text-lg font-semibold
              py-4 rounded-xl shadow-md text-center 
              hover:bg-green-700 active:scale-[.98]
              transition-all duration-200"
          >
            Tạo hoạt động mới
          </button>

        </div>
      </div>
  );
};

export default AdminDashboard;
