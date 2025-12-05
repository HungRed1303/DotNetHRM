/**
 * activity.ts - Định nghĩa types cho các hoạt động công ty
 * Chủ yếu quản lý các cuộc thi chạy bộ và hoạt động thể thao
 */

export interface RunningCompetition {
  id: string;
  name: string;
  description: string;
  startDate: Date;
  endDate: Date;
  status: 'draft' | 'active' | 'completed' | 'cancelled';
  targetDistance?: number; // Mục tiêu km (nếu có)
  rules: string;
  prizes: CompetitionPrize[];
  participants: string[]; // Employee IDs
  createdBy: string;
  createdAt: Date;
}

export interface CompetitionPrize {
  rank: number;
  title: string;
  description: string;
  points: number;
  cashReward?: number;
}

export interface RunningRecord {
  id: string;
  employeeId: string;
  competitionId: string;
  date: Date;
  distance: number; // km
  duration: number; // minutes
  averageSpeed: number; // km/h
  location?: string;
  notes?: string;
  verified: boolean;
  verifiedBy?: string;
  verifiedAt?: Date;
}

export interface CompetitionLeaderboard {
  employeeId: string;
  employeeName: string;
  totalDistance: number;
  totalRuns: number;
  averageSpeed: number;
  rank: number;
  points: number;
}

export interface CompetitionStats {
  totalParticipants: number;
  totalDistance: number;
  totalRuns: number;
  averageDistance: number;
  topRunners: CompetitionLeaderboard[];
}
