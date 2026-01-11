import { useState, useEffect } from "react";
import PointExchangeLayout from "../../components/rewards/PointExchangeLayout";
import HalfCircleProgress from "../../components/rewards/HalfCircleProgress";
import ConversionRateInfo from "../../components/rewards/ConversionRateInfo";
import TickSelector from "../../components/rewards/TickSelector";
import { usePointExchange } from "../../hooks/usePointExchange";
// import { calculateMoneyFromPoints } from "../../utils/pointCalculations"; // Không dùng hàm cũ nữa
import { Loader2, Clock } from "lucide-react";
import { pointService } from "../../services/pointService";
import type { PointToMoneyHistoryDto, PointConversionRuleDto } from "../../services/pointService";
import ConfirmExchangeModal from "../../components/rewards/ConfirmExchangeModal";
import ExchangePointSuccessToast from "../../components/rewards/ExchangePointSuccessToast";

/* -------------------------------------------------------------------------- */
/* MAIN SCREEN                                 */
/* -------------------------------------------------------------------------- */

export default function PointExchange() {
  const employeeId = parseInt(localStorage.getItem("userId") || "1");
  
  // Custom states thay vì dùng hook cũ để kiểm soát tốt hơn việc API trả về List
  const [currentPoints, setCurrentPoints] = useState(0);
  const [conversionRules, setConversionRules] = useState<PointConversionRuleDto[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [percent, setPercent] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [selectedPoints, setSelectedPoints] = useState(0);
  const [selectedMoney, setSelectedMoney] = useState(0);
  const [exchanging, setExchanging] = useState(false);
  const [pendingRequests, setPendingRequests] = useState<PointToMoneyHistoryDto[]>([]);
  const [toast, setToast] = useState(false);

  // [FIX] Hàm tính tiền dựa trên Tiered Rewards
  const calculateMoney = (points: number) => {
    if (!conversionRules || conversionRules.length === 0) return 0;
    
    // Tìm rule có mốc điểm cao nhất mà <= points
    const applicableRule = conversionRules
      .filter(r => r.pointValue <= points)
      .sort((a, b) => b.pointValue - a.pointValue)[0]; // Sắp xếp giảm dần lấy cái đầu

    if (!applicableRule) {
      // Trường hợp chưa đủ mốc tối thiểu, lấy tỷ giá thấp nhất để ước tính (hoặc trả về 0)
      const minRule = conversionRules.sort((a, b) => a.pointValue - b.pointValue)[0];
      return minRule ? (points / minRule.pointValue) * minRule.moneyValue : 0;
    }

    return (points / applicableRule.pointValue) * applicableRule.moneyValue;
  };

  // Rule hiện tại đang áp dụng (để hiển thị Info Box)
  const currentAppliedRule = conversionRules.length > 0 
    ? (conversionRules.find(r => r.pointValue <= Math.round(currentPoints * percent / 100)) 
       || conversionRules[0]) 
    : null;

  const totalMoney = calculateMoney(currentPoints); // Tổng tiền nếu đổi hết 100% điểm

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [pointData, pendingData, rulesData] = await Promise.all([
        pointService.getEmployeePoint(employeeId),
        pointService.getPointToMoneyHistory(1, 100, employeeId, 'pending'),
        pointService.getActiveConversionRule()
      ]);

      setCurrentPoints(pointData.pointTotal);
      setPendingRequests(pendingData.items);

      // [FIX] Xử lý dữ liệu rules trả về là Array
      if (Array.isArray(rulesData)) {
        setConversionRules(rulesData.sort((a, b) => a.pointValue - b.pointValue));
      } else if (rulesData) {
        setConversionRules([rulesData]);
      }
    } catch (err: any) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (points: number) => {
    if (hasPendingRequest) {
      alert('Bạn đã có yêu cầu quy đổi đang chờ xử lý. Vui lòng đợi admin duyệt trước khi gửi yêu cầu mới.');
      return;
    }
    
    // Validate bội số 100
    if (points % 100 !== 0) {
      alert('Số điểm quy đổi phải là bội số của 100');
      return;
    }

    const money = calculateMoney(points);
    setSelectedPoints(points);
    setSelectedMoney(money);
    setShowModal(true);
  };

  const handleConfirmExchange = async () => {
    if (hasPendingRequest) {
      setShowModal(false);
      return;
    }
    
    setExchanging(true);
    try {
      await pointService.requestPointToMoneyConversion(employeeId, selectedPoints);
      setShowModal(false);
      setToast(true);
      setTimeout(() => setToast(false), 3000);
      
      // Refresh dữ liệu
      await fetchData();
      setPercent(0); // Reset thanh kéo về 0
      
    } catch (error: any) {
      setShowModal(false);
      const errorMessage = error.message || 'Lỗi khi gửi yêu cầu quy đổi. Vui lòng thử lại!';
      alert(errorMessage);
    } finally {
      setExchanging(false);
    }
  };

  const hasPendingRequest = pendingRequests.length > 0;

  if (loading) {
    return (
      <PointExchangeLayout>
        <div className="w-full min-h-screen flex items-center justify-center bg-[#f4f7fb]">
          <Loader2 className="animate-spin w-8 h-8 text-blue-600" />
        </div>
      </PointExchangeLayout>
    );
  }

  return (
    <PointExchangeLayout>
      <div className="w-full p-6 md:p-10" style={{ background: '#fafdff' }}>
        {/* HEADER */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-blue-600">
            Quy đổi điểm thưởng
          </h1>
          <p className="text-gray-600 text-lg mt-1">
            Chuyển đổi điểm thưởng của bạn thành tiền mặt
          </p>
        </div>

        {/* Pending Request Alert */}
        {hasPendingRequest && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 sm:p-6 mb-6 max-w-6xl mx-auto">
            <div className="flex items-start gap-3">
              <Clock className="w-5 h-5 text-yellow-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold text-yellow-800 text-lg sm:text-xl mb-2">
                  Yêu cầu đang chờ xử lý
                </h3>
                <p className="text-base text-yellow-700 mb-3">
                  Bạn có {pendingRequests.length} yêu cầu quy đổi đang chờ admin duyệt. 
                  Vui lòng đợi trước khi gửi yêu cầu mới.
                </p>
                <div className="space-y-2">
                  {pendingRequests.map((req) => (
                    <div key={req.id} className="bg-yellow-100 rounded-lg px-3 py-2 text-base">
                      <span className="font-medium">{req.pointRequested} điểm</span> → {req.moneyReceived.toLocaleString('vi-VN')}đ
                      <span className="text-gray-600 ml-2">
                        ({new Date(req.createdAt).toLocaleDateString('vi-VN')})
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-6 relative">
          
          {/* LEFT — 1/3 */}
          <div className="lg:w-1/3 flex">
            <div className="p-6 rounded-2xl bg-white shadow border border-[#E6E6E6] w-full flex flex-col" style={{ boxShadow: '0 1px 4px rgba(0,102,255,0.08)' }}>

              {/* HALF CIRCLE */}
              <HalfCircleProgress
                percent={percent}
                totalPoints={currentPoints}
                // Tính tiền động dựa trên % điểm đang chọn thay vì tổng tiền tĩnh
                totalMoney={calculateMoney(Math.round(currentPoints * percent / 100))}
              />

              <div className="relative w-full my-8 flex justify-center">
                <div
                  className="w-full h-0.5 rounded-full backdrop-blur-sm"
                  style={{
                    background: `linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(153,180,255,0.4) 50%, rgba(255,255,255,0) 100%)`,
                    boxShadow: "0 0 10px rgba(30, 90, 255, 0.25)",
                  }}
                ></div>
              </div>

              {/* INFO BOX: Hiển thị tỷ giá đang áp dụng */}
              {currentAppliedRule ? (
                <div className="text-center p-4 bg-blue-50 rounded-xl border border-blue-100">
                  <p className="text-sm text-gray-500 mb-1">Tỷ giá đang áp dụng</p>
                  <p className="text-lg font-bold text-blue-600">
                    {currentAppliedRule.pointValue} điểm = {currentAppliedRule.moneyValue.toLocaleString('vi-VN')}đ
                  </p>
                </div>
              ) : (
                <ConversionRateInfo rate={conversionRules[0]} />
              )}
            </div>
          </div>

          {/* RIGHT — 2/3 */}
          <div className="lg:w-2/3 flex">
            <div className="p-6 rounded-2xl bg-white shadow border border-[#E6E6E6] w-full flex flex-col" style={{ boxShadow: '0 1px 4px rgba(0,102,255,0.08)' }}>
              <TickSelector
                max={currentPoints}
                rate ={conversionRules[0]} // Truyền rate mặc định để tránh lỗi component con
                onChangePercent={(p: number) => setPercent(p)}
                onSelect={(points, money) => handleOpenModal(points)} // Chỉ cần truyền points, money sẽ tính lại trong hàm handleOpen
              />
            </div>
          </div>
        </div>

        {/* CONFIRMATION MODAL */}
        <ConfirmExchangeModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          onConfirm={handleConfirmExchange}
          points={selectedPoints}
          money={selectedMoney}
          loading={exchanging}
        />
        
        <ExchangePointSuccessToast show={toast} />

        {exchanging && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-xl shadow-xl flex flex-col items-center">
              <Loader2 className="h-10 w-10 text-blue-600 animate-spin mb-3" />
              <p className="text-gray-700 font-medium">Đang gửi yêu cầu quy đổi...</p>
            </div>
          </div>
        )}
      </div>
    </PointExchangeLayout>
  );
}