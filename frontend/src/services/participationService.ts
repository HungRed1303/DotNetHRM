/**
 * participationService.ts - Service cho quản lý tham gia hoạt động
 * Các API calls: lấy danh sách tham gia, cập nhật kết quả, điểm danh
 */

import { apiDotNet } from './api';

// ============================================
// TYPES & INTERFACES
// ============================================

export interface ParticipationDto {
  id: number;
  employeeId: number;
  activityId: number;
  employeeName: string;
  activityName: string;
  description: string;
  registerDate: string;
  cancelDate: string | null;
  status: string;
  result: Record<string, any> | null;
}

export interface UpdateParticipationResultDto {
  resultData: Record<string, any>;
}

export interface UpdateAttendanceStatusDto {
  status: 'attended' | 'absent';
  note?: string;
}

export interface BatchUpdateAttendanceDto {
  attendances: Array<{
    employeeId: number;
    status: 'attended' | 'absent';
    note?: string;
  }>;
}

export interface BatchAttendanceResultDto {
  successCount: number;
  failCount: number;
  errors: string[];
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  errors?: string[];
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

// ============================================
// SERVICE FUNCTIONS
// ============================================

export const participationService = {
  /**
   * Lấy danh sách hoạt động mà nhân viên đã tham gia
   * GET /api/v1/Participation/employee/{employeeId}
   */
  getEmployeeParticipations: async (employeeId: number): Promise<ParticipationDto[]> => {
    const response = await apiDotNet.get<ApiResponse<ParticipationDto[]>>(
      `/Participation/employee/${employeeId}`
    );
    
    if (response.data.success) {
      return response.data.data;
    }
    
    throw new Error(response.data.message || 'Lỗi khi lấy danh sách tham gia');
  },

  /**
   * Lấy danh sách nhân viên tham gia một hoạt động
   * GET /api/v1/Participation/activity/{activityId}
   */
  getActivityParticipants: async (activityId: number): Promise<ParticipationDto[]> => {
    const response = await apiDotNet.get<ApiResponse<ParticipationDto[]>>(
      `/Participation/activity/${activityId}`
    );
    
    if (response.data.success) {
      return response.data.data;
    }
    
    throw new Error(response.data.message || 'Lỗi khi lấy danh sách tham gia');
  },

  /**
   * Lấy thông tin tham gia cụ thể
   * GET /api/v1/Participation/{activityId}-{employeeId}
   */
  getParticipation: async (
    activityId: number, 
    employeeId: number
  ): Promise<ParticipationDto> => {
    const response = await apiDotNet.get<ApiResponse<ParticipationDto>>(
      `/Participation/${activityId}-${employeeId}`
    );
    
    if (response.data.success) {
      return response.data.data;
    }
    
    throw new Error(response.data.message || 'Không tìm thấy thông tin tham gia');
  },

  /**
   * Lấy tất cả các bản ghi tham gia (phân trang)
   * GET /api/v1/Participation
   */
  getAllParticipations: async (
    pageNumber: number = 1,
    pageSize: number = 10,
    searchTerm?: string
  ): Promise<PagedResult<ParticipationDto>> => {
    const params = new URLSearchParams({
      pageNumber: pageNumber.toString(),
      pageSize: pageSize.toString(),
    });
    
    if (searchTerm) {
      params.append('searchTerm', searchTerm);
    }

    const response = await apiDotNet.get<PagedResult<ParticipationDto>>(
      `/Participation?${params.toString()}`
    );
    
    return response.data;
  },

  /**
   * Cập nhật kết quả tham gia hoạt động
   * PUT /api/v1/Participation/{activityId}-{employeeId}/result
   */
  updateParticipationResult: async (
    activityId: number,
    employeeId: number,
    data: UpdateParticipationResultDto
  ): Promise<ParticipationDto> => {
    const response = await apiDotNet.put<ApiResponse<ParticipationDto>>(
      `/Participation/${activityId}-${employeeId}/result`,
      data
    );
    
    if (response.data.success) {
      return response.data.data;
    }
    
    throw new Error(response.data.message || 'Lỗi khi cập nhật kết quả');
  },

  /**
   * Lấy kết quả theo loại hoạt động
   * GET /api/v1/Participation/results/by-type/{activityType}
   */
  getResultsByActivityType: async (activityType: string): Promise<ParticipationDto[]> => {
    const response = await apiDotNet.get<ApiResponse<ParticipationDto[]>>(
      `/Participation/results/by-type/${activityType}`
    );
    
    if (response.data.success) {
      return response.data.data;
    }
    
    throw new Error(response.data.message || 'Lỗi khi lấy kết quả');
  },

  /**
   * Điểm danh cho nhân viên
   * PUT /api/v1/Participation/{activityId}-{employeeId}/attendance
   */
  updateAttendanceStatus: async (
    activityId: number,
    employeeId: number,
    data: UpdateAttendanceStatusDto
  ): Promise<ParticipationDto> => {
    const response = await apiDotNet.put<ApiResponse<ParticipationDto>>(
      `/Participation/${activityId}-${employeeId}/attendance`,
      data
    );
    
    if (response.data.success) {
      return response.data.data;
    }
    
    throw new Error(response.data.message || 'Lỗi khi điểm danh');
  },

  /**
   * Điểm danh hàng loạt
   * PUT /api/v1/Participation/activity/{activityId}/batch-attendance
   */
  batchUpdateAttendance: async (
    activityId: number,
    data: BatchUpdateAttendanceDto
  ): Promise<BatchAttendanceResultDto> => {
    const response = await apiDotNet.put<ApiResponse<BatchAttendanceResultDto>>(
      `/Participation/activity/${activityId}/batch-attendance`,
      data
    );
    
    if (response.data.success) {
      return response.data.data;
    }
    
    throw new Error(response.data.message || 'Lỗi khi điểm danh hàng loạt');
  },

  /**
   * Helper: Tạo dữ liệu kết quả cho hoạt động chạy bộ
   */
  createRunningResult: (data: {
    time: string;
    distanceKm: number;
    rank?: number;
    pacePerKm?: string;
    note?: string;
  }): UpdateParticipationResultDto => {
    return {
      resultData: {
        time: data.time,
        distance_km: data.distanceKm,
        rank: data.rank,
        pace_per_km: data.pacePerKm,
        note: data.note,
      }
    };
  },

  /**
   * Helper: Tạo dữ liệu kết quả cho hoạt động bơi lội
   */
  createSwimmingResult: (data: {
    style: string;
    distanceM: number;
    time: string;
    rank?: number;
    note?: string;
  }): UpdateParticipationResultDto => {
    return {
      resultData: {
        style: data.style,
        distance_m: data.distanceM,
        time: data.time,
        rank: data.rank,
        note: data.note,
      }
    };
  },

  /**
   * Helper: Tạo dữ liệu kết quả cho hoạt động đào tạo
   */
  createTrainingResult: (data: {
    attendanceHours: number;
    quizScore?: number;
    certificateIssued: boolean;
    completionDate?: string;
    feedback?: string;
  }): UpdateParticipationResultDto => {
    return {
      resultData: {
        attendance_hours: data.attendanceHours,
        quiz_score: data.quizScore,
        certificate_issued: data.certificateIssued,
        completion_date: data.completionDate,
        feedback: data.feedback,
      }
    };
  },

  /**
   * Helper: Tạo dữ liệu kết quả cho hoạt động tình nguyện
   */
  createVolunteerResult: (data: {
    hoursContributed: number;
    tasksCompleted?: string[];
    impact?: string;
    recognition?: string;
  }): UpdateParticipationResultDto => {
    return {
      resultData: {
        hours_contributed: data.hoursContributed,
        tasks_completed: data.tasksCompleted,
        impact: data.impact,
        recognition: data.recognition,
      }
    };
  },

  /**
   * Helper: Tạo dữ liệu kết quả cho team building
   */
  createTeamBuildingResult: (data: {
    teamName?: string;
    teamRank?: number;
    activitiesCompleted?: string[];
    pointsEarned?: number;
    note?: string;
  }): UpdateParticipationResultDto => {
    return {
      resultData: {
        team_name: data.teamName,
        team_rank: data.teamRank,
        activities_completed: data.activitiesCompleted,
        points_earned: data.pointsEarned,
        note: data.note,
      }
    };
  },
};