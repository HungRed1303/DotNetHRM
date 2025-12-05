import React, { useState } from 'react';
import { mockRewardStats, mockNextReward, mockPointTransactions, mockRewardItems } from '../../data/rewardData';

const RewardDashboard: React.FC = () => {
  const [rewardTab, setRewardTab] = useState<'available' | 'history'>('available');
  const stats = mockRewardStats;
  const nextReward = mockNextReward;
  const transactions = mockPointTransactions;
  const rewardItems = mockRewardItems;

  const progressPercentage = (nextReward.currentProgress / nextReward.maxProgress) * 100;
  
  // Phân loại phần thưởng
  const availableRewards = rewardItems.filter(item => item.pointsRequired <= stats.currentPoints);
  const upcomingRewards = rewardItems.filter(item => item.pointsRequired > stats.currentPoints);

  return (
    <div className="w-full p-4 sm:p-6 lg:p-8 bg-gray-50 min-h-screen">
      {/* Page Header */}
      <div className="mb-6 sm:mb-8 text-center">
        <h1 className="text-blue-600 text-xl sm:text-2xl lg:text-3xl font-semibold mb-2 sm:mb-3">
          Điểm thưởng của tôi
        </h1>
        <p className="text-gray-600 text-sm sm:text-base px-4">Xin chào Nguyễn Văn An, đây là thông tin điểm thưởng của bạn</p>
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
      <div className="bg-white border border-gray-200 rounded-xl p-4 sm:p-6 mb-6 sm:mb-8">
        <h3 className="text-gray-800 font-semibold text-base sm:text-lg mb-3 sm:mb-4">Phần thưởng tiếp theo</h3>
        <div className="mb-4">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-2 gap-2">
            <div className="flex-1">
              <h4 className="font-medium text-gray-800 text-sm sm:text-base">{nextReward.title}</h4>
              <p className="text-xs sm:text-sm text-gray-600">{nextReward.description}</p>
            </div>
            <div className="text-left sm:text-right">
              <span className="text-sm font-medium text-blue-600">{nextReward.daysRemaining} điểm nữa</span>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="relative">
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="bg-linear-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-300"
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-xs text-gray-600 mt-1">
              <span>{nextReward.currentProgress} / {nextReward.maxProgress} điểm</span>
            </div>
          </div>
        </div>
      </div>

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
              Phần thưởng khả dụng
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
                  <p className="font-medium mb-1">Bằng quy đổi điểm thưởng: 100 điểm = 100,000đ / 500 điểm = 1 ngày nghỉ phép</p>
                </div>
              </div>

              {/* Available Rewards */}
              <div className="mb-6 sm:mb-8">
                <h3 className="text-gray-900 font-semibold text-base sm:text-lg mb-3 sm:mb-4">Có thể đổi ngay ({availableRewards.length})</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
                  {availableRewards.map((item) => (
                    <div
                      key={item.id}
                      className="border border-gray-200 bg-white rounded-lg p-4 sm:p-5 hover:shadow-md transition-shadow relative"
                    >
                      <div className="absolute top-3 right-3">
                        <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div className="flex items-start gap-3 sm:gap-4 mb-3">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-lg flex items-center justify-center shrink-0">
                          <svg className="w-6 h-6 sm:w-7 sm:h-7 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 mb-1 text-sm sm:text-base">{item.name}</h4>
                          <p className="text-xs sm:text-sm text-gray-600">{item.description}</p>
                        </div>
                      </div>
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
                        <span className="px-2 sm:px-3 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                          {item.pointsRequired} điểm
                        </span>
                        <div className="px-2 sm:px-4 py-1 sm:py-2 text-green-600 text-xs sm:text-sm font-medium">
                          Đủ điểm để đổi
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Upcoming Rewards */}
              <div>
                <h3 className="text-gray-900 font-semibold text-base sm:text-lg mb-3 sm:mb-4">Phần thưởng sắp đạt được ({upcomingRewards.length})</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
                  {upcomingRewards.map((item) => (
                    <div
                      key={item.id}
                      className="border border-gray-200 bg-gray-50 rounded-lg p-4 sm:p-5 relative opacity-75"
                    >
                      <div className="absolute top-3 right-3">
                        <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                      </div>
                      <div className="flex items-start gap-3 sm:gap-4 mb-3">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-200 rounded-lg flex items-center justify-center shrink-0">
                          <svg className="w-6 h-6 sm:w-7 sm:h-7 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-700 mb-1 text-sm sm:text-base">{item.name}</h4>
                          <p className="text-xs sm:text-sm text-gray-600">{item.description}</p>
                        </div>
                      </div>
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
                        <span className="px-2 sm:px-3 py-1 bg-gray-200 text-gray-600 text-xs font-medium rounded-full">
                          {item.pointsRequired} điểm
                        </span>
                        <span className="text-xs sm:text-sm text-gray-500">
                          Còn thiếu {item.pointsRequired - stats.currentPoints} điểm
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {transactions.map((transaction) => (
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
                      <h4 className="font-medium text-gray-800 text-sm sm:text-base">{transaction.description}</h4>
                      <p className="text-xs sm:text-sm text-gray-500">{new Date(transaction.date).toLocaleDateString('vi-VN')}</p>
                    </div>
                  </div>
                  <div className="text-left sm:text-right w-full sm:w-auto">
                    <div className={`text-base sm:text-lg font-semibold ${
                      transaction.type === 'earn' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {transaction.type === 'earn' ? '+' : ''}{transaction.amount} điểm
                    </div>
                    <div className={`text-xs px-2 py-1 rounded-full inline-block ${
                      transaction.status === 'completed' 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {transaction.status === 'completed' ? 'Hoàn thành' : 'Đang xử lý'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RewardDashboard;
