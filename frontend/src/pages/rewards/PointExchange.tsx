import { useState, useEffect } from "react";
import { THEME_COLORS } from "../../components/common/THEME_COLORS";
import { pointService } from "../../services/pointService";
import type { EmployeePointDto, PointConversionRuleDto } from "../../services/pointService";

import ExchangePointHeader from "../../components/rewards/ExchangePointHeader";
import ExchangePointCurrent from "../../components/rewards/ExchangePointCurrent";
import ExchangePointForm from "../../components/rewards/ExchangePointForm";
import ExchangePointConfirmModal from "../../components/rewards/ExchangePointConfirmModal";
import ExchangePointSuccessToast from "../../components/rewards/ExchangePointSuccessToast";
import { Loader2, AlertCircle } from "lucide-react";

export default function PointExchange() {
  const employeeId = parseInt(localStorage.getItem('userId') || '1');

  // States cho dữ liệu
  const [employeePoint, setEmployeePoint] = useState<EmployeePointDto | null>(null);
  const [conversionRule, setConversionRule] = useState<PointConversionRuleDto | null>(null);
  
  // States cho UI
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [toast, setToast] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [pendingPoints, setPendingPoints] = useState(0);
  const [pendingMoney, setPendingMoney] = useState(0);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [pointData, ruleData] = await Promise.all([
        pointService.getEmployeePoint(employeeId),
        pointService.getActiveConversionRule(),
      ]);

      setEmployeePoint(pointData);
      setConversionRule(ruleData);
    } catch (err: any) {
      console.error('Error fetching exchange data:', err);
      setError(err.message || 'Không thể tải dữ liệu quy đổi');
    } finally {
      setLoading(false);
    }
  };

  const openConfirm = (points: number, money: number) => {
    setPendingPoints(points);
    setPendingMoney(money);
    setModalOpen(true);
  };

  const confirmExchange = async () => {
    try {
      setSubmitting(true);
      setModalOpen(false);

      // Gọi API quy đổi điểm
      await pointService.requestPointToMoneyConversion(employeeId, pendingPoints);

      // Hiển thị toast thành công
      setToast(true);
      setTimeout(() => setToast(false), 3000);

      // Refresh dữ liệu
      await fetchData();
    } catch (err: any) {
      console.error('Error requesting conversion:', err);
      alert(err.message || 'Có lỗi xảy ra khi gửi yêu cầu quy đổi');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div
        className="w-full min-h-screen p-4 flex items-center justify-center"
        style={{ backgroundColor: THEME_COLORS.primary[50] }}
      >
        <div className="flex flex-col items-center">
          <Loader2 className="h-12 w-12 text-blue-600 animate-spin" />
          <span className="ml-3 text-gray-600 mt-4">Đang tải dữ liệu...</span>
        </div>
      </div>
    );
  }

  if (error || !employeePoint || !conversionRule) {
    return (
      <div
        className="w-full min-h-screen p-4 flex items-center justify-center"
        style={{ backgroundColor: THEME_COLORS.primary[50] }}
      >
        <div className="flex flex-col items-center text-red-600">
          <AlertCircle className="h-12 w-12 mb-4" />
          <p className="font-medium">{error || 'Không thể tải dữ liệu'}</p>
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

  const CURRENT_POINTS = employeePoint.pointTotal;
  const EXCHANGE_RATE = conversionRule.moneyValue / conversionRule.pointValue * 100;

  return (
    <div
      className="w-full min-h-screen p-4"
      style={{
        backgroundColor: THEME_COLORS.primary[50],
        textAlign: "left",
      }}
    >
      <div className="w-full max-w-xl mx-auto">
        <ExchangePointHeader />

        <ExchangePointCurrent
          current={CURRENT_POINTS}
          rate={EXCHANGE_RATE}
        />

        <ExchangePointForm
          current={CURRENT_POINTS}
          rate={EXCHANGE_RATE}
          openConfirm={openConfirm}
        />

        <ExchangePointConfirmModal
          open={modalOpen}
          points={pendingPoints}
          money={pendingMoney}
          onConfirm={confirmExchange}
          onClose={() => setModalOpen(false)}
        />

        <ExchangePointSuccessToast show={toast} />

        {submitting && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
            <div className="bg-white p-6 rounded-lg shadow-xl flex flex-col items-center">
              <Loader2 className="h-8 w-8 text-blue-600 animate-spin mb-3" />
              <p className="text-gray-700">Đang gửi yêu cầu quy đổi...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}