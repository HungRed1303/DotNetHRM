import { useState, useEffect } from 'react';
import { Search, Filter, Calendar, CheckCircle } from 'lucide-react';
import ActivityListCard from '../../components/activities/ActivityListCard';
import ActivityDetailModal from '../../components/activities/ActivityDetailModal';
import type { ActivityData } from '../../data/activityData';
import { getMyParticipations, unregisterActivity } from '../../services/activityService';
import type { MyParticipationResponse } from '../../types/activity';

export default function HistoryActivitiesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<ActivityData['type'] | 'all'>('all');
  const [selectedActivity, setSelectedActivity] = useState<ActivityData | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activities, setActivities] = useState<ActivityData[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;

  useEffect(() => {
    fetchMyActivities();
  }, []);

  const fetchMyActivities = async () => {
    try {
      setLoading(true);
      const data = await getMyParticipations();
      const mappedActivities: ActivityData[] = data.map((p: MyParticipationResponse) => ({
        id: p.activityId.toString(),
        name: p.activityName,
        description: p.description,
        startDate: p.startDate,
        endDate: p.endDate,
        registrationStart: p.registrationStartDate,
        registrationEnd: p.registrationEndDate,
        maxParticipants: p.maxParticipants,
        currentParticipants: p.currentParticipants || 0,
        location: p.location,
        type: p.activityType as any,
        status: p.activityStatus as any,
        imageUrl: p.imageUrl,
        organizer: p.organizer,
        points: p.points
      }));
      setActivities(mappedActivities);
    } catch (error) {
      console.error("Failed to fetch my activities", error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (activityId: string) => {
    const activity = activities.find(a => a.id === activityId);
    if (activity) {
      setSelectedActivity(activity);
      setIsModalOpen(true);
    }
  };

  const handleUnregister = async (activityId: string) => {
    const activity = activities.find(a => a.id === activityId);
    if (activity && window.confirm(`Bạn có chắc muốn hủy đăng ký hoạt động "${activity.name}"?`)) {
      try {
        await unregisterActivity(Number(activityId));
        alert(`Đã hủy đăng ký: ${activity.name}`);
        fetchMyActivities(); // Refresh list
      } catch (error) {
        console.error("Unregister failed", error);
        alert("Hủy đăng ký thất bại. Vui lòng thử lại.");
      }
    }
  };

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedType]);

  // Filter registered activities
  const filteredActivities = activities.filter(activity => {
    // Search filter
    const matchesSearch = activity.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         activity.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Type filter
    const matchesType = selectedType === 'all' || activity.type === selectedType;
    
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
      {/* Header and Filters Combined */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Header Section */}
          <div className="bg-linear-to-r from-green-600 to-green-700 text-white px-8 py-6">
            <div className="flex items-center gap-3 mb-2">
              <CheckCircle className="w-8 h-8" />
              <h1 className="text-3xl font-bold">
                Hoạt động đã đăng ký
              </h1>
            </div>
            <p className="text-green-100">
              Danh sách các hoạt động bạn đã đăng ký tham gia
            </p>
          </div>

          {/* Filters Section */}
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Tìm kiếm hoạt động..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-green-500"
                />
              </div>

              {/* Type Filter */}
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value as ActivityData['type'] | 'all')}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-green-500 appearance-none"
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

            {/* Results Count */}
            <div className="mt-4 text-sm text-gray-600">
              {filteredActivities.length > 0 ? (
                <>
                  Hiển thị <span className="font-semibold">{startIndex + 1}-{Math.min(endIndex, filteredActivities.length)}</span> trong tổng số <span className="font-semibold">{filteredActivities.length}</span> hoạt động đã đăng ký
                </>
              ) : (
                <>Bạn đã đăng ký <span className="font-semibold">0</span> hoạt động</>
              )}
            </div>
          </div>
        </div>

        {/* Activity Grid */}
        <div className="mt-6">
          {loading ? (
             <div className="text-center py-12">Đang tải...</div>
          ) : filteredActivities.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {currentActivities.map((activity) => (
                  <ActivityListCard
                    key={activity.id}
                    activity={activity}
                    onViewDetails={handleViewDetails}
                    onRegister={() => {}}
                    onUnregister={handleUnregister}
                    isRegistered={true}
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
                        : 'bg-white text-gray-700 hover:bg-green-50 hover:text-green-600 border border-gray-300'
                    }`}
                  >
                    Trước
                  </button>
                  
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                    // Show first page, last page, current page, and pages around current
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
                            ? 'bg-green-600 text-white'
                            : 'bg-white text-gray-700 hover:bg-green-50 hover:text-green-600 border border-gray-300'
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
                        : 'bg-white text-gray-700 hover:bg-green-50 hover:text-green-600 border border-gray-300'
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
                  Chưa có hoạt động đã đăng ký
                </h3>
                <p className="text-gray-600 max-w-md">
                  Bạn chưa đăng ký hoạt động nào. 
                  Hãy khám phá các hoạt động mới và đăng ký tham gia!
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Activity Detail Modal */}
      {selectedActivity && (
        <ActivityDetailModal
          activity={selectedActivity}
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedActivity(null);
          }}
          onRegister={() => {}}
          onUnregister={handleUnregister}
          isRegistered={true}
        />
      )}
    </div>
  );
}
