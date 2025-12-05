import React, { useState, useEffect } from 'react';
import { pointService } from '../../services/pointService';
import type { 
  EmployeePointDto, 
  PointTransactionDto,
  PointConversionRuleDto 
} from '../../services/pointService';
import { Loader2, AlertCircle } from 'lucide-react';

const RewardDashboard: React.FC = () => {
  const [rewardTab, setRewardTab] = useState<'available' | 'history'>('available');
  
  // States cho dữ liệu
  const [employeePoint, setEmployeePoint] = useState<EmployeePointDto | null>(null);
  const [transactions, setTransactions] = useState<PointTransactionDto[]>([]);
  const [conversionRule, setConversionRule] = useState<PointConversionRuleDto | null>(null);
  
  // States cho loading và error
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Lấy employeeId từ localStorage (giả sử đã lưu khi login)
  const employeeId = parseInt(localStorage.getItem('userId') || '1');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch song song tất cả dữ liệu cần thiết
      const [pointData, transactionsData, ruleData] = await Promise.all([
        pointService.getEmployeePoint(employeeId),
        pointService.getEmployeeTransactionHistory(employeeId, 20),
        pointService.getActiveConversionRule(),
      ]);

      setEmployeePoint(pointData);
      setTransactions(transactionsData);
      setConversionRule(ruleData);
    } catch (err: any) {
      console.error('Error fetching reward data:', err);
      setError(err.message || 'Không thể tải dữ liệu điểm thưởng');
    } finally {
      setLoading(false);
    }
  };

  // Tính toán stats
  const stats = {
    currentPoints: employeePoint?.pointTotal || 0,
    totalAccumulatedPoints: transactions
      .filter(t => t.type === 'earn')
      .reduce((sum, t) => sum + t.value, 0),
    redeemedPoints: Math.abs(
      transactions
        .filter(t => t.type === 'redeem')
        .reduce((sum, t) => sum + t.value, 0)
    ),
  };

  // Mock data cho phần thưởng tiếp theo (có thể customize)
  const nextReward = {
    title: 'Quy đổi điểm sang tiền',
    description: 'Đổi 100 điểm = 100,000đ',
    requiredPoints: 100,
    currentProgress: stats.currentPoints,
    maxProgress: 100,
    daysRemaining: Math.max(0, 100 - stats.currentPoints),
  };

  const progressPercentage = Math.min(
    (nextReward.currentProgress / nextReward.maxProgress) * 100,
    100
  );

  if (loading) {
    return (
      <div className="w-full min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <Loader2 className="h-12 w-12 text-blue-600 animate-spin" />
          <span className="ml-3 text-gray-600 mt-4">Đang tải dữ liệu...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center text-red-600">
          <AlertCircle className="h-12 w-12 mb-4" />
          <p className="font-medium">{error}</p>
          <button
            onClick={fetchData}
            className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full p-4 sm:p-6 lg:p-8 bg-gray-50 min-h-screen">
      {/* Page Header */}
      <div className="mb-6 sm:mb-8 text-center">
        <h1 className="text-blue-600 text-xl sm:text-2xl lg:text-3xl font-semibold mb-2 sm:mb-3">
          Điểm thưởng của tôi
        </h1>
        <p className="text-gray-600 text-sm sm:text-base px-4">
          Xin chào {employeePoint?.employeeName || 'Nhân viên'}, đây là thông tin điểm thưởng của bạn
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
        {/* Current Points Card */}
        <div className="bg-white border border-gray-200 rounded-xl p-4 sm:p-6">
          <h3 className="text-gray-600 text-sm mb-3">Điểm hiện có</h3>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-bold text-blue-600">{stats.currentPoints}</div>
              <div className="text-sm text-gray-500">điểm</div>
            </div>
          </div>
        </div>

        {/* Total Accumulated Points Card */}
        <div className="bg-white border border-gray-200 rounded-xl p-4 sm:p-6">
          <h3 className="text-gray-600 text-sm mb-3">Tổng điểm tích lũy</h3>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-bold text-green-600">{stats.totalAccumulatedPoints}</div>
              <div className="text-sm text-gray-500">điểm</div>
            </div>
          </div>
        </div>

        {/* Redeemed Points Card */}
        <div className="bg-white border border-gray-200 rounded-xl p-4 sm:p-6">
          <h3 className="text-gray-600 text-sm mb-3">Đã đổi thưởng</h3>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
              </svg>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-bold text-red-600">{stats.redeemedPoints}</div>
              <div className="text-sm text-gray-500">điểm</div>
            </div>
          </div>
        </div>
      </div>

      {/* Next Reward Section */}
      {conversionRule && (
        <div className="bg-white border border-gray-200 rounded-xl p-4 sm:p-6 mb-6 sm:mb-8">
          <h3 className="text-gray-800 font-semibold text-base sm:text-lg mb-3 sm:mb-4">
            Quy đổi điểm sang tiền
          </h3>
          <div className="mb-4">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-2 gap-2">
              <div className="flex-1">
                <h4 className="font-medium text-gray-800 text-sm sm:text-base">
                  Tỷ lệ quy đổi: {conversionRule.pointValue} điểm = {conversionRule.moneyValue.toLocaleString('vi-VN')}đ
                </h4>
                <p className="text-xs sm:text-sm text-gray-600">
                  {stats.currentPoints >= 100 
                    ? 'Bạn đã có đủ điểm để quy đổi!' 
                    : `Còn thiếu ${100 - stats.currentPoints} điểm nữa`}
                </p>
              </div>
              {stats.currentPoints >= 100 && (
                <button
                  onClick={() => window.location.href = '/rewards/exchange'}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Quy đổi ngay
                </button>
              )}
            </div>
            
            {/* Progress Bar */}
            <div className="relative">
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-300"
                  style={{ width: `${progressPercentage}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-xs text-gray-600 mt-1">
                <span>{nextReward.currentProgress} / {nextReward.maxProgress} điểm</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tabs Section */}
      <div className="bg-white rounded-xl overflow-hidden">
        {/* Tab Headers */}
        <div className="flex justify-around border-b border-gray-200 px-2 sm:px-6">
          <button
            onClick={() => setRewardTab('available')}
            className={`py-3 sm:py-4 px-2 sm:px-4 font-medium text-sm sm:text-base transition-colors relative ${
              rewardTab === 'available'
                ? 'text-gray-900'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
              </svg>
              Thông tin quy đổi
            </div>
            {rewardTab === 'available' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"></div>
            )}
          </button>
          <button
            onClick={() => setRewardTab('history')}
            className={`py-3 sm:py-4 px-2 sm:px-4 font-medium text-sm sm:text-base transition-colors relative ${
              rewardTab === 'history'
                ? 'text-gray-900'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Lịch sử tích điểm
            </div>
            {rewardTab === 'history' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"></div>
            )}
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-4 sm:p-6">
          {rewardTab === 'available' ? (
            <div>
              {/* Info Banner */}
              <div className="flex items-start gap-3 bg-blue-50 border border-blue-100 rounded-lg p-4 mb-6">
                <svg className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="text-sm text-gray-700">
                  <p className="font-medium mb-1">
                    Quy tắc quy đổi hiện tại: {conversionRule?.pointValue || 100} điểm = {(conversionRule?.moneyValue || 100000).toLocaleString('vi-VN')}đ
                  </p>
                  <p>Tối thiểu {conversionRule?.pointValue || 100} điểm để quy đổi</p>
                </div>
              </div>

              {/* Button quy đổi */}
              {stats.currentPoints >= (conversionRule?.pointValue || 100) ? (
                <div className="text-center">
                  <button
                    onClick={() => window.location.href = '/rewards/exchange'}
                    className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                  >
                    Quy đổi điểm sang tiền
                  </button>
                </div>
              ) : (
                <div className="text-center text-gray-600">
                  <p>Bạn cần thêm {(conversionRule?.pointValue || 100) - stats.currentPoints} điểm nữa để quy đổi</p>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {transactions.length === 0 ? (
                <p className="text-center text-gray-500 py-8">Chưa có giao dịch nào</p>
              ) : (
                transactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 sm:p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors gap-3 sm:gap-0"
                  >
                    <div className="flex items-center gap-3 sm:gap-4 w-full sm:w-auto">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        transaction.type === 'earn' ? 'bg-green-100' : 'bg-red-100'
                      }`}>
                        {transaction.type === 'earn' ? (
                          <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                          </svg>
                        ) : (
                          <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                          </svg>
                        )}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-800 text-sm sm:text-base">
                          {transaction.description || transaction.typeDisplay}
                        </h4>
                        <p className="text-xs sm:text-sm text-gray-500">
                          {new Date(transaction.createdAt).toLocaleDateString('vi-VN')}
                        </p>
                      </div>
                    </div>
                    <div className="text-left sm:text-right w-full sm:w-auto">
                      <div className={`text-base sm:text-lg font-semibold ${
                        transaction.type === 'earn' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {transaction.type === 'earn' ? '+' : ''}{transaction.value} điểm
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RewardDashboard;