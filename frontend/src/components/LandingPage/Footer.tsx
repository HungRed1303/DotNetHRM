// src/pages/landing/components/Footer.tsx
import { THEME_COLORS } from "../common/THEME_COLORS";

export default function Footer() {
  return (
    <footer
      className="w-full border-t-2 border-blue-300 bg-gradient-to-r from-blue-50 via-white to-blue-50 shadow-inner"
    >
      <div className="max-w-6xl mx-auto py-10 px-6 grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Logo & Slogan */}
        <div className="flex flex-col gap-2 items-start">
          <div className="flex items-center gap-2">
            <svg width="32" height="32" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="text-blue-600"><circle cx="12" cy="12" r="10" strokeWidth="2" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12l2 2 4-4" /></svg>
            <span className="text-2xl font-bold text-blue-700">HRM System</span>
          </div>
          <span className="text-base text-gray-500 italic">Empowering your workforce</span>
          <span className="text-sm text-gray-400">© {new Date().getFullYear()} Group 07</span>
        </div>

        {/* Contact Info */}
        <div className="flex flex-col gap-3 text-base text-gray-700">
          <div className="font-semibold text-blue-700 mb-1 text-lg">Liên hệ</div>
          <div className="flex items-center gap-2">
            <svg width="20" height="20" fill="currentColor" className="inline text-blue-500" viewBox="0 0 20 20"><path d="M2.94 6.94a1.5 1.5 0 0 1 2.12 0L10 11.88l4.94-4.94a1.5 1.5 0 1 1 2.12 2.12l-6 6a1.5 1.5 0 0 1-2.12 0l-6-6a1.5 1.5 0 0 1 0-2.12z" /></svg>
            <a href="mailto:admin@company.com" className="hover:underline hover:text-blue-800 transition text-lg">admin@company.com</a>
          </div>
          <div className="flex items-center gap-2">
            <svg width="20" height="20" fill="currentColor" className="inline text-blue-500" viewBox="0 0 20 20"><path d="M2 8.5A6.5 6.5 0 0115.5 8.5c0 3.59-2.91 6.5-6.5 6.5S2.5 12.09 2.5 8.5z" /></svg>
            <span className="text-lg">Hotline: <a href="tel:0123456789" className="hover:underline hover:text-blue-800 transition">0123 456 789</a></span>
          </div>
          <div className="flex items-center gap-2">
            <svg width="20" height="20" fill="currentColor" className="inline text-blue-500" viewBox="0 0 20 20"><path d="M10 2a8 8 0 100 16 8 8 0 000-16zm1 11H9v-1h2v1zm0-2H9V7h2v4z" /></svg>
            <span className="text-lg">Địa chỉ: 123 Đường HRM, Quận 1, TP.HCM</span>
          </div>
        </div>

        {/* Socials & More */}
        <div className="flex flex-col gap-3 text-base text-gray-700 md:items-end items-start">
          <div className="font-semibold text-blue-700 mb-1 text-lg">Kết nối với chúng tôi</div>
          <div className="flex gap-4">
            <a href="#" className="hover:text-blue-600" title="Facebook">
              <svg width="24" height="24" fill="currentColor" className="inline" viewBox="0 0 24 24"><path d="M22 12c0-5.522-4.477-10-10-10S2 6.478 2 12c0 4.991 3.657 9.128 8.438 9.877v-6.987h-2.54v-2.89h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.242 0-1.632.771-1.632 1.562v1.875h2.773l-.443 2.89h-2.33v6.987C18.343 21.128 22 16.991 22 12z" /></svg>
            </a>
            <a href="#" className="hover:text-blue-600" title="LinkedIn">
              <svg width="24" height="24" fill="currentColor" className="inline" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-10h3v10zm-1.5-11.268c-.966 0-1.75-.784-1.75-1.75s.784-1.75 1.75-1.75 1.75.784 1.75 1.75-.784 1.75-1.75 1.75zm13.5 11.268h-3v-5.604c0-1.337-.025-3.063-1.868-3.063-1.868 0-2.154 1.459-2.154 2.968v5.699h-3v-10h2.881v1.367h.041c.401-.761 1.381-1.563 2.841-1.563 3.039 0 3.6 2.001 3.6 4.601v5.595z" /></svg>
            </a>
            <a href="#" className="hover:text-blue-600" title="YouTube">
              <svg width="24" height="24" fill="currentColor" className="inline" viewBox="0 0 24 24"><path d="M23.498 6.186a2.994 2.994 0 0 0-2.112-2.112C19.545 3.5 12 3.5 12 3.5s-7.545 0-9.386.574a2.994 2.994 0 0 0-2.112 2.112C0 8.027 0 12 0 12s0 3.973.502 5.814a2.994 2.994 0 0 0 2.112 2.112C4.455 20.5 12 20.5 12 20.5s7.545 0 9.386-.574a2.994 2.994 0 0 0 2.112-2.112C24 15.973 24 12 24 12s0-3.973-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" /></svg>
            </a>
          </div>
          <span className="text-sm text-gray-400 mt-2">All rights reserved.</span>
        </div>
      </div>
    </footer>
  );
}
