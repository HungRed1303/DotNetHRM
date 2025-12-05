export interface Employee {
  id: string;
  employeeCode: string;
  fullName: string;
  email: string;
  phone: string;
  citizenId: string; // Căn cước công dân
  taxCode: string; // Mã số thuế
  address: string;
  bankAccount: {
    accountNumber: string;
    bankName: string;
    accountHolder: string;
  };
  department: string;
  position: string;
  joinDate: string; // ISO date string
  birthDate: string; // ISO date string - Ngày sinh nhật
  gender: 'male' | 'female' | 'other'; // Giới tính
  avatar?: string;
  status: 'active' | 'inactive' | 'terminated';
  role: 'employee' | 'manager' | 'admin';
  currentPoints: number;
  totalPoints: number;
}

export interface CreateEmployeeRequest {
  fullName: string;
  email: string;
  phone: string;
  citizenId: string;
  taxCode: string;
  address: string;
  gender: 'male' | 'female' | 'other';
  bankAccount: {
    accountNumber: string;
    bankName: string;
    accountHolder: string;
  };
  department: string;
  position: string;
  role: 'employee' | 'manager' | 'admin';
  joinDate: Date;
}

export interface UpdateEmployeeRequest extends Partial<CreateEmployeeRequest> {
  id: string;
  employeeCode: string;
  avatar: string;
  status: 'active' | 'inactive' | 'terminated';
  currentPoints: number,
  totalPoints: number,
}
