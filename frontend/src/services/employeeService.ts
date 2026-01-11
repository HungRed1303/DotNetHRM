import { apiDotNet, apiSpring } from './api';
import type { PaginationParams } from '../types/pagination';
import type { EmployeeListItem, EmployeeDetailData, CreateEmployeeData } from '../store/employeeSlice';
import type { Employee } from '../types/employee';

export const employeeService = {
  // Lấy danh sách nhân viên với pagination
  getEmployees: async (params: PaginationParams): Promise<EmployeeListItem[]> => {
    const response = await apiDotNet.get<{ items: EmployeeListItem[] }>('/Employee', {
      params: {
        pageNumber: params.pageNumber || 1,
        pageSize: params.pageSize || 1000,
      },
    });
    return response.data.items;
  },

   getEmployeeDetail: async (id: number): Promise<EmployeeDetailData> => {
    const response = await apiDotNet.get(`/Employee/${id}`);

    if (response.data.success) {
      return response.data.data;
    } else {
      throw new Error(response.data || 'Something went wrong while fetching employee details');
    }
  },

  // Lấy thông tin chi tiết nhân viên - map về frontend `Employee` shape
  getEmployeeById: async (id: number | string): Promise<Employee> => {
    const response = await apiDotNet.get(`/Employee/${id}`);

    if (!response.data.success) {
      throw new Error(response.data || 'Something went wrong while fetching employee details');
    }

    const dto = response.data.data as any;

    // Map backend DTO to frontend Employee shape
    const idStr = String(dto.id ?? dto.Id ?? '');

    // generate employee code fallback like EMP0001 when backend doesn't provide one
    const generatedCode = idStr ? `EMP${idStr.padStart(4, '0')}` : '';

    const mapped: Employee = {
      id: idStr,
      employeeCode: dto.employeeCode ?? dto.EmployeeCode ?? generatedCode,
      fullName: dto.fullname ?? dto.Fullname ?? dto.fullName ?? '',
      email: dto.email ?? dto.Email ?? '',
      phone: dto.phone ?? dto.Phone ?? '',
      citizenId: dto.cccd ?? dto.Cccd ?? dto.citizenId ?? '',
      taxCode: dto.taxCode ?? dto.TaxCode ?? dto.tax_code ?? '',
      address: dto.address ?? dto.Address ?? '',
      bankAccount: {
        accountNumber: dto.bankAccount ?? dto.BankAccount ?? '',
        bankName: '',
        accountHolder: dto.fullname ?? dto.Fullname ?? dto.fullName ?? '',
      },
      department: dto.departmentName ?? dto.DepartmentName ?? dto.department ?? '',
      position: dto.position ?? dto.Position ?? dto.roleName ?? dto.RoleName ?? '',
      joinDate: dto.joinDate ?? dto.JoinDate ?? '',
      birthDate: dto.birthday ?? dto.Birthday ?? '',
      gender: (dto.gender ?? dto.Gender ?? 'other') as 'male' | 'female' | 'other',
      avatar: dto.avatar ?? undefined,
      status: (dto.status ?? dto.Status ?? 'active') as 'active' | 'inactive' | 'terminated',
      role: ((dto.roleName ?? dto.RoleName ?? dto.role) as string)?.toLowerCase() as 'employee' | 'manager' | 'admin',
      currentPoints: dto.currentPoints ?? dto.current_points ?? 0,
      totalPoints: dto.totalPoints ?? dto.total_points ?? 0,
    };

    return mapped;
  },

  // Tạo nhân viên mới
  createEmployee: async (data: CreateEmployeeData) => {
    const response = await apiSpring.post('/employee', data, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
      },
    });
    return response.data;
  },

  // Cập nhật thông tin nhân viên
  updateEmployee: async (id: number, data: Partial<CreateEmployeeData>): Promise<EmployeeDetailData> => {
    const response = await apiDotNet.put(`/employee/${id}`, data);

    if (response.data.success) {
      return response.data;
    } else {
      throw new Error(response.data || 'Something went wrong while updating employee');
    }
  },

  // Xóa nhân viên
  deleteEmployee: async (id: number): Promise<void> => {
    const response = await apiDotNet.delete(`/Employee/${id}`);

    if (!response.data.success) {
      throw new Error(response.data || 'Something went wrong while deleting employee');
    }
  },

  // Lấy thống kê nhân viên
  getEmployeeStatistics: async (): Promise<{
    totalEmployees: number;
    roleDistribution: { roleName: string; count: number }[];
  }> => {
    const response = await apiDotNet.get<{ items: EmployeeListItem[] }>('/Employee', {
      params: {
        pageNumber: 1,
        pageSize: 10000,
      },
    });
    
    const employees = response.data.items;
    const totalEmployees = employees.length;
    
    // Tính phân bổ theo role
    const roleMap = new Map<string, number>();
    employees.forEach(emp => {
      const role = emp.roleName || 'Unknown';
      roleMap.set(role, (roleMap.get(role) || 0) + 1);
    });
    
    const roleDistribution = Array.from(roleMap.entries()).map(([roleName, count]) => ({
      roleName,
      count,
    }));
    
    return {
      totalEmployees,
      roleDistribution,
    };
  },
};