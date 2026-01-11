import { useEffect, useState } from 'react';
import { Search, Loader2, CircleStar, AlertCircle } from 'lucide-react';
import ActivityListResultCard from '../../components/activities/ActivityListResultCard';
import ActivityResultModal from '../../components/activities/ActivityResultModal';
import { fetchActivityEmployeeAttended } from '../../store/participationSlice'
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import type { ParticipationData } from '../../types/activity';

export default function ActivityPrivateResultPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedActivity, setSelectedActivity] = useState<ParticipationData | null>(null);
    const [isResultModalOpen, setIsResultModalOpen] = useState(false);

    const currentEmployeeId = parseInt(localStorage.getItem('userId') || '1');

    const dispatch = useAppDispatch();
    const { participation, loading: loadingParticipation, error: participationError } = useAppSelector((state) => state.participation);

    useEffect(() => {
        dispatch(fetchActivityEmployeeAttended(currentEmployeeId));
    }, [dispatch]);


    const handleViewResult = (activityId: number) => {
        const activity = participation.find(a => a.activityId === activityId);
        if (activity) {
            setSelectedActivity(activity);
            setIsResultModalOpen(true);
        }
    }

    const myActivities = participation.filter(activity => {
        // Search filter
        const matchesSearch = activity.activityName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            activity.description.toLowerCase().includes(searchQuery.toLowerCase());

        return matchesSearch
    });

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header and Filters Combined */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                    {/* Header Section */}
                    <div className="bg-linear-to-r from-blue-600 to-blue-700 text-white px-8 py-6">
                        <div className="flex items-center gap-3 mb-2">
                            <CircleStar className="w-8 h-8" />
                            <h1 className="text-3xl font-bold">
                                Thành tích của bạn
                            </h1>
                        </div>
                        <p className="text-blue-100">
                            Ghi nhận kết quả của bạn trong các hoạt động
                        </p>
                    </div>

                    {/* Filters Section */}
                    <div className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
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
                        </div>
                        {/* Activity Grid */}
                        <div className="mt-6">
                            {loadingParticipation ? (

                                <div className="flex justify-center items-center">
                                    <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
                                    <span className="ml-3 text-gray-600">Đang tải dữ liệu...</span>
                                </div>

                            ) : participationError ? (

                                <div className="flex flex-col items-center text-red-600">
                                    <AlertCircle className="h-12 w-12 mb-2" />
                                    <p className="font-medium">Có lỗi xảy ra</p>
                                    <p className="text-sm mt-1">{participationError}</p>
                                </div>

                            ) : myActivities.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {myActivities.map((activity) => (
                                        <ActivityListResultCard
                                            key={activity.id}
                                            activity={activity}
                                            onViewResult={handleViewResult}
                                        />
                                    ))}
                                </div>
                            ) : (
                                <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                                    <div className="flex flex-col items-center gap-4">
                                        <CircleStar className="w-16 h-16 text-gray-300" />
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
                                            }}
                                            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all"
                                            style={{
                                                transition: 'all 0.3s ease'
                                            }}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.transform = 'translateY(-2px)';
                                                e.currentTarget.style.boxShadow = '0 5px 20px rgba(37, 99, 235, 0.4)';
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.transform = 'translateY(0)';
                                                e.currentTarget.style.boxShadow = 'none';
                                            }}
                                        >
                                            Đặt lại bộ lọc
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            {selectedActivity && (
                <ActivityResultModal
                    participation={selectedActivity}
                    isOpen={isResultModalOpen}
                    onClose={() => {
                        setIsResultModalOpen(false);
                        setSelectedActivity(null);
                    }}
                />
            )}
        </div>
    )
}