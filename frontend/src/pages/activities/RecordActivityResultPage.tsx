import { useState, useEffect, memo, useCallback } from 'react';
import { Search, Save, CheckCircle, AlertCircle, Users, Calendar, ClipboardList, XCircle } from 'lucide-react';
import { participationService } from '../../services/participationService';
import { getAllActivities } from '../../services/activityService';
import type { Activity } from '../../types/activity';

// --- INTERFACES ---
interface ParticipantWithResult {
  id: number;
  employeeId: number;
  activityId: number;
  employeeName: string;
  employeeCode: string;
  status: string;
  result: Record<string, any> | null;
}

interface ResultFormProps {
  employeeId: number;
  form: any;
  activityType: string;
  activityName: string;
  onFormChange: (employeeId: number, field: string, value: any) => void;
}

interface CommonFieldsProps {
  form: any;
  employeeId: number;
  onFormChange: (employeeId: number, field: string, value: any) => void;
}

// --- COMPONENTS CON ---
const CommonFields = ({ form, employeeId, onFormChange }: CommonFieldsProps) => (
  <div className="space-y-3">
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Ghi chú
      </label>
      <textarea
        value={form.note || ''}
        onChange={(e) => onFormChange(employeeId, 'note', e.target.value)}
        rows={2}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
        placeholder="Ghi chú thêm..."
      />
    </div>
  </div>
);

