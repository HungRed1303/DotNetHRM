export default function ExchangePointSuccessToast(props: { show: boolean }) {
  if (!props.show) return null;

  return (
    <div className="fixed bottom-4 right-4 bg-green-600 text-white px-4 py-2 rounded shadow">
      Quy đổi thành công!
    </div>
  );
}
