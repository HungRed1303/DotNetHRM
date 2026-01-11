import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import {
  allMonthlyAttendance,
  workShifts
} from '../../data/attendanceData';

import type {
    AttendanceStatus
} from '../../data/attendanceData';

const AttendancePage: React.FC = () => {
  const [selectedMonth, setSelectedMonth] = useState('10/2025');
  const [selectedShift, setSelectedShift] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);

  // Lấy dữ liệu chấm công theo tháng được chọn
  const currentAttendance = useMemo(() => {
    return allMonthlyAttendance.find(att => att.month === selectedMonth) || allMonthlyAttendance[0];
  }, [selectedMonth]);

  // Lọc dữ liệu theo search
  const filteredRecords = useMemo(() => {
    return currentAttendance.records.filter(record => {
      const matchesSearch = searchQuery === '' || 
        record.date.includes(searchQuery) ||
        record.note.toLowerCase().includes(searchQuery.toLowerCase());
      
      // TODO: Implement shift filtering logic if needed
      return matchesSearch;
    });
  }, [currentAttendance.records, searchQuery]);

  // Phân trang
  const totalPages = Math.ceil(filteredRecords.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentRecords = filteredRecords.slice(startIndex, endIndex);

  // Reset về trang 1 khi filter thay đổi
  React.useEffect(() => {
    setCurrentPage(1);
  }, [selectedMonth, searchQuery]);

  // Hàm render trạng thái với màu sắc
  const getStatusBadge = (status: AttendanceStatus) => {
    const statusConfig = {
      Normal: { label: 'Normal', className: 'bg-green-100 text-green-700' },
      Late: { label: 'Late', className: 'bg-orange-100 text-orange-700' },
      Missing: { label: 'Missing', className: 'bg-red-100 text-red-700' },
      Overtime: { label: 'Overtime', className: 'bg-blue-100 text-blue-700' },
      Leave: { label: 'Leave', className: 'bg-gray-100 text-gray-700' }
    };

    const config = statusConfig[status];
    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${config.className}`}>
        {config.label}
      </span>
    );
  };

  // Hàm render row với màu nền khác nhau
  const getRowClassName = (status: AttendanceStatus, index: number) => {
    if (status === 'Leave') {
      return 'bg-green-50';
    }
    return index % 2 === 0 ? 'bg-white' : 'bg-gray-50';
  };

  return (
    <div className="min-h-screen bg-gray-50 px-6 py-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Bảng chấm công cá nhân
          </h1>
          <p className="text-gray-600 text-sm">
            Dữ liệu được đồng bộ tự động mỗi 15 phút từ máy chấm công.
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Tháng/Năm */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tháng/Năm
              </label>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {allMonthlyAttendance.map(att => (
                  <option key={att.month} value={att.month}>
                    {att.month}
                  </option>
                ))}
              </select>
            </div>

            {/* Ca làm việc */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ca làm việc
              </label>
              <select
                value={selectedShift}
                onChange={(e) => setSelectedShift(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {workShifts.map(shift => (
                  <option key={shift.id} value={shift.id}>
                    {shift.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Tìm kiếm */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tìm kiếm
              </label>
              <input
                type="text"
                placeholder="Nhập ngày hoặc ghi chú..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Nút gửi yêu cầu */}
            <div className="flex items-end">
              <button 
                className="w-full bg-gray-800 hover:bg-gray-900 text-white px-6 py-2 rounded-lg transition-all font-medium"
                style={{
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 5px 20px rgba(55, 65, 81, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                Gửi yêu cầu cập nhật
              </button>
            </div>
          </div>
        </div>

        {/* Attendance Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-6">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800">
              Chi tiết chấm công tháng {selectedMonth}
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-blue-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-blue-700">
                    Ngày
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-blue-700">
                    Check-in
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-blue-700">
                    Check-out
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-blue-700">
                    Tổng giờ
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-blue-700">
                    Trạng thái
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-blue-700">
                    Ghi chú
                  </th>
                </tr>
              </thead>
              <tbody>
                {currentRecords.map((record, index) => (
                  <tr 
                    key={record.id}
                    className={`${getRowClassName(record.status, startIndex + index)} border-b border-gray-100`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {record.date}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {record.checkIn || <span className="text-red-500">—</span>}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {record.checkOut || <span className="text-red-500">—</span>}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                      {record.totalHours || <span className="text-red-500">—</span>}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {getStatusBadge(record.status)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {record.note || '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Hiển thị <span className="font-medium">{startIndex + 1}</span> đến{' '}
              <span className="font-medium">{Math.min(endIndex, filteredRecords.length)}</span> trong tổng số{' '}
              <span className="font-medium">{filteredRecords.length}</span> bản ghi
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              
              <div className="flex items-center space-x-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors border ${
                      currentPage === page
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'text-gray-700 hover:bg-gray-100 border-gray-200'
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Tổng công trong tháng */}
          <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Tổng công trong tháng</p>
                <p className="text-3xl font-bold text-gray-900">
                  {currentAttendance.summary.totalWorkDays} ngày
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Đi trễ / Về sớm */}
          <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-orange-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Đi trễ / Về sớm</p>
                <p className="text-3xl font-bold text-gray-900">
                  {currentAttendance.summary.lateOrEarlyCount} lần
                </p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Giờ làm thêm */}
          <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Giờ làm thêm</p>
                <p className="text-3xl font-bold text-gray-900">
                  {currentAttendance.summary.overtimeHours}h
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Nghỉ / Thiếu công */}
          <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-red-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Nghỉ / Thiếu công</p>
                <p className="text-3xl font-bold text-gray-900">
                  {currentAttendance.summary.absenceOrLeaveCount} ngày
                </p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AttendancePage;
