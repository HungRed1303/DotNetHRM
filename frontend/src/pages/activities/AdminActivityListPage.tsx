import { useState, useEffect } from 'react';
import { Search, Calendar } from 'lucide-react';
import CompletedActivityCard from '../../components/activities/CompletedActivityCard';
import CompletedActivityDetailModal from '../../components/activities/CompletedActivityDetailModal';
import ActivityStatisticsModal from '../../components/activities/ActivityStatisticsModal';
import type { CompletedActivityData } from '../../types/activity';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchCompletedActivities } from '../../store/completedActivitySlice';

export default function AdminActivityListPage() {
  const dispatch = useAppDispatch();
  const { activities, loading, error } = useAppSelector((state) => state.completedActivity);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<CompletedActivityData['activityType'] | 'all'>('all');
  const [selectedActivity, setSelectedActivity] = useState<CompletedActivityData | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isStatisticsModalOpen, setIsStatisticsModalOpen] = useState(false);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;

  // Fetch completed activities on component mount
  useEffect(() => {
    dispatch(fetchCompletedActivities());
  }, [dispatch]);

  useEffect(() => {
    if (isDetailModalOpen || isStatisticsModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isDetailModalOpen, isStatisticsModalOpen]);

  const handleViewDetails = (activityId: string) => {
    const activity = activities.find(a => a.id === Number(activityId));
    if (activity) {
      setSelectedActivity(activity);
      setIsDetailModalOpen(true);
    }
  };

  const handleViewStatistics = (activityId: string) => {
    const activity = activities.find(a => a.id === Number(activityId));
    if (activity) {
      setSelectedActivity(activity);
      setIsStatisticsModalOpen(true);
    }
  };

  // Filter activities
  const filteredActivities = activities.filter(activity => {
    // Search filter
    const matchesSearch = activity.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         activity.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Type filter
    const matchesType = selectedType === 'all' || activity.activityType === selectedType;
    
    return matchesSearch && matchesType;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredActivities.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentActivities = filteredActivities.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Scroll to top of the page
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'auto'
    });
    // Also try scrolling the document element
    document.documentElement.scrollTop = 0;
  };

  return (
    <div className="h-full bg-gray-50">
      {/* Header and Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          {/* Header */}
          <div className="bg-linear-to-r from-blue-600 to-blue-700 p-6 shadow-lg">
            <div className="flex items-center space-x-3">
              <Calendar className="w-8 h-8 text-white" />
              <div className="text-2xl font-bold text-white">Quản lý hoạt động</div>
            </div>
          </div>

          {/* Filters */}
          <div className="p-6">
            <div className="flex flex-col gap-4">
              {/* Top row: Search + Type Filter */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Tìm kiếm hoạt động..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  />
                </div>

                {/* Type Filter */}
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <select
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value as CompletedActivityData['activityType'] | 'all')}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 appearance-none"
                  >
                    <option value="all">Tất cả loại</option>
                    <option value="sports">Thể thao</option>
                    <option value="charity">Từ thiện</option>
                    <option value="training">Đào tạo</option>
                    <option value="team-building">Team Building</option>
                    <option value="volunteer">Tình nguyện</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Activity Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-6">
        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Completed Activities */}
        {!loading && (
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Hoạt động đã hoàn thành
          </h2>
          
          {filteredActivities.length > 0 ? (
            <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {currentActivities.map((activity) => (
                <CompletedActivityCard
                  key={activity.id}
                  activity={activity}
                  onViewDetails={handleViewDetails}
                  onViewStatistics={handleViewStatistics}
                />
              ))}
            </div>
            
            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-8">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    currentPage === 1
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-white text-gray-700 hover:bg-blue-50 hover:text-blue-600 border border-gray-300'
                  }`}
                >
                  Trước
                </button>
                
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                  const showPage = page === 1 || 
                                 page === totalPages || 
                                 (page >= currentPage - 1 && page <= currentPage + 1);
                  
                  if (!showPage && page === currentPage - 2) {
                    return <span key={page} className="px-2 text-gray-400">...</span>;
                  }
                  if (!showPage && page === currentPage + 2) {
                    return <span key={page} className="px-2 text-gray-400">...</span>;
                  }
                  if (!showPage) return null;
                  
                  return (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                        currentPage === page
                          ? 'bg-blue-600 text-white'
                          : 'bg-white text-gray-700 hover:bg-blue-50 hover:text-blue-600 border border-gray-300'
                      }`}
                    >
                      {page}
                    </button>
                  );
                })}
                
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    currentPage === totalPages
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-white text-gray-700 hover:bg-blue-50 hover:text-blue-600 border border-gray-300'
                  }`}
                >
                  Sau
                </button>
              </div>
            )}
            </>
          ) : (
            <div className="bg-white rounded-lg shadow-sm p-12 text-center">
              <div className="flex flex-col items-center gap-4">
                <Calendar className="w-16 h-16 text-gray-300" />
                <h3 className="text-xl font-semibold text-gray-900">
                  Không tìm thấy hoạt động
                </h3>
                <p className="text-gray-600 max-w-md">
                  Không có hoạt động nào phù hợp với bộ lọc của bạn. 
                  Hãy thử điều chỉnh tiêu chí tìm kiếm.
                </p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedType('all');
                  }}
                  className="px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg transition-all"
                >
                  Đặt lại bộ lọc
                </button>
              </div>
            </div>
          )}
        </div>
        )}
      </div>

      {/* Activity Detail Modal */}
      {selectedActivity && (
        <CompletedActivityDetailModal
          activity={selectedActivity}
          isOpen={isDetailModalOpen}
          onClose={() => {
            setIsDetailModalOpen(false);
            setSelectedActivity(null);
          }}
          onViewStatistics={handleViewStatistics}
        />
      )}

      {/* Activity Statistics Modal */}
      {selectedActivity && (
        <ActivityStatisticsModal
          activity={selectedActivity}
          isOpen={isStatisticsModalOpen}
          onClose={() => {
            setIsStatisticsModalOpen(false);
            setSelectedActivity(null);
          }}
        />
      )}
    </div>
  );
}
