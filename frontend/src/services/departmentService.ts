/**
 * departmentService.ts - Service cho quản lý phòng ban
 * Các API calls: lấy danh sách phòng ban, tạo, cập nhật, xóa
 */

import { apiDotNet, apiSpring } from './api';

// ============================================
// TYPES & INTERFACES
// ============================================

export interface DepartmentDto {
  id: number;
  name: string;
  managerId: number | null;
  managerName: string | null;
  employeeCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateDepartmentDto {
  name: string;
  managerId?: number | null;
}

export interface UpdateDepartmentDto {
  name: string;
  managerId?: number | null;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  errors: string[];
}

// ============================================
// SERVICE FUNCTIONS
// ============================================

export const departmentService = {
  /**
   * Lấy danh sách tất cả phòng ban
   * GET /api/v1/Department
   */
  getAllDepartments: async (): Promise<DepartmentDto[]> => {
    const response = await apiDotNet.get<ApiResponse<DepartmentDto[]>>('/Department');
    
    if (response.data.success) {
      return response.data.data;
    }
    
    throw new Error(response.data.message || 'Lỗi khi lấy danh sách phòng ban');
  },

  /**
   * Lấy thông tin chi tiết phòng ban theo ID
   * GET /api/v1/Department/{id}
   */
  getDepartmentById: async (id: number): Promise<DepartmentDto> => {
    const response = await apiDotNet.get<ApiResponse<DepartmentDto>>(`/Department/${id}`);
    
    if (response.data.success) {
      return response.data.data;
    }
    
    throw new Error(response.data.message || 'Không tìm thấy phòng ban');
  },

  /**
   * Tạo phòng ban mới
   * POST /api/v1/Department
   */
  createDepartment: async (data: CreateDepartmentDto): Promise<DepartmentDto> => {
    const response = await apiDotNet.post<ApiResponse<DepartmentDto>>('/Department', data);
    
    if (response.data.success) {
      return response.data.data;
    }
    
    throw new Error(response.data.message || 'Lỗi khi tạo phòng ban');
  },

  /**
   * Cập nhật thông tin phòng ban
   * PUT /api/v1/Department/{id}
   */
  updateDepartment: async (id: number, data: UpdateDepartmentDto): Promise<DepartmentDto> => {
    const response = await apiDotNet.put<ApiResponse<DepartmentDto>>(`/Department/${id}`, data);
    
    if (response.data.success) {
      return response.data.data;
    }
    
    throw new Error(response.data.message || 'Lỗi khi cập nhật phòng ban');
  },

  /**
   * Xóa phòng ban
   * DELETE /api/v1/Department/{id}
   */
  deleteDepartment: async (id: number): Promise<void> => {
    const response = await apiDotNet.delete<ApiResponse<boolean>>(`/Department/${id}`);
    
    if (!response.data.success) {
      throw new Error(response.data.message || 'Lỗi khi xóa phòng ban');
    }
  },
};