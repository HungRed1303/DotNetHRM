// src/frontend/src/components/LandingPage/Header.tsx
import { THEME_COLORS } from "../common/THEME_COLORS";
import { Link } from "react-router-dom";

// import đúng theo cấu trúc bạn gửi
import logoImg from "../../assets/logo.jpg";

import { useEffect, useState } from "react";
import { logout } from "../../services/authService";

export default function Header() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    setIsLoggedIn(!!localStorage.getItem("userId"));
  }, []);

  const handleLogout = async () => {
    const refreshToken = localStorage.getItem("refreshToken");
    
    if(refreshToken){
      await logout(refreshToken);
    }
  };

  return (
    <header
      className="w-full py-4 px-6 flex items-center justify-between shadow-sm sticky top-0 z-50 backdrop-blur-lg"
      style={{ background: THEME_COLORS.secondary[50] }}
    >
      {/* Logo */}
      <Link to="/landing" className="flex items-center gap-3 cursor-pointer" style={{ textDecoration: 'none' }}>
        <img
          src={logoImg}
          alt="logo"
          className="w-10 h-10 rounded-md object-cover"
        />

        <div>
          <div
            className="text-lg font-semibold"
            style={{ color: THEME_COLORS.primary[700] }}
          >
            HRMS — Human Resource
          </div>
          <div className="text-xs text-gray-500">
            Enterprise HR • AI driven
          </div>
        </div>
      </Link>

      {/* Navigation */}
      <nav className="flex items-center gap-6">
        <button
          onClick={() => scrollToSection("activities")}
          className="text-sm text-gray-700 hover:text-gray-900 transition"
        >
          Hoạt động
        </button>

        <button
          onClick={() => scrollToSection("gallery")}
          className="text-sm text-gray-700 hover:text-gray-900 transition"
        >
          Thư viện
        </button>

        {isLoggedIn ? (
          <button
            onClick={handleLogout}
            className="ml-4 px-4 py-2 rounded-lg text-sm font-medium bg-red-500 text-white hover:bg-red-600 transition"
          >
            Đăng xuất
          </button>
        ) : (
          <Link
            to="/login"
            className="ml-4 px-4 py-2 rounded-lg text-sm font-medium"
            style={{ background: THEME_COLORS.primary[500], color: "white" }}
          >
            Đăng nhập
          </Link>
        )}
      </nav>
    </header>
  );
}
