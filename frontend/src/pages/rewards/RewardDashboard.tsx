import React, { useState, useEffect } from 'react';
import { pointService } from '../../services/pointService';
import type { 
  EmployeePointDto, 
  PointTransactionDto,
  PointConversionRuleDto 
} from '../../services/pointService';
import { Loader2, AlertCircle, Target, Gift } from 'lucide-react';

const RewardDashboard: React.FC = () => {
  const [rewardTab, setRewardTab] = useState<'available' | 'history'>('available');
  
  // States cho dữ liệu
  const [employeePoint, setEmployeePoint] = useState<EmployeePointDto | null>(null);
  const [transactions, setTransactions] = useState<PointTransactionDto[]>([]);
  
  // [CẬP NHẬT] Đổi thành mảng để chứa danh sách các quy tắc
  const [conversionRules, setConversionRules] = useState<PointConversionRuleDto[]>([]);
  
  // States cho loading và error
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const employeeId = parseInt(localStorage.getItem('userId') || '1');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [pointData, transactionsData, ruleData] = await Promise.all([
        pointService.getEmployeePoint(employeeId),
        pointService.getEmployeeTransactionHistory(employeeId, 20),
        pointService.getActiveConversionRule(), // API này giờ trả về List
      ]);

      setEmployeePoint(pointData);
      setTransactions(transactionsData);

      // [CẬP NHẬT] Xử lý dữ liệu trả về là Array
      if (Array.isArray(ruleData)) {
        // Sắp xếp quy tắc từ bé đến lớn để dễ tính toán progress
        const sortedRules = ruleData.sort((a, b) => a.pointValue - b.pointValue);
        setConversionRules(sortedRules);
      } else if (ruleData) {
        // Fallback nếu backend trả về object đơn
        setConversionRules([ruleData]);
      } else {
        setConversionRules([]);
      }

    } catch (err: any) {
      console.error('Error fetching reward data:', err);
      setError(err.message || 'Không thể tải dữ liệu điểm thưởng');
    } finally {
      setLoading(false);
    }
  };

  // Tính toán stats
  const currentPoints = employeePoint?.pointTotal || 0;
  const stats = {
    currentPoints: currentPoints,
    totalAccumulatedPoints: transactions
      .filter(t => t.type === 'earn')
      .reduce((sum, t) => sum + t.value, 0),
    redeemedPoints: Math.abs(
      transactions
        .filter(t => t.type === 'redeem')
        .reduce((sum, t) => sum + t.value, 0)
    ),
  };

  // [CẬP NHẬT] Logic tính toán "Phần thưởng tiếp theo" (Next Reward)
  // Tìm mốc quy đổi gần nhất mà user CHƯA đạt được
  const nextTargetRule = conversionRules.find(r => r.pointValue > currentPoints);
  
  // Nếu đã vượt qua tất cả mốc, lấy mốc cao nhất để hiển thị (hoặc null)
  const maxRule = conversionRules.length > 0 ? conversionRules[conversionRules.length - 1] : null;
  const displayTarget = nextTargetRule || maxRule;

  // Tính % tiến độ
  let progressPercentage = 0;
  let progressText = "";

  if (displayTarget) {
    if (currentPoints >= displayTarget.pointValue) {
      // Đã đạt mốc cao nhất
      progressPercentage = 100;
      progressText = "Bạn đã chinh phục mốc cao nhất!";
    } else {
      // Đang chạy tới mốc tiếp theo
      progressPercentage = Math.min((currentPoints / displayTarget.pointValue) * 100, 100);
      progressText = `${currentPoints} / ${displayTarget.pointValue} điểm`;
    }
  }

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
          <button onClick={fetchData} className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full p-4 sm:p-6 lg:p-8 min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Page Header */}
        <div className="text-center sm:text-left">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            Trung Tâm Điểm Thưởng
          </h1>
          <p className="text-gray-600">
            Xin chào <span className="font-semibold text-blue-600">{employeePoint?.employeeName}</span>, hãy xem thành quả của bạn!
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl shadow-xs p-6 border border-gray-100">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 text-blue-600 rounded-lg">
                <Gift className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium">Điểm hiện có</p>
                <p className="text-2xl font-bold text-blue-600">{stats.currentPoints}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-xs p-6 border border-gray-100">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 text-green-600 rounded-lg">
                <Target className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium">Tổng tích lũy</p>
                <p className="text-2xl font-bold text-green-600">{stats.totalAccumulatedPoints}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-xs p-6 border border-gray-100">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-orange-100 text-orange-600 rounded-lg">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" /></svg>
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium">Đã đổi thưởng</p>
                <p className="text-2xl font-bold text-orange-600">{stats.redeemedPoints}</p>
              </div>
            </div>
          </div>
        </div>

        {/* [CẬP NHẬT] Next Reward / Goal Section */}
        {displayTarget && (
          <div className="bg-white rounded-xl shadow-xs border border-gray-200 overflow-hidden">
            <div className="p-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <Target className="w-5 h-5 text-blue-500" />
                    {nextTargetRule ? 'Mục tiêu tiếp theo' : 'Đã đạt mốc tối đa'}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {nextTargetRule 
                      ? `Tích lũy thêm ${nextTargetRule.pointValue - currentPoints} điểm để đổi gói ${nextTargetRule.moneyValue.toLocaleString('vi-VN')}đ`
                      : `Bạn đang ở mốc đổi thưởng cao nhất! (${displayTarget.moneyValue.toLocaleString('vi-VN')}đ)`}
                  </p>
                </div>
                {currentPoints >= (conversionRules[0]?.pointValue || 0) && (
                  <button
                    onClick={() => window.location.href = '/rewards/exchange'}
                    className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                  >
                    Đổi điểm ngay
                  </button>
                )}
              </div>

              {/* Progress Bar */}
              <div className="relative pt-1">
                <div className="flex mb-2 items-center justify-between">
                  <span className="text-xs font-semibold inline-block text-blue-600 uppercase">
                    Tiến độ
                  </span>
                  <span className="text-xs font-semibold inline-block text-blue-600">
                    {Math.round(progressPercentage)}%
                  </span>
                </div>
                <div className="overflow-hidden h-3 mb-4 text-xs flex rounded-full bg-blue-100">
                  <div
                    style={{ width: `${progressPercentage}%` }}
                    className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-600 transition-all duration-500 ease-out"
                  ></div>
                </div>
                <div className="text-xs text-gray-500 text-center font-medium">
                  {progressText}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Main Content Tabs */}
        <div className="bg-white rounded-xl shadow-xs border border-gray-200 min-h-[400px]">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setRewardTab('available')}
              className={`flex-1 py-4 text-sm font-medium text-center transition-colors border-b-2 ${
                rewardTab === 'available'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Các gói quy đổi
            </button>
            <button
              onClick={() => setRewardTab('history')}
              className={`flex-1 py-4 text-sm font-medium text-center transition-colors border-b-2 ${
                rewardTab === 'history'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Lịch sử giao dịch
            </button>
          </div>

          <div className="p-6">
            {rewardTab === 'available' ? (
              <div className="space-y-4">
                <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mb-6">
                  <h4 className="font-semibold text-blue-800 mb-2">Bảng tỷ giá quy đổi hiện tại:</h4>
                  {conversionRules.length === 0 ? (
                    <p className="text-gray-600 italic">Chưa có quy tắc quy đổi nào.</p>
                  ) : (
                    <ul className="space-y-2">
                      {conversionRules.map((rule) => (
                        <li key={rule.id} className="flex items-center justify-between bg-white p-3 rounded border border-blue-100">
                          <span className="font-medium text-gray-700 flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                            Mốc {rule.pointValue} điểm
                          </span>
                          <span className="font-bold text-blue-600">
                            = {rule.moneyValue.toLocaleString('vi-VN')} VNĐ
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                  <p className="text-xs text-gray-500 mt-3 pt-3 border-t border-blue-100">
                    * Lưu ý: Khi đổi điểm, hệ thống sẽ tự động chọn gói có lợi nhất cho bạn (ưu tiên mốc cao).
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {transactions.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    Chưa có giao dịch nào phát sinh
                  </div>
                ) : (
                  transactions.map((transaction) => (
                    <div
                      key={transaction.id}
                      className="flex items-center justify-between p-4 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          transaction.type === 'earn' ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'
                        }`}>
                          {transaction.type === 'earn' ? '+' : '-'}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{transaction.description || transaction.typeDisplay}</p>
                          <p className="text-xs text-gray-500">
                            {new Date(transaction.createdAt).toLocaleString('vi-VN')}
                          </p>
                        </div>
                      </div>
                      <span className={`font-bold ${
                        transaction.type === 'earn' ? 'text-green-600' : 'text-orange-600'
                      }`}>
                        {transaction.type === 'earn' ? '+' : '-'}{transaction.value}
                      </span>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RewardDashboard;