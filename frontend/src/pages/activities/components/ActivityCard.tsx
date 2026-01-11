import { Link } from "react-router-dom";

interface ActivityCardProps {
  id: string;
  title: string;
  status: string;
  people: number;
  date: string;
}

export default function ActivityCard({
  id,
  title,
  status,
  people,
  date,
}: ActivityCardProps) {
  const getStatusColor = () => {
    switch (status) {
      case "Đang diễn ra":
        return "text-green-600";
      case "Sắp diễn ra":
        return "text-blue-600";
      default:
        return "text-gray-600";
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 flex justify-between items-center hover:shadow-sm transition-shadow">
      <div>
        <h3 className="font-semibold text-gray-900">{title}</h3>
        <p className="text-sm text-gray-500 mt-1">
          👥 {people} người · 📅 {date}
        </p>
        <span className={`text-xs font-medium ${getStatusColor()} mt-1 inline-block`}>
          {status}
        </span>
      </div>

      <Link
        to="/activities/cancel"
        state={{ id, title, status, people }}
        className="text-sm text-red-600 hover:text-red-700 hover:underline font-medium"
      >
        Hủy hoạt động
      </Link>
    </div>
  );
}
