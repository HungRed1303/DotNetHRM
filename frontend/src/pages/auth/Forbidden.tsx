
import React from "react";
import { useNavigate } from "react-router-dom";

const Forbidden: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-linear-to-br from-red-100 via-white to-blue-100 animate-fade-in">
      <div className="bg-white shadow-2xl rounded-2xl p-10 flex flex-col items-center animate-pop-in">
        <div className="mb-6 animate-bounce">
          <svg width="80" height="80" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="12" fill="#F87171"/>
            <path d="M8 8L16 16" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"/>
            <path d="M16 8L8 16" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"/>
          </svg>
        </div>
        <h1 className="text-6xl font-extrabold text-red-500 mb-2 drop-shadow-lg tracking-wider animate-fade-in-slow">403</h1>
        <h2 className="text-2xl font-semibold text-gray-700 mb-4 animate-fade-in-slow">Truy cập bị từ chối</h2>
        <p className="text-lg text-gray-500 mb-8 text-center animate-fade-in-slow">
          Bạn không có quyền truy cập vào trang này.<br/>
          Nếu bạn nghĩ đây là lỗi, vui lòng liên hệ quản trị viên.
        </p>
        <button
            className="px-6 py-3 bg-linear-to-r from-blue-500 to-blue-700 text-white rounded-full shadow-lg 
                transition-all duration-500 ease-[cubic-bezier(0.25,0.8,0.25,1)]
                font-semibold text-lg animate-fade-in-slow
                hover:scale-105 hover:shadow-xl hover:from-blue-600 hover:to-blue-900
                focus:outline-none focus:ring-4 focus:ring-blue-200"
            style={{ willChange: 'transform, box-shadow, background' }}
            onClick={() => navigate("/")}>
            Quay về trang chủ
        </button>

      </div>
      <style>{`
        .animate-fade-in { animation: fadeIn 0.7s ease; }
        .animate-fade-in-slow { animation: fadeIn 1.2s ease; }
        .animate-pop-in { animation: popIn 0.5s cubic-bezier(.68,-0.55,.27,1.55); }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes popIn { 0% { transform: scale(0.7); opacity: 0; } 100% { transform: scale(1); opacity: 1; } }
      `}</style>
    </div>
  );
};

export default Forbidden;