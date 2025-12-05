// Lấy dữ liệu + quản lý state
import { useEffect, useState } from "react";
import { employeeService } from "../services/employeeService";
import type { Employee } from "../types/employee";

export function useEmployeeProfile(id?: string) {
  const [data, setData] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        setLoading(true);
        const res = await employeeService.getEmployeeById(String(id));
        if (mounted) setData(res);
      } catch {
        setErr("Không tìm thấy hồ sơ nhân viên. Vui lòng liên hệ quản trị viên.");
      } finally {
        setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [id]);

  return { data, loading, err };
}