const ResultForm = memo(({ employeeId, form, activityType, activityName, onFormChange }: ResultFormProps) => {
  const isSwimming = activityName.includes('bơi') || activityName.includes('swim');
  const commonProps = { form, employeeId, onFormChange };

  if (activityType === 'sports') {
    if (isSwimming) {
      return (
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
            🏊 Bơi lội
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Kiểu bơi <span className="text-red-500">*</span>
              </label>
              <select
                value={form.style || ''}
                onChange={(e) => onFormChange(employeeId, 'style', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              >
                <option value="">-- Chọn kiểu bơi --</option>
                <option value="freestyle">Bơi tự do (Freestyle)</option>
                <option value="backstroke">Bơi ngửa (Backstroke)</option>
                <option value="breaststroke">Bơi ếch (Breaststroke)</option>
                <option value="butterfly">Bơi bướm (Butterfly)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Khoảng cách (mét) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="1"
                max="10000"
                value={form.distance_m || ''}
                onChange={(e) => onFormChange(employeeId, 'distance_m', e.target.value)}
                placeholder="50, 100, 200..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Thời gian hoàn thành <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.time || ''}
                onChange={(e) => onFormChange(employeeId, 'time', e.target.value)}
                placeholder="HH:mm:ss (vd: 00:25:30)"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">Định dạng: 00:25:30</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Thứ hạng
              </label>
              <input
                type="number"
                min="1"
                value={form.rank || ''}
                onChange={(e) => onFormChange(employeeId, 'rank', e.target.value)}
                placeholder="1, 2, 3..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
          <CommonFields {...commonProps} />
        </div>
      );
    } else {
      return (
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
            🏃 Chạy bộ
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Thời gian hoàn thành <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.time || ''}
                onChange={(e) => onFormChange(employeeId, 'time', e.target.value)}
                placeholder="HH:mm:ss (vd: 01:30:45)"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">Định dạng: 01:30:45</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Khoảng cách (km) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                step="0.1"
                min="0.1"
                max="1000"
                value={form.distance_km || ''}
                onChange={(e) => onFormChange(employeeId, 'distance_km', e.target.value)}
                placeholder="5.0, 10.0, 21.0..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Thứ hạng
              </label>
              <input
                type="number"
                min="1"
                value={form.rank || ''}
                onChange={(e) => onFormChange(employeeId, 'rank', e.target.value)}
                placeholder="1, 2, 3..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Pace (phút/km)
              </label>
              <input
                type="text"
                value={form.pace_per_km || ''}
                onChange={(e) => onFormChange(employeeId, 'pace_per_km', e.target.value)}
                placeholder="05:30"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
          <CommonFields {...commonProps} />
        </div>
      );
    }
  }

  if (activityType === 'training') {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Số giờ tham dự <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              value={form.attendance_hours || ''}
              onChange={(e) => onFormChange(employeeId, 'attendance_hours', e.target.value)}
              placeholder="8"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Điểm kiểm tra (0-100)
            </label>
            <input
              type="number"
              min="0"
              max="100"
              value={form.quiz_score || ''}
              onChange={(e) => onFormChange(employeeId, 'quiz_score', e.target.value)}
              placeholder="85"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ngày hoàn thành
            </label>
            <input
              type="date"
              value={form.completion_date || ''}
              onChange={(e) => onFormChange(employeeId, 'completion_date', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            />
          </div>
          <div className="flex items-center pt-6">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.certificate_issued || false}
                onChange={(e) => onFormChange(employeeId, 'certificate_issued', e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700">
                Đã cấp chứng chỉ
              </span>
            </label>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nhận xét
          </label>
          <textarea
            value={form.feedback || ''}
            onChange={(e) => onFormChange(employeeId, 'feedback', e.target.value)}
            rows={2}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            placeholder="Nhận xét về quá trình học tập..."
          />
        </div>
      </div>
    );
  }

  if (activityType === 'volunteer') {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Số giờ đóng góp <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              step="0.5"
              value={form.hours_contributed || ''}
              onChange={(e) => onFormChange(employeeId, 'hours_contributed', e.target.value)}
              placeholder="8.0"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Công nhận
            </label>
            <input
              type="text"
              value={form.recognition || ''}
              onChange={(e) => onFormChange(employeeId, 'recognition', e.target.value)}
              placeholder="Giấy khen, bằng khen..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tác động
          </label>
          <textarea
            value={form.impact || ''}
            onChange={(e) => onFormChange(employeeId, 'impact', e.target.value)}
            rows={2}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            placeholder="Mô tả tác động của hoạt động..."
          />
        </div>
        <CommonFields {...commonProps} />
      </div>
    );
  }

  if (activityType === 'team-building') {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tên đội
            </label>
            <input
              type="text"
              value={form.team_name || ''}
              onChange={(e) => onFormChange(employeeId, 'team_name', e.target.value)}
              placeholder="Team Alpha"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Thứ hạng đội
            </label>
            <input
              type="number"
              value={form.team_rank || ''}
              onChange={(e) => onFormChange(employeeId, 'team_rank', e.target.value)}
              placeholder="1"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Điểm đạt được
          </label>
          <input
            type="number"
            value={form.points_earned || ''}
            onChange={(e) => onFormChange(employeeId, 'points_earned', e.target.value)}
            placeholder="100"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
          />
        </div>
        <CommonFields {...commonProps} />
      </div>
    );
  }

  return <CommonFields {...commonProps} />;
});

ResultForm.displayName = 'ResultForm';

// --- MAIN PAGE ---
export default function RecordActivityResultPage() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [selectedActivityId, setSelectedActivityId] = useState<number | null>(null);
  const [participants, setParticipants] = useState<ParticipantWithResult[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [savingId, setSavingId] = useState<number | null>(null);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [resultForms, setResultForms] = useState<Record<number, any>>({});
  const [activeTab, setActiveTab] = useState<'pending' | 'completed'>('pending');

  useEffect(() => {
    fetchActivities();
  }, []);

  useEffect(() => {
    if (selectedActivityId) {
      fetchParticipants(selectedActivityId);
    }
  }, [selectedActivityId]);

  const hasValidResult = (result: any) => {
    if (!result) return false;
    if (Object.keys(result).length === 0) return false;
    return true;
  };

  const fetchActivities = async () => {
    try {
      setLoading(true);
      const response = await getAllActivities({ page: 1, pageSize: 100 });
      const completedActivities = response.activities.filter(
        (a: Activity) => a.status === 'completed' || a.status === 'ongoing'
      );
      setActivities(completedActivities);
    } catch (error) {
      console.error('Failed to fetch activities', error);
      alert('Không thể tải danh sách hoạt động');
    } finally {
      setLoading(false);
    }
  };

  const fetchParticipants = async (activityId: number) => {
    try {
      setLoading(true);
      const data = await participationService.getActivityParticipants(activityId);
      
      const attendedParticipants = data
        .filter(p => p.status === 'attended')
        .map(p => ({
          id: p.id,
          employeeId: p.employeeId,
          activityId: p.activityId,
          employeeName: p.employeeName,
          employeeCode: `EMP${p.employeeId.toString().padStart(3, '0')}`,
          status: p.status,
          result: p.result,
        }));
      
      setParticipants(attendedParticipants);
      
      const forms: Record<number, any> = {};
      attendedParticipants.forEach(p => {
        forms[p.employeeId] = p.result || {};
      });
      setResultForms(forms);

      const activity = activities.find(a => a.id === activityId);
      setSelectedActivity(activity || null);
    } catch (error) {
      console.error('Failed to fetch participants', error);
      alert('Không thể tải danh sách người tham gia');
    } finally {
      setLoading(false);
    }
  };

  const handleFormChange = useCallback((employeeId: number, field: string, value: any) => {
    setResultForms(prev => ({
      ...prev,
      [employeeId]: {
        ...prev[employeeId],
        [field]: value,
      }
    }));
  }, []);

  const handleSaveResult = async (employeeId: number) => {
    if (!selectedActivityId) return;

    try {
      setSavingId(employeeId);
      
      const rawData = resultForms[employeeId];
      const resultData = { ...rawData };
      
      // Convert data types
      if (resultData.distance_m) resultData.distance_m = parseInt(resultData.distance_m) || 0;
      if (resultData.distance_km) resultData.distance_km = parseFloat(resultData.distance_km) || 0;
      if (resultData.rank) resultData.rank = parseInt(resultData.rank) || 0;
      if (resultData.attendance_hours) resultData.attendance_hours = parseInt(resultData.attendance_hours) || 0;
      if (resultData.quiz_score) resultData.quiz_score = parseInt(resultData.quiz_score) || 0;
      if (resultData.hours_contributed) resultData.hours_contributed = parseFloat(resultData.hours_contributed) || 0;
      if (resultData.team_rank) resultData.team_rank = parseInt(resultData.team_rank) || 0;
      if (resultData.points_earned) resultData.points_earned = parseInt(resultData.points_earned) || 0;
      
      await participationService.updateParticipationResult(
        selectedActivityId,
        employeeId,
        { resultData }
      );

      alert('Đã lưu kết quả thành công!');
      await fetchParticipants(selectedActivityId);
    } catch (error) {
      console.error('Failed to save result', error);
      alert('Lỗi khi lưu kết quả. Vui lòng thử lại.');
    } finally {
      setSavingId(null);
    }
  };

  // Logic lọc và tính toán
  const searchedParticipants = participants.filter(p =>
    p.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.employeeCode.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const pendingCount = searchedParticipants.filter(p => !hasValidResult(p.result)).length;
  const completedCount = searchedParticipants.filter(p => hasValidResult(p.result)).length;

  const displayedParticipants = searchedParticipants.filter(p => {
    const hasResult = hasValidResult(p.result);
    if (activeTab === 'completed') return hasResult;
    return !hasResult; 
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-6">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-8 py-6">
            <div className="flex items-center gap-3 mb-2">
              <ClipboardList className="w-8 h-8" />
              <h1 className="text-3xl font-bold">Ghi nhận thành tích</h1>
            </div>
            <p className="text-blue-100">
              Ghi nhận kết quả tham gia hoạt động cho nhân viên
            </p>
          </div>

          <div className="p-6 border-b border-gray-200">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Chọn hoạt động <span className="text-red-500">*</span>
            </label>
            <select
              value={selectedActivityId || ''}
              onChange={(e) => setSelectedActivityId(Number(e.target.value))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            >
              <option value="">-- Chọn hoạt động --</option>
              {activities.map(activity => (
                <option key={activity.id} value={activity.id}>
                  {activity.name} - {activity.status === 'completed' ? 'Đã hoàn thành' : 'Đang diễn ra'}
                </option>
              ))}
            </select>
          </div>

          {selectedActivityId && (
            <div className="px-6 pt-6">
              {/* ✅ 1. Khôi phục phần đếm số người tham gia (tổng) */}
              <div className="mb-4 flex items-center gap-2 text-gray-700 font-medium">
                <div className="bg-blue-100 p-2 rounded-lg">
                  <Users className="w-5 h-5 text-blue-600" />
                </div>
                <span>
                   Tổng số người tham gia: <span className="text-blue-600 font-bold text-lg">{participants.length}</span>
                </span>
              </div>

              <div className="relative mb-6">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Tìm kiếm nhân viên..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex border-b border-gray-200">
                <button
                  onClick={() => setActiveTab('pending')}
                  className={`flex items-center gap-2 px-6 py-3 font-medium text-sm transition-colors border-b-2 ${
                    activeTab === 'pending'
                      ? 'border-orange-500 text-orange-600 bg-orange-50'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <AlertCircle className="w-4 h-4" />
                  Chưa nhập
                  <span className={`ml-1 px-2 py-0.5 rounded-full text-xs ${
                    activeTab === 'pending' ? 'bg-orange-200 text-orange-800' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {pendingCount}
                  </span>
                </button>
                <button
                  onClick={() => setActiveTab('completed')}
                  className={`flex items-center gap-2 px-6 py-3 font-medium text-sm transition-colors border-b-2 ${
                    activeTab === 'completed'
                      ? 'border-green-500 text-green-600 bg-green-50'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <CheckCircle className="w-4 h-4" />
                  Đã nhập
                  <span className={`ml-1 px-2 py-0.5 rounded-full text-xs ${
                    activeTab === 'completed' ? 'bg-green-200 text-green-800' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {completedCount}
                  </span>
                </button>
              </div>
            </div>
          )}
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Đang tải dữ liệu...</p>
          </div>
        ) : selectedActivityId ? (
          displayedParticipants.length > 0 ? (
            <div className="space-y-4">
              {displayedParticipants.map(participant => (
                <div key={participant.employeeId} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                  <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-blue-600 font-bold text-lg">
                            {participant.employeeName.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            {participant.employeeName}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {participant.employeeCode}
                          </p>
                        </div>
                      </div>
                      
                      {hasValidResult(participant.result) && (
                        <span className="px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" />
                          Đã hoàn thành
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="p-6">
                    <ResultForm
                      employeeId={participant.employeeId}
                      form={resultForms[participant.employeeId] || {}}
                      activityType={selectedActivity?.activityType || 'training'}
                      activityName={selectedActivity?.name?.toLowerCase() || ''}
                      onFormChange={handleFormChange}
                    />

                    <div className="mt-6 flex justify-end gap-3">
                      <button
                        onClick={() => handleSaveResult(participant.employeeId)}
                        disabled={savingId === participant.employeeId}
                        className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                      >
                        <Save className="w-4 h-4" />
                        {savingId === participant.employeeId ? 'Đang lưu...' : 'Lưu kết quả'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            // ✅ 2. Sửa Logic Empty State: Check searchQuery trước
            <div className="bg-white rounded-lg shadow-sm p-12 text-center">
              {searchQuery ? (
                // Trường hợp A: Có search nhưng không ra kết quả
                <>
                  <XCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Không tìm thấy nhân viên
                  </h3>
                  <p className="text-gray-600">
                    Không có nhân viên nào khớp với từ khóa "{searchQuery}" trong danh sách {activeTab === 'pending' ? 'chưa nhập' : 'đã nhập'}.
                  </p>
                </>
              ) : activeTab === 'pending' ? (
                // Trường hợp B: Không search, tab chưa nhập trống -> Tức là đã làm xong hết
                <>
                  <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Tuyệt vời! Đã nhập hết kết quả
                  </h3>
                  <p className="text-gray-600">
                    Tất cả nhân viên tham gia đã được ghi nhận kết quả.
                  </p>
                </>
              ) : (
                // Trường hợp C: Tab đã nhập trống
                <>
                  <AlertCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Chưa có kết quả nào
                  </h3>
                  <p className="text-gray-600">
                    Danh sách những người đã hoàn thành sẽ xuất hiện ở đây sau khi bạn nhập liệu.
                  </p>
                </>
              )}
            </div>
          )
        ) : (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Chọn hoạt động để bắt đầu
            </h3>
            <p className="text-gray-600">
              Vui lòng chọn một hoạt động từ danh sách phía trên
            </p>
          </div>
        )}
      </div>
    </div>
  );
}