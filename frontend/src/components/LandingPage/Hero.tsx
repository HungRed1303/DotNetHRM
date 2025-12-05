// src/pages/landing/components/Hero.tsx
import { motion } from "framer-motion";
import { THEME_COLORS } from "../common/THEME_COLORS";

import React, { useEffect, useState } from "react";

export default function Hero() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  useEffect(() => {
    setIsLoggedIn(!!localStorage.getItem("userId"));
  }, []);
  return (
    <section
      className="relative min-h-[85vh] w-full flex items-center justify-center text-center px-6"
      style={{ background: `linear-gradient(180deg, ${THEME_COLORS.primary[50]}, #ffffff)` }}
    >
      {/* subtle pattern / glow */}
      <div className="absolute inset-0 pointer-events-none" />

      <div className="relative z-10 max-w-4xl">
        <motion.h1
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight"
          style={{ color: THEME_COLORS.primary[800] }}
        >
          Human Resource Management System
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.25 }}
          className="mt-6 text-base md:text-lg text-gray-600 max-w-3xl mx-auto"
        >
          Hệ thống quản lý nhân sự toàn diện — AI hỗ trợ, bảo mật, hiệu năng cao. Quản lý hồ sơ,
          yêu cầu, hoạt động và hệ thống khen thưởng cho doanh nghiệp hiện đại.
        </motion.p>

        <motion.div
          initial={{ scale: 0.98, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.45 }}
          className="mt-8 flex justify-center gap-4"
        >
          {!isLoggedIn && (
            <a
              href="/login"
              className="px-6 py-3 rounded-lg font-medium shadow"
              style={{ background: THEME_COLORS.primary[600], color: "white" }}
            >
              Đăng nhập hệ thống
            </a>
          )}

          <a
            href="#features"
            className="px-6 py-3 rounded-lg font-medium border"
            style={{ borderColor: THEME_COLORS.secondary[200], color: THEME_COLORS.secondary[700] }}
          >
            Tìm hiểu thêm
          </a>
        </motion.div>
      </div>
    </section>
  );
}
