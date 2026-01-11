import { useState, useEffect } from 'react';
import { Search, Filter, Calendar } from 'lucide-react';
import { jwtDecode } from "jwt-decode";
import ActivityListCard from '../../components/activities/ActivityListCard';
import ActivityDetailModal from '../../components/activities/ActivityDetailModal';
import ConfirmRegistrationModal from '../../components/activities/ConfirmRegistrationModal';
import ActivityFormModal from '../../components/activities/ActivityFormModal';
import type { ActivityData } from '../../data/activityData';
import { getAllActivities, registerActivity, unregisterActivity, getMyParticipations, deleteActivity, updateActivity } from '../../services/activityService';
import type { Activity, CreateActivityRequest } from '../../types/activity';

export default function ActivityListPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<ActivityData['type'] | 'all'>('all');
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'open' | 'closed'>('all');
  const [selectedActivity, setSelectedActivity] = useState<ActivityData | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingActivity, setEditingActivity] = useState<ActivityData | null>(null);
  const [activityToRegister, setActivityToRegister] = useState<ActivityData | null>(null);
  
  const [userRole, setUserRole] = useState<string>('');

  const [activities, setActivities] = useState<ActivityData[]>([]);
  const [myParticipations, setMyParticipations] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;

  useEffect(() => {
      if (isModalOpen || isConfirmModalOpen || isEditModalOpen) {
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = 'unset';
      }
  
      return () => {
        document.body.style.overflow = 'unset';
      };
    }, [isModalOpen, isConfirmModalOpen, isEditModalOpen]);
  
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      try {
        const decoded: any = jwtDecode(token);
        console.log("Decoded Token:", decoded);
        setUserRole((decoded.role || '').toUpperCase());
      } catch (error) {
        console.error("Invalid token", error);
      }
    }
    fetchActivities();
    fetchMyParticipations();
  }, []);

  const fetchMyParticipations = async () => {
    try {
      const data = await getMyParticipations();
      setMyParticipations(data.map((p: any) => p.activityId));
    } catch (error) {
      console.error("Failed to fetch participations", error);
    }
  };

  const fetchActivities = async () => {
    try {
      setLoading(true);
      const response = await getAllActivities({ page: 1, pageSize: 100 }); // Fetch all for now
      const mappedActivities: ActivityData[] = response.activities.map((a: Activity) => ({
        id: a.id.toString(),
        name: a.name,
        description: a.description,
        startDate: a.startDate,
        endDate: a.endDate,
        registrationStart: a.registrationStartDate,
        registrationEnd: a.registrationEndDate,
        maxParticipants: a.maxParticipants,
        currentParticipants: a.currentParticipants || 0,
        location: a.location,
        type: a.activityType as any,
        status: a.status as any,
        imageUrl: a.imageUrl,
        organizer: a.organizer,
        points: a.points
      }));
      setActivities(mappedActivities);
    } catch (error) {
      console.error("Failed to fetch activities", error);
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

  const handleRegister = (activityId: string) => {
    const activity = activities.find(a => a.id === activityId);
    if (activity) {
      setActivityToRegister(activity);
      setIsConfirmModalOpen(true);
    }
  };

  const handleConfirmRegister = async () => {
    if (activityToRegister) {
      try {
        await registerActivity(Number(activityToRegister.id));
        alert(`Đăng ký thành công: ${activityToRegister.name}`);
        setIsConfirmModalOpen(false);
        setActivityToRegister(null);
        // Refresh data
        fetchActivities();
        fetchMyParticipations();
      } catch (error) {
        console.error("Registration failed", error);
        alert("Đăng ký thất bại. Vui lòng thử lại.");
      }
    }
  };

  const handleUnregister = async (activityId: string) => {
    if (window.confirm("Bạn có chắc chắn muốn hủy đăng ký hoạt động này không?")) {
      try {
        await unregisterActivity(Number(activityId));
        alert("Hủy đăng ký thành công");
        fetchActivities();
        fetchMyParticipations();
      } catch (error) {
        console.error("Unregistration failed", error);
        alert("Hủy đăng ký thất bại. Vui lòng thử lại.");
      }
    }
  };

  const handleDeleteActivity = async (activityId: string) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa hoạt động này không? Hành động này không thể hoàn tác.")) {
      try {
        await deleteActivity(Number(activityId));
        alert("Xóa hoạt động thành công");
        fetchActivities();
      } catch (error) {
        console.error("Delete failed", error);
        alert("Xóa hoạt động thất bại. Vui lòng thử lại.");
      }
    }
  };

  const handleEditClick = (activity: ActivityData) => {
    setEditingActivity(activity);
    setIsEditModalOpen(true);
  };

  const handleUpdateActivity = async (data: CreateActivityRequest) => {
    if (editingActivity) {
      try {
        await updateActivity(Number(editingActivity.id), data);
        alert("Cập nhật hoạt động thành công");
        setIsEditModalOpen(false);
        setEditingActivity(null);
        fetchActivities();
      } catch (error) {
        console.error("Update failed", error);
        alert("Cập nhật hoạt động thất bại. Vui lòng thử lại.");
      }
    }
  };

  // Filter activities
  const filteredActivities = activities.filter(activity => {
    // Search filter
    const matchesSearch = activity.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      activity.description.toLowerCase().includes(searchQuery.toLowerCase());

    // Type filter
    const matchesType = selectedType === 'all' || activity.type === selectedType;

    // Status filter
    let matchesStatus = true;
    if (selectedStatus !== 'all') {
      const now = new Date();
      const regStart = new Date(activity.registrationStart);
      const regEnd = new Date(activity.registrationEnd);
      const isOpen = now >= regStart && now <= regEnd;

      matchesStatus = selectedStatus === 'open' ? isOpen : !isOpen;
    }

    return matchesSearch && matchesType && matchesStatus;
  });

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedType, selectedStatus]);

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
          <div className="bg-linear-to-r from-blue-600 to-blue-700 text-white px-8 py-6">
            <div className="flex items-center gap-3 mb-2">
              <Calendar className="w-8 h-8" />
              <h1 className="text-3xl font-bold">
                Danh sách hoạt động
              </h1>
            </div>
          </div>

          {/* Filters Section */}
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value as ActivityData['type'] | 'all')}
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

              {/* Status Filter */}
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value as 'all' | 'open' | 'closed')}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 appearance-none"
                >
                  <option value="all">Tất cả trạng thái</option>
                  <option value="open">Đang mở đăng ký</option>
                  <option value="closed">Đã đóng đăng ký</option>
                </select>
              </div>
            </div>

            {/* Results Count */}
            <div className="mt-4 text-sm text-gray-600">
              Hiển thị <span className="font-semibold">{startIndex + 1}-{Math.min(endIndex, filteredActivities.length)}</span> trong tổng số <span className="font-semibold">{filteredActivities.length}</span> hoạt động
            </div>
          </div>
        </div>

        {/* Activity Grid */}
        <div className="mt-6 space-y-8">
          {/* Available Activities Section */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Danh sách hoạt động
            </h2>
            
            {filteredActivities.length > 0 ? (
              <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {currentActivities.map((activity) => (
                  <ActivityListCard
                    key={activity.id}
                    activity={activity}
                    onViewDetails={handleViewDetails}
                    onRegister={handleRegister}
                    onUnregister={handleUnregister}
                    onDelete={handleDeleteActivity}
                    onEdit={handleEditClick}
                    isRegistered={myParticipations.includes(Number(activity.id))}
                    userRole={userRole}
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
                      setSelectedStatus('all');
                    }}
                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all"
                  >
                    Đặt lại bộ lọc
                  </button>
                </div>
              </div>
            )}
          </div>
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
          onRegister={handleRegister}
          onUnregister={handleUnregister}
          isRegistered={myParticipations.includes(Number(selectedActivity.id))}
          userRole={userRole}
        />
      )}

      {/* Confirm Registration Modal */}
      {activityToRegister && (
        <ConfirmRegistrationModal
          isOpen={isConfirmModalOpen}
          activityName={activityToRegister.name}
          onConfirm={handleConfirmRegister}
          onCancel={() => {
            setIsConfirmModalOpen(false);
            setActivityToRegister(null);
          }}
        />
      )}

      {/* Edit Activity Modal */}
      {editingActivity && (
        <ActivityFormModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setEditingActivity(null);
          }}
          onSubmit={handleUpdateActivity}
          initialData={editingActivity}
          title="Chỉnh sửa hoạt động"
        />
      )}
    </div>
  );
}
