/**
 * pointService.ts - Service cho quản lý điểm thưởng
 * API calls: xem điểm, lịch sử giao dịch, quy đổi điểm
 */

import type { Update } from '@reduxjs/toolkit';
import { apiDotNet } from './api';

// ============================================
// TYPES & INTERFACES
// ============================================

export interface EmployeePointDto {
  id: number;
  employeeId: number;
  employeeName: string;
  email: string;
  pointTotal: number;
  lastUpdate: string;
}

export interface PointTransactionDto {
  id: number;
  employeeId: number;
  employeeName: string;
  value: number;
  type: string;
  typeDisplay: string;
  actorId: number | null;
  actorName: string | null;
  description: string | null;
  createdAt: string;
}

export interface PointConversionRuleDto {
  id: number;
  pointValue: number;
  moneyValue: number;
  updatedBy: number | null;
  updatedByName: string | null;
  updatedAt: string;
  isActive: boolean;
}

export interface PointToMoneyHistoryDto {
  id: number;
  employeeId: number;
  employeeName: string;
  email: string;
  pointRequested: number;
  moneyReceived: number;
  status: string;
  statusDisplay: string;
  createdAt: string;
  processedAt: string | null;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  errors: string[];
}

export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface MonthlyPointRuleDto {
  id: number;
  roleId: number;
  roleName: string;
  pointValue: number;
  createdAt: string;
  updatedAt: string;
}

export interface UpsertMonthlyPointRuleDto {
  roleId: number;
  pointValue: number;
}

// [NEW] Interface cho History Allocation
export interface MonthlyPointAllocationHistoryDto {
  id: number;
  month: number;
  year: number;
  totalPointsDistributed: number;
  employeeCount: number;
  status: string; // 'Success', 'Failed'
  createdAt: string;
}

export interface MonthlyPointAllocationResultDto {
  success: boolean;
  message: string;
  totalEmployees: number;
  totalPoints: number;
}

export interface UpsertPointConversionRuleDto {
  pointValue: number;
  moneyValue: number;
  isActive: boolean;
}
// ============================================
// SERVICE FUNCTIONS
// ============================================

