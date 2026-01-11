/**
 * activityService.ts - Service cho quản lý hoạt động công ty
 * Các API calls: quản lý cuộc thi chạy bộ, ghi nhận kết quả, thống kê
 */

import { apiSpring, apiDotNet } from './api';
import type { Activity, ActivityListResponse, CreateActivityRequest, MyParticipationResponse } from '../types/activity';
import type { CompletedActivityData } from '../types/activity';

/**
 * Get all activities (for HR management and Employee view)
 */
export const getAllActivities = async (params?: {
  page?: number;
  pageSize?: number;
  status?: string;
  search?: string;
}): Promise<ActivityListResponse> => {
  const response = await apiSpring.get<ActivityListResponse>('/activities', { params });
  return response.data;
};

/**
 * Get activity details by ID
 */
export const getActivityById = async (id: number): Promise<Activity> => {
  const response = await apiSpring.get<Activity>(`/activities/${id}`);
  return response.data;
};

/**
 * Create a new activity (HR/Admin only)
 */
export const createActivity = async (data: CreateActivityRequest): Promise<Activity> => {
  const response = await apiSpring.post<Activity>('/activities', data);
  return response.data;
};

/**
 * Update an activity (HR/Admin only)
 */
export const updateActivity = async (id: number, data: CreateActivityRequest): Promise<Activity> => {
  const response = await apiSpring.put<Activity>(`/activities/${id}`, data);
  return response.data;
};

/**
 * Delete an activity (HR/Admin only)
 */
export const deleteActivity = async (id: number): Promise<void> => {
  await apiSpring.delete(`/activities/${id}`);
};

/**
 * Get completed activities with excellent employee details
 */
export const getCompletedActivities = async (): Promise<CompletedActivityData[]> => {
  const response = await apiDotNet.get<CompletedActivityData[]>('/Activity/completed');
  return response.data;
};

export interface ParticipationDto {
    id: number,
    employeeId: number,
    activityId: number,
    employeeName: string,
    activityName: string,
    description: string,
    registerDate: Date,
    cancelDate: Date,
    status: string,
    result: string,
}

export interface ApiResponse<T> {
    success: boolean;
    message: string;
    data: T;
    errors: string[];
}

export interface PagedResult<T> {
    items: T[];
    pageNumber: number;
    pageSize: number;
    totalPages: number;
    hasPreviousPage: boolean;
    hasNextPage: boolean;
}


export const participationService = {
    getActivityEmployeeAttended: async (employeeId: number): Promise<ParticipationDto[]> => {
        const response = await apiDotNet.get<ApiResponse<ParticipationDto[]>>(
            `/Participation/employee/${employeeId}`
        );

        if (response.data.success) {
            return response.data.data;
        }

        throw new Error(response.data.message || 'Lỗi khi lấy thông tin các hoạt động nhân viên tham gia');
    },

    getResultActivity: async (activityId: number, employeeId: number): Promise<ParticipationDto> => {
        const response = await apiDotNet.get<ApiResponse<ParticipationDto>>(
            `/Participation/${activityId}-${employeeId}`
        );

        if (response.data.success) {
            return response.data.data;
        }

        throw new Error(response.data.message || 'Lỗi khi lấy kết quả hoạt động nhân viên tham gia');
    }
}

/**
 * Register for an activity
 */
export const registerActivity = async (activityId: number): Promise<void> => {
  await apiSpring.post('/participations/register', { activityId });
};

/**
 * Unregister from an activity
 */
export const unregisterActivity = async (activityId: number): Promise<void> => {
  await apiSpring.delete(`/participations/cancel/${activityId}`);
};

/**
 * Get my participations
 */
export const getMyParticipations = async (): Promise<MyParticipationResponse[]> => {
  const response = await apiSpring.get<MyParticipationResponse[]>('/participations/my-participations');
  return response.data;
};

/**
 * Get activity statistics
 */
export const getActivityStatistics = async (): Promise<{
  totalActivities: number;
  openRegistration: number;
  closedRegistration: number;
  statusDistribution: { status: string; count: number }[];
}> => {
  const response = await apiSpring.get<ActivityListResponse>('/activities', {
    params: { page: 1, pageSize: 10000 }
  });
  
  const activities = response.data.activities || [];
  const totalActivities = activities.length;
  
  // Đếm theo trạng thái
  let openRegistration = 0;
  let closedRegistration = 0;
  const statusMap = new Map<string, number>();
  
  activities.forEach(activity => {
    const status = activity.status?.toLowerCase() || 'unknown';
    statusMap.set(status, (statusMap.get(status) || 0) + 1);
    
    if (status === 'upcoming') {
      openRegistration++;
    } else if (status === 'completed') {
      closedRegistration++;
    }
  });
  
  const statusDistribution = Array.from(statusMap.entries()).map(([status, count]) => ({
    status,
    count,
  }));
  
  return {
    totalActivities,
    openRegistration,
    closedRegistration,
    statusDistribution,
  };
};
