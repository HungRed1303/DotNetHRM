import React, { useState } from "react";
import Footer from "../../components/LandingPage/Footer";
import { login } from "../../services/authService";
import type { LoginRequest } from "../../types/auth";
import Header from "../../components/LandingPage/Header";

const Login: React.FC = () => {
  const [form, setForm] = useState<LoginRequest>({ username: "", password: "" });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await login(form);
      localStorage.setItem("accessToken", res.accessToken);
      localStorage.setItem("refreshToken", res.refreshToken);
      localStorage.setItem("role", res.role);
      localStorage.setItem("userId", res.userId.toString());

      if(res.role === "employee"){
        window.location.href = "/";
      }
      else if(res.role === "admin"){
        window.location.href = "/admin/dashboard";
      }
      
    } catch {
      setError("Sai tài khoản hoặc mật khẩu!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <main className="flex-1 flex items-center justify-center">
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md flex flex-col gap-6"
        >
          <h2 className="text-2xl font-bold text-center text-blue-700 mb-2">Đăng nhập hệ thống HRM</h2>
          <input
            name="username"
            value={form.username}
            onChange={handleChange}
            placeholder="Email"
            className="border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            required
          />
          <input
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            placeholder="Mật khẩu"
            className="border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition"
          >
            {loading ? "Đang đăng nhập..." : "Đăng nhập"}
          </button>
          {error && <div className="text-red-500 text-center">{error}</div>}
        </form>
      </main>
      <Footer />
    </div>
  );
};

export default Login;