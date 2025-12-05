import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Search, UserPlus, Filter, Mail, Building2, Briefcase, Loader2, AlertCircle } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchEmployees, updateEmployeeWorkingInfo } from '../../store/employeeSlice';
import EmployeeDetailModal from '../../components/profile/EmployeeDetailModal';
import UpdateEmployeeWorkingInformation from '../../components/profile/ProfileFromEmployeeForHR';

const EmployeeList = () => {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();

    // Redux state
    const {
        employees,
        loading,
        error
    } = useAppSelector((state) => state.employee);

    // Local state
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedDepartment, setSelectedDepartment] = useState('');
    const [selectedRole, setSelectedRole] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('');
    const [selectedEmployeeId, setSelectedEmployeeId] = useState<number | null>(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Chỉ fetch một lần khi component mount
    useEffect(() => {
        dispatch(fetchEmployees({
            pageNumber: 1,
            pageSize: 100, // Lấy nhiều records để filter trên client
        }));
    }, [dispatch]);

    console.log("Employees fetched:", employees);
    // Filter danh sách nhân viên trên client
    const filteredEmployees = useMemo(() => {
        return employees.filter(employee => {
            const matchesSearch = !searchTerm ||
                employee.fullname.toLowerCase().includes(searchTerm.toLowerCase()) ||
                employee.email.toLowerCase().includes(searchTerm.toLowerCase());

            const matchesDepartment = !selectedDepartment ||
                employee.departmentName.toLowerCase().includes(selectedDepartment.toLowerCase());

            const matchesRole = !selectedRole ||
                employee.roleName.toLowerCase().includes(selectedRole.toLowerCase());

            const matchesStatus = !selectedStatus ||
                employee.status === selectedStatus;

            return matchesSearch && matchesDepartment && matchesRole && matchesStatus;
        });
    }, [employees, searchTerm, selectedDepartment, selectedRole, selectedStatus]);

    // Pagination trên client
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;
    const totalFilteredPages = Math.ceil(filteredEmployees.length / itemsPerPage);
    const startIdx = (currentPage - 1) * itemsPerPage;
    const endIdx = startIdx + itemsPerPage;
    const currentEmployees = filteredEmployees.slice(startIdx, endIdx);

    // Reset về trang 1 khi filter thay đổi
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, selectedDepartment, selectedRole, selectedStatus]);

    // Tính toán phân trang cho hiển thị
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + currentEmployees.length;

    // Xử lý xem chi tiết
    const handleViewDetail = (employeeId: number) => {
        setSelectedEmployeeId(employeeId);
        setIsDetailModalOpen(true);
    };

    // Xử lý đóng modal
    const handleCloseModal = () => {
        setIsDetailModalOpen(false);
        setIsUpdateModalOpen(false);
        setSelectedEmployeeId(null);
    };

    //Xử lý cập nhật
    const handleUpdate = (employeeId: number) => {
        setSelectedEmployeeId(employeeId);
        setIsUpdateModalOpen(true);
    };

    // Xử lý submit cập nhật thông tin làm việc
    const handleUpdateSubmit = async (data: { employeeId: number; fullname: string; departmentId: number; status: string; phone: string; email: string; address: string; bankAccount: string; birthday: string; gender: string }) => {
        if (!data.employeeId) return;

        setIsSubmitting(true);
        try {
            await dispatch(updateEmployeeWorkingInfo({
                id: data.employeeId,
                data: {
                    fullname: data.fullname,
                    status: data.status,
                    departmentId: data.departmentId,
                    phone: data.phone,
                    email: data.email,
                    address: data.address,
                    bankAccount: data.bankAccount,
                    birthday: data.birthday,
                    gender: data.gender,
                }
            })).unwrap();

            // Refresh danh sách nhân viên sau khi cập nhật thành công
            dispatch(fetchEmployees({
                pageNumber: 1,
                pageSize: 1000,
            }));
        } catch (error) {
            console.error('Lỗi khi cập nhật thông tin nhân viên:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const getStatusBadgeColor = (status: string) => {
        switch (status) {
            case 'active':
                return 'bg-green-100 text-green-800';
            case 'inactive':
                return 'bg-yellow-100 text-yellow-800';
            case 'terminated':
            case 'suspended':
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
                return '';
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-6xl mx-auto rounded-2xl overflow-hidden shadow-xl">
                {/* Header */}
                <div className="bg-linear-to-r from-blue-600 to-blue-700 p-6 shadow-lg">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <Users className="w-8 h-8 text-white" />
                            <div className="text-2xl font-bold text-white">Quản lý Hồ sơ Nhân viên</div>
                        </div>
                        <button
                            onClick={() => navigate('/create/employee')}
                            className="px-4 py-2 bg-white text-blue-600 rounded-lg font-semibold hover:bg-gray-100 transition-all flex items-center space-x-2"
                            style={{
                                transition: 'all 0.3s ease'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'translateY(-2px)';
                                e.currentTarget.style.boxShadow = '0 5px 20px rgba(255, 255, 255, 0.3)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = 'none';
                            }}
                        >
                            <UserPlus className="w-4 h-4" />
                            <span>Thêm nhân viên</span>
                        </button>
                    </div>
                </div>

                {/* Search and Filter */}
                <div className="bg-white p-6 shadow-md">
                    {/* Search Bar */}
                    <div className="mb-4">
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Search className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                type="text"
                                placeholder="Tìm kiếm theo tên, mã nhân viên..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:outline-none"
                            />
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Department Filter */}
                        <div>
                            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                                <Building2 className="w-4 h-4" />
                                Phòng ban
                            </label>
                            <input
                                type="text"
                                placeholder="Nhập tên phòng ban..."
                                value={selectedDepartment}
                                onChange={(e) => setSelectedDepartment(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:outline-none"
                            />
                        </div>

                        {/* Position/Role Filter */}
                        <div>
                            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                                <Briefcase className="w-4 h-4" />
                                Chức vụ
                            </label>
                            <input
                                type="text"
                                placeholder="Nhập tên chức vụ..."
                                value={selectedRole}
                                onChange={(e) => setSelectedRole(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:outline-none"
                            />
                        </div>

                        {/* Status Filter */}
                        <div>
                            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                                <Filter className="w-4 h-4" />
                                Trạng thái
                            </label>
                            <select
                                value={selectedStatus}
                                onChange={(e) => setSelectedStatus(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:outline-none appearance-none bg-white cursor-pointer"
                                style={{
                                    backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                                    backgroundPosition: 'right 0.5rem center',
                                    backgroundRepeat: 'no-repeat',
                                    backgroundSize: '1.5em 1.5em',
                                    paddingRight: '2.5rem'
                                }}
                            >
                                <option value="">Tất cả trạng thái</option>
                                <option value="active">Đang làm việc</option>
                                <option value="inactive">Tạm nghỉ</option>
                                <option value="terminated">Đã nghỉ việc</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Employee Table */}
                <div className="bg-white shadow-md">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        NHÂN VIÊN
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        PHÒNG BAN
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        CHỨC VỤ
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        TRẠNG THÁI
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        THAO TÁC
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {loading ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-12 text-center">
                                            <div className="flex justify-center items-center">
                                                <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
                                                <span className="ml-3 text-gray-600">Đang tải dữ liệu...</span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : error ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-12 text-center">
                                            <div className="flex flex-col items-center text-red-600">
                                                <AlertCircle className="h-12 w-12 mb-2" />
                                                <p className="font-medium">Có lỗi xảy ra</p>
                                                <p className="text-sm mt-1">{error}</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : currentEmployees.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                                            Không tìm thấy nhân viên nào
                                        </td>
                                    </tr>
                                ) : (
                                    currentEmployees.map((employee) => (
                                        <tr key={employee.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="shrink-0 h-10 w-10">
                                                        <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
                                                            {employee.fullname.charAt(0)}
                                                        </div>
                                                    </div>
                                                    <div className="ml-4 text-left">
                                                        <div className="text-sm font-medium text-gray-900">{employee.fullname}</div>
                                                        <div className="flex items-center text-sm text-gray-500">
                                                            <Mail className="w-3 h-3 mr-1" />
                                                            {employee.email}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-left">
                                                <div className="text-sm text-gray-900">{employee.departmentName}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-left">
                                                <div className="text-sm text-gray-900">{employee.roleName}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-left">
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeColor(employee.status)}`}>
                                                    {getStatusText(employee.status)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-left text-sm font-medium">
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => handleViewDetail(employee.id)}
                                                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-all"
                                                        style={{
                                                            transition: 'all 0.3s ease'
                                                        }}
                                                        onMouseEnter={(e) => {
                                                            e.currentTarget.style.transform = 'translateY(-2px)';
                                                            e.currentTarget.style.boxShadow = '0 5px 20px rgba(102, 126, 234, 0.4)';
                                                        }}
                                                        onMouseLeave={(e) => {
                                                            e.currentTarget.style.transform = 'translateY(0)';
                                                            e.currentTarget.style.boxShadow = 'none';
                                                        }}
                                                    >
                                                        Xem chi tiết
                                                    </button>
                                                    <button
                                                        onClick={() => handleUpdate(employee.id)}
                                                        className="bg-white hover:bg-gray-100 text-blue-700 px-4 py-2 rounded-lg transition-all"
                                                        style={{
                                                            transition: 'all 0.3s ease'
                                                        }}
                                                        onMouseEnter={(e) => {
                                                            e.currentTarget.style.transform = 'translateY(-2px)';
                                                            e.currentTarget.style.boxShadow = '0 5px 20px rgba(34, 197, 94, 0.4)';
                                                        }}
                                                        onMouseLeave={(e) => {
                                                            e.currentTarget.style.transform = 'translateY(0)';
                                                            e.currentTarget.style.boxShadow = 'none';
                                                        }}
                                                    >
                                                        ✎
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                        <div className="flex-1 flex justify-between sm:hidden">
                            <button
                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                            >
                                Trước
                            </button>
                            <button
                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalFilteredPages))}
                                disabled={currentPage === totalFilteredPages}
                                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                            >
                                Sau
                            </button>
                        </div>
                        <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                            <div>
                                <p className="text-sm text-gray-700">
                                    Hiển thị <span className="font-medium">{startIndex + 1}</span> - <span className="font-medium">{endIndex}</span> trong tổng số <span className="font-medium">{filteredEmployees.length}</span> nhân viên
                                </p>
                            </div>
                            <div>
                                <nav className="relative z-0 inline-flex gap-1.5" aria-label="Pagination">
                                    <button
                                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                        disabled={currentPage === 1}
                                        className="relative inline-flex items-center px-3 py-1.5 rounded border border-gray-400 bg-white text-xs font-medium text-black hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed justify-center"
                                    >
                                        ‹
                                    </button>
                                    {Array.from({ length: totalFilteredPages }, (_, i) => i + 1).map((page) => (
                                        <button
                                            key={page}
                                            onClick={() => setCurrentPage(page)}
                                            className={`relative inline-flex items-center px-3 py-1.5 rounded border text-xs font-medium justify-center ${currentPage === page
                                                ? 'bg-blue-600 border-blue-600 text-white'
                                                : 'bg-white border-gray-400 text-black hover:bg-gray-50'
                                                }`}
                                        >
                                            {page}
                                        </button>
                                    ))}
                                    <button
                                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalFilteredPages))}
                                        disabled={currentPage === totalFilteredPages}
                                        className="relative inline-flex items-center px-3 py-1.5 rounded border border-gray-400 bg-white text-xs font-bold text-black hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed justify-center"
                                    >
                                        ›
                                    </button>
                                </nav>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Employee Detail Modal */}
            <EmployeeDetailModal
                employeeId={selectedEmployeeId}
                isOpen={isDetailModalOpen}
                onClose={handleCloseModal}
            />

            {/* Employee Update Modal for HR */}
            <UpdateEmployeeWorkingInformation
                employeeId={selectedEmployeeId}
                isOpen={isUpdateModalOpen}
                onClose={handleCloseModal}
                onSubmit={handleUpdateSubmit}
                isSubmitting={isSubmitting}
            />

        </div>
    );
};

export default EmployeeList;