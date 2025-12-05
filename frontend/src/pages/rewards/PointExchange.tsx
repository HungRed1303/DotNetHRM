import { useState } from "react";
import { THEME_COLORS } from "../../components/common/THEME_COLORS";

import ExchangePointHeader from "../../components/rewards/ExchangePointHeader";
import ExchangePointCurrent from "../../components/rewards/ExchangePointCurrent";
import ExchangePointForm from "../../components/rewards/ExchangePointForm";
import ExchangePointConfirmModal from "../../components/rewards/ExchangePointConfirmModal";
import ExchangePointSuccessToast from "../../components/rewards/ExchangePointSuccessToast";


const EXCHANGE_RATE = 100000;

export default function RewardExchangePoint() {
  const CURRENT_POINTS = 850;

  const [modalOpen, setModalOpen] = useState(false);
  const [toast, setToast] = useState(false);

  const [pendingPoints, setPendingPoints] = useState(0);
  const [pendingMoney, setPendingMoney] = useState(0);

  const openConfirm = (points: number, money: number) => {
    setPendingPoints(points);
    setPendingMoney(money);
    setModalOpen(true);
  };

  const confirmExchange = () => {
    setModalOpen(false);
    setToast(true);

    setTimeout(() => setToast(false), 2000);
  };

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
      </div>
    </div>
  );
}
