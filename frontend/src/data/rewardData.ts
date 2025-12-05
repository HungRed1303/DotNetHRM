// Mock data cho hệ thống điểm thưởng

export interface RewardStats {
  currentPoints: number;
  totalAccumulatedPoints: number;
  redeemedPoints: number;
}

export interface NextReward {
  title: string;
  description: string;
  requiredPoints: number;
  currentProgress: number;
  maxProgress: number;
  daysRemaining: number;
}

export interface PointTransaction {
  id: string;
  type: 'earn' | 'redeem';
  amount: number;
  description: string;
  date: string;
  status: 'completed' | 'pending';
}

export interface RewardItem {
  id: string;
  name: string;
  description: string;
  pointsRequired: number;
  category: string;
  imageUrl?: string;
  available: boolean;
}

// Thống kê điểm thưởng của Nguyễn Văn An
export const mockRewardStats: RewardStats = {
  currentPoints: 650,
  totalAccumulatedPoints: 950,
  redeemedPoints: 300
};

// Phần thưởng tiếp theo
export const mockNextReward: NextReward = {
  title: 'Set quà tặng cao cấp',
  description: 'Bộ quà tặng doanh nghiệp cao cấp',
  requiredPoints: 800,
  currentProgress: 650,
  maxProgress: 800,
  daysRemaining: 150
};

// Lịch sử tích điểm
export const mockPointTransactions: PointTransaction[] = [
  {
    id: 'T001',
    type: 'earn',
    amount: 50,
    description: 'Hoàn thành dự án đúng hạn - Dự án Website ABC',
    date: '2024-11-28',
    status: 'completed'
  },
  {
    id: 'T002',
    type: 'earn',
    amount: 30,
    description: 'Tham gia hoạt động chạy bộ tháng 11',
    date: '2024-11-25',
    status: 'completed'
  },
  {
    id: 'T003',
    type: 'redeem',
    amount: -100,
    description: 'Đổi voucher Grab 100k',
    date: '2024-11-20',
    status: 'completed'
  },
  {
    id: 'T004',
    type: 'earn',
    amount: 100,
    description: 'Thưởng nhân viên xuất sắc tháng 11',
    date: '2024-11-15',
    status: 'completed'
  },
  {
    id: 'T005',
    type: 'earn',
    amount: 25,
    description: 'Check-in đúng giờ 20 ngày liên tiếp',
    date: '2024-11-10',
    status: 'completed'
  },
  {
    id: 'T006',
    type: 'redeem',
    amount: -50,
    description: 'Đổi voucher The Coffee House 50k',
    date: '2024-11-05',
    status: 'completed'
  },
  {
    id: 'T007',
    type: 'earn',
    amount: 75,
    description: 'Hỗ trợ đào tạo nhân viên mới',
    date: '2024-11-01',
    status: 'completed'
  },
  {
    id: 'T008',
    type: 'earn',
    amount: 40,
    description: 'Tham gia cuộc thi sáng tạo ý tưởng',
    date: '2024-10-28',
    status: 'completed'
  },
  {
    id: 'T009',
    type: 'redeem',
    amount: -150,
    description: 'Đổi phiếu mua hàng Shopee 150k',
    date: '2024-10-20',
    status: 'completed'
  },
  {
    id: 'T010',
    type: 'earn',
    amount: 60,
    description: 'Hoàn thành khóa học kỹ năng mềm',
    date: '2024-10-15',
    status: 'completed'
  },
  {
    id: 'T011',
    type: 'earn',
    amount: 35,
    description: 'Đề xuất cải tiến quy trình làm việc',
    date: '2024-10-10',
    status: 'completed'
  },
  {
    id: 'T012',
    type: 'earn',
    amount: 45,
    description: 'Tham gia team building quý 4',
    date: '2024-10-05',
    status: 'completed'
  }
];

// Danh sách phần thưởng có thể đổi
export const mockRewardItems: RewardItem[] = [
  {
    id: 'R001',
    name: 'Voucher Grab 50k',
    description: 'Mã giảm giá Grab trị giá 50.000đ',
    pointsRequired: 50,
    category: 'Voucher',
    available: true
  },
  {
    id: 'R002',
    name: 'Voucher Grab 100k',
    description: 'Mã giảm giá Grab trị giá 100.000đ',
    pointsRequired: 100,
    category: 'Voucher',
    available: true
  },
  {
    id: 'R003',
    name: 'Voucher The Coffee House 50k',
    description: 'Phiếu mua hàng The Coffee House 50.000đ',
    pointsRequired: 50,
    category: 'Voucher',
    available: true
  },
  {
    id: 'R004',
    name: 'Voucher Highlands Coffee 100k',
    description: 'Phiếu mua hàng Highlands Coffee 100.000đ',
    pointsRequired: 100,
    category: 'Voucher',
    available: true
  },
  {
    id: 'R005',
    name: 'Phiếu mua hàng Shopee 150k',
    description: 'Mã giảm giá Shopee trị giá 150.000đ',
    pointsRequired: 150,
    category: 'Voucher',
    available: true
  },
  {
    id: 'R006',
    name: 'Phiếu mua hàng Lazada 200k',
    description: 'Mã giảm giá Lazada trị giá 200.000đ',
    pointsRequired: 200,
    category: 'Voucher',
    available: true
  },
  {
    id: 'R007',
    name: 'Bình giữ nhiệt cao cấp',
    description: 'Bình giữ nhiệt Lock&Lock 500ml',
    pointsRequired: 300,
    category: 'Quà tặng',
    available: true
  },
  {
    id: 'R008',
    name: 'Ba lô laptop',
    description: 'Ba lô laptop thương hiệu Mikkor',
    pointsRequired: 500,
    category: 'Quà tặng',
    available: true
  },
  {
    id: 'R009',
    name: 'Set quà tặng cao cấp',
    description: 'Bộ quà tặng doanh nghiệp cao cấp',
    pointsRequired: 800,
    category: 'Quà tặng',
    available: true
  },
  {
    id: 'R010',
    name: 'Ngày nghỉ phép thêm',
    description: '1 ngày nghỉ phép có lương',
    pointsRequired: 1000,
    category: 'Phúc lợi',
    available: true
  },
  {
    id: 'R011',
    name: 'Thẻ gym 1 tháng',
    description: 'Thẻ tập gym California Fitness 1 tháng',
    pointsRequired: 600,
    category: 'Phúc lợi',
    available: true
  },
  {
    id: 'R012',
    name: 'Khóa học online',
    description: 'Voucher khóa học Udemy trị giá 500k',
    pointsRequired: 400,
    category: 'Đào tạo',
    available: true
  }
];
