import axios from 'axios';

import api from './api';
import type { PaginationParams } from '../types/pagination';
import type { EmployeeListItem, EmployeeDetailData, CreateEmployeeData } from '../store/employeeSlice';

export const employeeService = {
  // Lấy danh sách nhân viên với pagination
  getEmployees: async (params: PaginationParams): Promise<EmployeeListItem[]> => {
    const response = await api.get<{ items: EmployeeListItem[] }>('/Employee', {
      params: {
        pageNumber: params.pageNumber || 1,
        pageSize: params.pageSize || 1000,
      },
    });
    return response.data.items;
  },

  // Lấy thông tin chi tiết nhân viên
  getEmployeeById: async (id: string): Promise<Employee> => {
    const response = await api.get<any>(`/Employee/${id}`);
    // Chuyển đổi dữ liệu từ backend sang đúng interface Employee FE
    const raw = response.data?.data || response.data;
    const employee: Employee = {
      id: String(raw.id),
      employeeCode: raw.employeeCode || '',
      fullName: raw.fullname || raw.fullName || '',
      email: raw.email || '',
      phone: raw.phone || '',
      citizenId: raw.cccd || raw.citizenId || '',
      taxCode: raw.taxCode || '',
      address: raw.address || '',
      bankAccount: typeof raw.bankAccount === 'object' ? raw.bankAccount : {
        accountNumber: raw.bankAccount || '',
        bankName: '',
        accountHolder: ''
      },
      department: raw.departmentName || raw.department || '',
      position: raw.position || '',
      joinDate: raw.joinDate || '',
      birthDate: raw.birthday || raw.birthDate || '',
      gender: raw.gender || 'other',
      avatar: raw.avatar || '',
      status: raw.status || 'active',
      role: raw.roleName === 'admin' ? 'admin' : (raw.roleName === 'manager' ? 'manager' : 'employee'),
      currentPoints: raw.currentPoints || 0,
      totalPoints: raw.totalPoints || 0
    };
    return employee;
  },

  // Tạo nhân viên mới
  createEmployee: async (data: CreateEmployeeData) => {
    const response = await api.post('/Employee', data);

    if (response.data.success) {
      return response.data;
    } else {
      throw new Error(response.data || 'Something went wrong while creating employee');
    }
  },

  // Cập nhật thông tin nhân viên
  updateEmployee: async (id: number, data: Partial<CreateEmployeeData>): Promise<EmployeeDetailData> => {
    const response = await api.put(`/Employee/${id}`, data);

    if (response.data.success) {
      return response.data;
    } else {
      throw new Error(response.data || 'Something went wrong while updating employee');
    }
  },

  // Xóa nhân viên
  deleteEmployee: async (id: number): Promise<void> => {
    const response = await api.delete(`/Employee/${id}`);

    if (!response.data.success) {
      throw new Error(response.data || 'Something went wrong while deleting employee');
    }
  },
};
