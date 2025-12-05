import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeftIcon, UserIcon, EnvelopeIcon, PhoneIcon, MapPinIcon, CreditCardIcon, BanknotesIcon, CalendarIcon, BuildingOfficeIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';
import { employeeService } from '../../services/employeeService';

interface EmployeeDetail {
    id: number;
    fullname: string;
    cccd: string;
    taxCode: string;
    phone: string;
    address: string;
    bankAccount: string;
    joinDate: string;
    status: string;
    birthday: string;
    gender: string;
    email: string;
    roleId: number;
    roleName: string;
    departmentId: number;
    departmentName: string;
    createdAt: string;
    updatedAt: string;
}

interface ApiResponse {
    success: boolean;
    message: string;
    data: EmployeeDetail;
}

const EmployeeDetail = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [employee, setEmployee] = useState<EmployeeDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchEmployeeDetail = async () => {
            try {
                setLoading(true);
                const response: ApiResponse = await employeeService.getEmployeeById(Number(id));
                if (response.success) {
                    setEmployee(response.data);
                }
            } catch (err) {
                setError('Không thể tải thông tin nhân viên');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchEmployeeDetail();
        }
    }, [id]);

    const formatDate = (dateString: string) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN');
    };

    const getStatusBadgeColor = (status: string) => {
        switch (status) {
            case 'active':
                return 'bg-green-100 text-green-800';
            case 'inactive':
                return 'bg-yellow-100 text-yellow-800';
            case 'terminated':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'active':
                return 'Đang làm việc';
            case 'inactive':
                return 'Tạm nghỉ';
            case 'terminated':
                return 'Đã nghỉ việc';
            default:
                return status;
        }
    };

    const getGenderText = (gender: string) => {
        switch (gender) {
            case 'male':
                return 'Nam';
            case 'female':
                return 'Nữ';
            default:
                return 'Khác';
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Đang tải thông tin...</p>
                </div>
            </div>
        );
    }

    if (error || !employee) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-red-600">{error || 'Không tìm thấy thông tin nhân viên'}</p>
                    <button
                        onClick={() => navigate('/employee/list')}
                        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                        Quay lại danh sách
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <div className="mb-6">
                    <button
                        onClick={() => navigate('/employee/list')}
                        className="flex items-center text-gray-600 hover:text-gray-900 mb-4 transition-colors"
                    >
                        <ArrowLeftIcon className="w-5 h-5 mr-2" />
                        Quay lại danh sách
                    </button>
                    <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-8 shadow-xl text-white">
                        <div className="flex items-center space-x-6">
                            <div className="h-24 w-24 rounded-full bg-white flex items-center justify-center">
                                <span className="text-4xl font-bold text-blue-600">
                                    {employee.fullname.charAt(0).toUpperCase()}
                                </span>
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold mb-2">{employee.fullname}</h1>
                                <div className="flex items-center space-x-4">
                                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusBadgeColor(employee.status)}`}>
                                        {getStatusText(employee.status)}
                                    </span>
                                    <span className="text-blue-100">{employee.departmentName}</span>
                                    <span className="text-blue-100">•</span>
                                    <span className="text-blue-100">{employee.roleName}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Thông tin cá nhân */}
                    <div className="bg-white rounded-xl shadow-md p-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                            <UserIcon className="w-6 h-6 mr-2 text-blue-600" />
                            Thông tin cá nhân
                        </h2>
                        <div className="space-y-4">
                            <div className="flex items-start">
                                <EnvelopeIcon className="w-5 h-5 text-gray-400 mt-1 mr-3" />
                                <div>
                                    <p className="text-sm text-gray-500">Email</p>
                                    <p className="text-gray-900 font-medium">{employee.email}</p>
                                </div>
                            </div>
                            <div className="flex items-start">
                                <PhoneIcon className="w-5 h-5 text-gray-400 mt-1 mr-3" />
                                <div>
                                    <p className="text-sm text-gray-500">Số điện thoại</p>
                                    <p className="text-gray-900 font-medium">{employee.phone}</p>
                                </div>
                            </div>
                            <div className="flex items-start">
                                <CalendarIcon className="w-5 h-5 text-gray-400 mt-1 mr-3" />
                                <div>
                                    <p className="text-sm text-gray-500">Ngày sinh</p>
                                    <p className="text-gray-900 font-medium">{formatDate(employee.birthday)}</p>
                                </div>
                            </div>
                            <div className="flex items-start">
                                <UserIcon className="w-5 h-5 text-gray-400 mt-1 mr-3" />
                                <div>
                                    <p className="text-sm text-gray-500">Giới tính</p>
                                    <p className="text-gray-900 font-medium">{getGenderText(employee.gender)}</p>
                                </div>
                            </div>
                            <div className="flex items-start">
                                <MapPinIcon className="w-5 h-5 text-gray-400 mt-1 mr-3" />
                                <div>
                                    <p className="text-sm text-gray-500">Địa chỉ</p>
                                    <p className="text-gray-900 font-medium">{employee.address}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Thông tin công việc */}
                    <div className="bg-white rounded-xl shadow-md p-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                            <BuildingOfficeIcon className="w-6 h-6 mr-2 text-blue-600" />
                            Thông tin công việc
                        </h2>
                        <div className="space-y-4">
                            <div className="flex items-start">
                                <BuildingOfficeIcon className="w-5 h-5 text-gray-400 mt-1 mr-3" />
                                <div>
                                    <p className="text-sm text-gray-500">Phòng ban</p>
                                    <p className="text-gray-900 font-medium">{employee.departmentName}</p>
                                </div>
                            </div>
                            <div className="flex items-start">
                                <ShieldCheckIcon className="w-5 h-5 text-gray-400 mt-1 mr-3" />
                                <div>
                                    <p className="text-sm text-gray-500">Vai trò</p>
                                    <p className="text-gray-900 font-medium">{employee.roleName}</p>
                                </div>
                            </div>
                            <div className="flex items-start">
                                <CalendarIcon className="w-5 h-5 text-gray-400 mt-1 mr-3" />
                                <div>
                                    <p className="text-sm text-gray-500">Ngày vào làm</p>
                                    <p className="text-gray-900 font-medium">{formatDate(employee.joinDate)}</p>
                                </div>
                            </div>
                            <div className="flex items-start">
                                <CreditCardIcon className="w-5 h-5 text-gray-400 mt-1 mr-3" />
                                <div>
                                    <p className="text-sm text-gray-500">CCCD</p>
                                    <p className="text-gray-900 font-medium">{employee.cccd}</p>
                                </div>
                            </div>
                            <div className="flex items-start">
                                <CreditCardIcon className="w-5 h-5 text-gray-400 mt-1 mr-3" />
                                <div>
                                    <p className="text-sm text-gray-500">Mã số thuế</p>
                                    <p className="text-gray-900 font-medium">{employee.taxCode}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Thông tin ngân hàng */}
                    <div className="bg-white rounded-xl shadow-md p-6 lg:col-span-2">
                        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                            <BanknotesIcon className="w-6 h-6 mr-2 text-blue-600" />
                            Thông tin ngân hàng
                        </h2>
                        <div className="space-y-4">
                            <div className="flex items-start">
                                <BanknotesIcon className="w-5 h-5 text-gray-400 mt-1 mr-3" />
                                <div>
                                    <p className="text-sm text-gray-500">Số tài khoản</p>
                                    <p className="text-gray-900 font-medium text-lg">{employee.bankAccount}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Thông tin hệ thống */}
                    <div className="bg-white rounded-xl shadow-md p-6 lg:col-span-2">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">Thông tin hệ thống</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div>
                                <p className="text-gray-500">Ngày tạo</p>
                                <p className="text-gray-900 font-medium">{formatDate(employee.createdAt)}</p>
                            </div>
                            <div>
                                <p className="text-gray-500">Cập nhật lần cuối</p>
                                <p className="text-gray-900 font-medium">{formatDate(employee.updatedAt)}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-6 flex justify-end space-x-4">
                    <button
                        onClick={() => navigate(`/employee/edit/${employee.id}`)}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                    >
                        Chỉnh sửa
                    </button>
                    <button
                        onClick={() => navigate('/employees')}
                        className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-semibold"
                    >
                        Đóng
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EmployeeDetail;