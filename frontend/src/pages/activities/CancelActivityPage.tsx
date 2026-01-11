import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { deleteActivity } from "../../services/activityService";

export default function CancelActivityPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const activityData = location.state;

  const [reason, setReason] = useState("");
  const canSubmit = reason.length >= 30;

  // Nếu không có data từ state (route trực tiếp), hiển thị cảnh báo
  if (!activityData) {
    return (
      <div className="h-full bg-gray-50 flex items-center justify-center p-6">
        <div className="max-w-md bg-white rounded-xl shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">⚠️</span>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Không tìm thấy hoạt động
          </h2>
          <p className="text-gray-600 mb-6">
            Vui lòng chọn hoạt động từ danh sách để thực hiện hủy.
          </p>
          <button
            onClick={() => navigate("/admin/activities")}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Quay lại danh sách
          </button>
        </div>
      </div>
    );
  }

  const requiresManagerApproval = (activityData.currentParticipants || 0) > 50;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    
    try {
      await deleteActivity(Number(activityData.id));
      alert(`Đã hủy hoạt động: ${activityData.name}`);
      navigate("/admin/activities");
    } catch (error) {
      console.error("Failed to delete activity", error);
      alert("Có lỗi xảy ra khi hủy hoạt động. Vui lòng thử lại.");
    }
  };

  return (
    <div className="h-full bg-gray-50 p-6">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h1 className="text-2xl font-semibold text-gray-900 mb-6">
            Hủy hoạt động
          </h1>

          {/* Activity Info */}
          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <h2 className="font-semibold text-gray-900 mb-1">
              {activityData.name}
            </h2>
            <p className="text-sm text-gray-600">
              {activityData.status} · {activityData.currentParticipants || 0} người tham gia
            </p>
          </div>

          {/* Consequences */}
          <div className="space-y-3 mb-6">
            <h3 className="font-semibold text-gray-900">
              Điều gì sẽ xảy ra?
            </h3>
            <ul className="text-sm text-gray-600 space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-0.5">•</span>
                <span>{activityData.currentParticipants || 0} người sẽ nhận thông báo</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-0.5">•</span>
                <span>Điểm đăng ký sẽ được hoàn lại (nếu có)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-600 mt-0.5">•</span>
                <span className="font-medium">Hành động này không thể khôi phục</span>
              </li>
            </ul>
          </div>

          {/* Reason Input */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Lý do hủy <span className="text-red-500">*</span>
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              rows={4}
              placeholder="Vui lòng nhập lý do hủy hoạt động (tối thiểu 30 ký tự)..."
            />
            <p className={`text-xs mt-1 ${reason.length >= 30 ? "text-green-600" : "text-gray-400"}`}>
              {reason.length} / 30 ký tự
            </p>
          </div>

          {/* Manager Approval Notice */}
          {requiresManagerApproval && (
            <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg flex items-start gap-3 mb-6">
              <span className="text-xl">⚠️</span>
              <div>
                <p className="text-sm font-semibold text-yellow-900">
                  Cần HR Manager xác nhận
                </p>
                <p className="text-xs text-yellow-700 mt-1">
                  Do hoạt động có hơn 50 người tham gia, yêu cầu hủy cần được HR Manager phê duyệt
                </p>
                <p className="text-xs text-yellow-600 mt-1">
                  Nguyễn Văn An – HR Manager
                </p>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <button
              onClick={() => navigate("/activities")}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition-colors"
            >
              Quay lại
            </button>
            <button
              onClick={handleSubmit}
              disabled={!canSubmit}
              className={`px-6 py-2 rounded-lg text-white font-medium transition-colors ${
                canSubmit
                  ? "bg-red-600 hover:bg-red-700"
                  : "bg-gray-300 cursor-not-allowed"
              }`}
            >
              {requiresManagerApproval ? "Gửi yêu cầu hủy" : "Xác nhận hủy"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