export const pointService = {
  /**
   * Lấy thông tin điểm thưởng của nhân viên
   * GET /api/Point/employee/{employeeId}
   */
  getEmployeePoint: async (employeeId: number): Promise<EmployeePointDto> => {
    const response = await apiDotNet.get<ApiResponse<EmployeePointDto>>(
      `/Point/employee/${employeeId}`
    );

    if (response.data.success) {
      return response.data.data;
    }

    throw new Error(response.data.message || 'Lỗi khi lấy thông tin điểm');
  },

  /**
   * Lấy lịch sử giao dịch điểm của nhân viên
   * GET /api/Point/transactions/employee/{employeeId}
   */
  getEmployeeTransactionHistory: async (
    employeeId: number,
    limit?: number
  ): Promise<PointTransactionDto[]> => {
    const response = await apiDotNet.get<ApiResponse<PointTransactionDto[]>>(
      `/Point/transactions/employee/${employeeId}`,
      { params: { limit } }
    );

    if (response.data.success) {
      return response.data.data;
    }

    throw new Error(response.data.message || 'Lỗi khi lấy lịch sử giao dịch');
  },

  /**
   * Lấy lịch sử giao dịch điểm với phân trang
   * GET /api/Point/transactions
   */
  getPointTransactions: async (
    pageNumber: number = 1,
    pageSize: number = 10,
    employeeId?: number,
    type?: string,
    fromDate?: string,
    toDate?: string
  ): Promise<PagedResult<PointTransactionDto>> => {
    const response = await apiDotNet.get<PagedResult<PointTransactionDto>>(
      '/Point/transactions',
      {
        params: {
          pageNumber,
          pageSize,
          employeeId,
          type,
          fromDate,
          toDate,
        },
      }
    );

    return response.data;
  },

  /**
   * Lấy quy tắc quy đổi điểm đang hoạt động
   * GET /api/Point/conversion-rules/active
   */
  getActiveConversionRule: async (): Promise<PointConversionRuleDto> => {
    const response = await apiDotNet.get<ApiResponse<PointConversionRuleDto>>(
      '/Point/conversion-rules/active'
    );

    if (response.data.success) {
      return response.data.data;
    }

    throw new Error(response.data.message || 'Không tìm thấy quy tắc quy đổi');
  },

  /**
   * Lấy toàn bộ quy tắc quy đổi điểm
   * GET /api/Point/conversion-rules
   */
  getAllConversionRule: async (): Promise<PointConversionRuleDto[]> => {
    const response = await apiDotNet.get<ApiResponse<PointConversionRuleDto[]>>(
      '/Point/conversion-rules'
    )

    if (response.data.success) {
      return response.data.data;
    }

    throw new Error(response.data.message || 'Không tìm thấy bất kì quy tắc quy đổi');
  },

  /**
   * Gửi yêu cầu quy đổi điểm sang tiền
   * POST /api/Point/employee/{employeeId}/convert
   */
  requestPointToMoneyConversion: async (
    employeeId: number,
    pointRequested: number
  ): Promise<PointToMoneyHistoryDto> => {
    const response = await apiDotNet.post<ApiResponse<PointToMoneyHistoryDto>>(
      `/Point/employee/${employeeId}/convert`,
      { PointRequested: pointRequested }  // Backend .NET expects PascalCase
    );

    if (response.data.success) {
      return response.data.data;
    }

    throw new Error(response.data.message || 'Lỗi khi gửi yêu cầu quy đổi');
  },

  /**
   * Lấy lịch sử quy đổi điểm sang tiền
   * GET /api/Point/conversion-history
   */
  getPointToMoneyHistory: async (
    pageNumber: number = 1,
    pageSize: number = 10,
    employeeId?: number,
    status?: string
  ): Promise<PagedResult<PointToMoneyHistoryDto>> => {
    const response = await apiDotNet.get<PagedResult<PointToMoneyHistoryDto>>(
      '/Point/conversion-history',
      {
        params: {
          pageNumber,
          pageSize,
          employeeId,
          status,
        },
      }
    );

    return response.data;
  },

  /**
   * Lấy thống kê điểm thưởng
   * GET /api/Point/statistics
   */
  getPointStatistics: async (): Promise<any> => {
    const response = await apiDotNet.get<ApiResponse<any>>('/Point/statistics');

    if (response.data.success) {
      return response.data.data;
    }

    throw new Error(response.data.message || 'Lỗi khi lấy thống kê');
  },

  /**
   * Lấy danh sách điểm của tất cả nhân viên
   * GET /api/Point/employees
   */
  getAllEmployeePoints: async (
    pageNumber: number = 1,
    pageSize: number = 100
  ): Promise<PagedResult<EmployeePointDto>> => {
    const response = await apiDotNet.get<PagedResult<EmployeePointDto>>(
      '/Point',
      {
        params: {
          pageNumber,
          pageSize,
        },
      }
    );

    return response.data;
  },
  getMonthlyPointRules: async (): Promise<MonthlyPointRuleDto[]> => {
    const response = await apiDotNet.get<ApiResponse<MonthlyPointRuleDto[]>>(
      '/MonthlyPoint/rules'
    );
    return response.data.data;
  },

  /**
   * Tạo hoặc cập nhật quy tắc cộng điểm
   * POST /api/MonthlyPoint/rules
   */
  upsertMonthlyPointRule: async (dto: UpsertMonthlyPointRuleDto): Promise<MonthlyPointRuleDto> => {
    const response = await apiDotNet.post<ApiResponse<MonthlyPointRuleDto>>(
      '/MonthlyPoint/rules',
      dto
    );
    if (!response.data.success) {
      throw new Error(response.data.message);
    }
    return response.data.data;
  },

  /**
   * Xóa quy tắc cộng điểm
   * DELETE /api/MonthlyPoint/rules/{id}
   */
  deleteMonthlyPointRule: async (id: number): Promise<boolean> => {
    const response = await apiDotNet.delete<ApiResponse<boolean>>(
      `/MonthlyPoint/rules/${id}`
    );
    return response.data.success;
  },

  /**
   * Chạy phân phối điểm thủ công
   * POST /api/MonthlyPoint/allocate
   */
  allocateMonthlyPoints: async (): Promise<MonthlyPointAllocationResultDto> => {
    const response = await apiDotNet.post<ApiResponse<MonthlyPointAllocationResultDto>>(
      '/MonthlyPoint/allocate',
      {}
    );
    if (!response.data.success) {
      throw new Error(response.data.message);
    }
    return response.data.data;
  },

  /**
   * Lấy lịch sử phân phối điểm
   * GET /api/MonthlyPoint/history
   */
  updateConversionRule: async (id: number, dto: UpsertPointConversionRuleDto): Promise<PointConversionRuleDto> => {
    const response = await apiDotNet.put<ApiResponse<PointConversionRuleDto>>(
      `/Point/conversion-rules/${id}`,
      dto
    );
    
    if (response.data.success) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Lỗi khi cập nhật quy tắc');
  },

  getAllocationHistory: async (limit: number = 12): Promise<MonthlyPointAllocationHistoryDto[]> => {
    const response = await apiDotNet.get<ApiResponse<MonthlyPointAllocationHistoryDto[]>>(
      '/MonthlyPoint/history',
      { params: { limit } }
    );
    return response.data.data;
  },

  getPointToMoneyRequest: async (
    pageNumber: number, 
    pageSize: number, 
    employeeId?: number, 
    status?: string
  ): Promise<PagedResult<PointToMoneyHistoryDto>> => {
    const params: any = { pageNumber, pageSize };
    if (employeeId) params.employeeId = employeeId;
    if (status) params.status = status;

    const response = await apiDotNet.get<PagedResult<PointToMoneyHistoryDto>>(
      '/Point/conversion-history',
      { params }
    );
    return response.data; // Backend trả về trực tiếp PagedResult, không bọc ApiResponse ở lớp ngoài cùng cho GET list
  },

  /**
   * Duyệt hoặc Từ chối yêu cầu đổi điểm
   * PUT /api/v1/Point/conversion-history/{requestId}/process
   */
  processConversionRequest: async (requestId: number, status: 'approved' | 'rejected'): Promise<boolean> => {
    const response = await apiDotNet.put<ApiResponse<any>>(
      `/Point/conversion-history/${requestId}/process`,
      { status }
    );
    
    if (response.data.success) {
      return true;
    }
    throw new Error(response.data.message || "Lỗi khi xử lý yêu cầu");
  },
};