import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserPlus, ArrowLeft, User, Phone, CreditCard, Hash, MapPin, Mail, Calendar, UserCircle, Building2, Wallet, RotateCcw, Save, Loader2, Briefcase } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { createEmployee } from '../../store/employeeSlice';

const CreateEmployee = () => {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const { createLoading } = useAppSelector((state) => state.employee);

    const [formData, setFormData] = useState({
        fullName: '',
        birthday: '',
        phone: '',
        Cccd: '',
        taxCode: '',
        address: '',
        email: '',
        joinDate: '',
        gender: '',
        departmentId: '',
        roleId: '',
        bankAccount: '',
    });

    const [errors, setErrors] = useState({
        phone: '',
        Cccd: '',
        taxCode: '',
        email: '',
        bankAccount: '',
        birthday: '',
    });

    const handleChange = (
        e: React.ChangeEvent<
            HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
        >
    ) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        validateField(name, value);
    };

    const validateField = (name: string, value: string) => {
        let error = '';

        switch (name) {
            case 'phone':
                if (value && !/^[0-9]{10}$/.test(value)) {
                    error = 'Số điện thoại chứa chữ hoặc không đủ 10 chữ số';
                }
                break;
            case 'Cccd':
                if (value && !/^[0-9]{12}$/.test(value)) {
                    error = 'Số CCCD chứa chữ hoặc không đủ 10 chữ số';
                }
                break;
            case 'taxCode':
                if (value && !/^[0-9]{10}$/.test(value)) {
                    error = 'Mã số thuế chứa chữ hoặc không đủ 10 chữ số';
                }
                break;
            case 'email':
                if (value && !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[cC][oO][mM]$/.test(value)) {
                    error = 'Email phải có định dạng ten@company.com';
                }
                break;
            case 'bankAccount':
                if (value && !/^[0-9]{8,15}$/.test(value)) {
                    error = 'Số tài khoản chứa chữ hoặc không đủ từ 8 đến 15 chữ số';
                }
                break;
            case 'birthday':
                if (value) {
                    const birthDate = new Date(value);
                    const today = new Date();
                    const age = today.getFullYear() - birthDate.getFullYear();
                    const monthDiff = today.getMonth() - birthDate.getMonth();
                    const dayDiff = today.getDate() - birthDate.getDate();
                    
                    // Điều chỉnh tuổi nếu chưa đến sinh nhật trong năm hiện tại
                    const actualAge = (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) ? age - 1 : age;
                    
                    if (actualAge < 18) {
                        error = 'Nhân viên phải từ 18 tuổi trở lên';
                    }
                }
                break;
        }

        setErrors(prev => ({
            ...prev,
            [name]: error
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        // Kiểm tra validation errors
        const hasErrors = Object.values(errors).some(error => error !== '');
        if (hasErrors) {
            alert('Vui lòng sửa các lỗi trước khi lưu!');
            return;
        }

        console.log('Submitting form data:', formData);
        
        try {
            const result = await dispatch(createEmployee({
                fullName: formData.fullName,
                birthday: formData.birthday,
                phone: formData.phone,
                Cccd: formData.Cccd,
                taxCode: formData.taxCode || null,
                address: formData.address,
                email: formData.email,
                joinDate: formData.joinDate,
                gender: formData.gender,
                departmentId: parseInt(formData.departmentId),
                roleId: parseInt(formData.roleId),
                bankAccount: formData.bankAccount,
            })).unwrap();

            if (result.success) {
                alert('Tạo hồ sơ nhân viên thành công!');
                navigate('/employee/list');
            } else {
                console.log(result);
                alert(result.message || 'Có sự cố xảy ra khi tạo hồ sơ!');
            }
        } catch (error: any) {
            const errorMessage = error.message ? error.message : 'Có lỗi xảy ra khi tạo hồ sơ nhân viên!';
            alert(errorMessage);
        }
    };

    const handleReset = () => {
        setFormData({
            fullName: '',
            birthday: '',
            phone: '',
            Cccd: '',
            taxCode: '',
            address: '',
            email: '',
            joinDate: '',
            gender: '',
            departmentId: '',
            roleId: '',
            bankAccount: '',
        });
        setErrors({
            phone: '',
            Cccd: '',
            taxCode: '',
            email: '',
            bankAccount: '',
            birthday: '',
        });
    };

    return (
        <div className="min-h-screen p-6">
            <div className="max-w-4xl mx-auto">
                <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl overflow-hidden">
                    {/* Header */}
                    <div className="p-6 bg-linear-to-r from-blue-600 to-blue-700">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                <UserPlus className="w-8 h-8 text-white" />
                                <div className="text-2xl font-bold text-white">Thêm Hồ sơ Nhân viên Mới</div>
                            </div>
                            <button
                                type="button"
                                onClick={() => navigate('/employee/list')}
                                className="px-4 py-2 bg-white text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition-all flex items-center gap-2"
                            >
                                <ArrowLeft className="w-4 h-4" />
                                <span>Quay lại</span>
                            </button>
                        </div>
                    </div>

                    <div className="p-6 space-y-6">
                        {/* Thông tin cá nhân */}
                        <div>
                            <div className="flex items-center gap-2 mb-4 pb-2 border-b-2 border-blue-500">
                                <User className="w-5 h-5 text-blue-600" />
                                <h2 className="text-lg font-semibold text-gray-800">Thông tin cá nhân</h2>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                                        <User className="w-4 h-4" />
                                        Họ và tên <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="fullName"
                                        value={formData.fullName}
                                        onChange={handleChange}
                                        placeholder="Nhập họ và tên"
                                        required
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:outline-none"
                                    />
                                </div>

                                <div>
                                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                                        <Calendar className="w-4 h-4" />
                                        Ngày sinh <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="date"
                                        name="birthday"
                                        value={formData.birthday}
                                        onChange={handleChange}
                                        required
                                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:border-transparent focus:outline-none ${
                                            errors.birthday ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                                        }`}
                                    />
                                    {errors.birthday && <p className="text-red-500 text-xs mt-1 text-left">{errors.birthday}</p>}
                                </div>

                                <div>
                                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                                        <Phone className="w-4 h-4" />
                                        Số điện thoại <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        placeholder="0901234567"
                                        required
                                        maxLength={10}
                                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:border-transparent focus:outline-none ${
                                            errors.phone ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                                        }`}
                                    />
                                    {errors.phone && <p className="text-red-500 text-xs mt-1 text-left">{errors.phone}</p>}
                                </div>

                                <div>
                                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                                        <CreditCard className="w-4 h-4" />
                                        Số CCCD <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="Cccd"
                                        value={formData.Cccd}
                                        onChange={handleChange}
                                        placeholder="Nhập số căn cước công dân"
                                        required
                                        maxLength={12}
                                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:border-transparent focus:outline-none ${
                                            errors.Cccd ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                                        }`}
                                    />
                                    {errors.Cccd && <p className="text-red-500 text-xs mt-1 text-left">{errors.Cccd}</p>}
                                </div>

                                <div>
                                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                                        <Hash className="w-4 h-4" />
                                        Mã số thuế
                                    </label>
                                    <input
                                        type="text"
                                        name="taxCode"
                                        value={formData.taxCode}
                                        onChange={handleChange}
                                        placeholder="Nhập mã số thuế (nếu có)"
                                        maxLength={10}
                                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:border-transparent focus:outline-none ${
                                            errors.taxCode ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                                        }`}
                                    />
                                    {errors.taxCode && <p className="text-red-500 text-xs mt-1 text-left">{errors.taxCode}</p>}
                                </div>

                                <div>
                                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                                        <UserCircle className="w-4 h-4" />
                                        Giới tính <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        name="gender"
                                        value={formData.gender}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:outline-none appearance-none bg-white cursor-pointer"
                                        style={{
                                            backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                                            backgroundPosition: 'right 0.5rem center',
                                            backgroundRepeat: 'no-repeat',
                                            backgroundSize: '1.5em 1.5em',
                                            paddingRight: '2.5rem'
                                        }}
                                    >
                                        <option value="">Chọn giới tính</option>
                                        <option value="male">Nam</option>
                                        <option value="female">Nữ</option>
                                        <option value="other">Khác</option>
                                    </select>
                                </div>
                            </div>

                            <div className="mt-4">
                                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                                    <MapPin className="w-4 h-4" />
                                    Địa chỉ <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    name="address"
                                    value={formData.address}
                                    onChange={handleChange}
                                    placeholder="Nhập địa chỉ đầy đủ"
                                    required
                                    rows={3}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:outline-none resize-none"
                                />
                            </div>
                        </div>

                        {/* Thông tin công việc */}
                        <div>
                            <div className="flex items-center gap-2 mb-4 pb-2 border-b-2 border-blue-500">
                                <Building2 className="w-5 h-5 text-blue-600" />
                                <h2 className="text-lg font-semibold text-gray-800">Thông tin công việc</h2>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                                        <Mail className="w-4 h-4" />
                                        Email công ty <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        placeholder="ten@company.com"
                                        required
                                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:border-transparent focus:outline-none ${
                                            errors.email ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                                        }`}
                                    />
                                    {errors.email && <p className="text-red-500 text-xs mt-1 text-left">{errors.email}</p>}
                                </div>

                                <div>
                                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                                        <Calendar className="w-4 h-4" />
                                        Ngày bắt đầu làm việc <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="date"
                                        name="joinDate"
                                        value={formData.joinDate}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:outline-none"
                                    />
                                </div>

                                <div>
                                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                                        <Building2 className="w-4 h-4" />
                                        Phòng ban <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        name="departmentId"
                                        value={formData.departmentId}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:outline-none appearance-none bg-white cursor-pointer"
                                        style={{
                                            backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                                            backgroundPosition: 'right 0.5rem center',
                                            backgroundRepeat: 'no-repeat',
                                            backgroundSize: '1.5em 1.5em',
                                            paddingRight: '2.5rem'
                                        }}
                                    >
                                        <option value="">Chọn phòng ban</option>
                                        <option value="1">Công nghệ</option>
                                        <option value="2">Nhân sự</option>
                                        <option value="3">Kinh doanh</option>
                                        <option value="4">Marketing</option>
                                        <option value="5">Kế toán</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                                        <Briefcase className="w-4 h-4" />
                                        Vai trò <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        name="roleId"
                                        value={formData.roleId}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:outline-none appearance-none bg-white cursor-pointer"
                                        style={{
                                            backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                                            backgroundPosition: 'right 0.5rem center',
                                            backgroundRepeat: 'no-repeat',
                                            backgroundSize: '1.5em 1.5em',
                                            paddingRight: '2.5rem'
                                        }}
                                    >
                                        <option value="">Chọn vai trò</option>
                                        <option value="1">Admin</option>
                                        <option value="2">Manager</option>
                                        <option value="3">Employee</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Thông tin ngân hàng */}
                        <div>
                            <div className="flex items-center gap-2 mb-4 pb-2 border-b-2 border-blue-500">
                                <Wallet className="w-5 h-5 text-blue-600" />
                                <h2 className="text-lg font-semibold text-gray-800">Thông tin ngân hàng</h2>
                            </div>

                            <div className="grid grid-cols-1 gap-4">
                                <div>
                                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                                        <Wallet className="w-4 h-4" />
                                        Số tài khoản <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="bankAccount"
                                        value={formData.bankAccount}
                                        onChange={handleChange}
                                        placeholder="Nhập số tài khoản ngân hàng"
                                        required
                                        minLength={8}
                                        maxLength={15}
                                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:border-transparent focus:outline-none ${
                                            errors.bankAccount ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                                        }`}
                                    />
                                    {errors.bankAccount && <p className="text-red-500 text-xs mt-1 text-left">{errors.bankAccount}</p>}
                                </div>
                            </div>
                        </div>

                        {/* Buttons */}
                        <div className="flex justify-end gap-4 pt-6 border-t">
                            <button
                                type="button"
                                onClick={handleReset}
                                disabled={createLoading}
                                className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <RotateCcw className="w-4 h-4" />
                                Đặt lại
                            </button>
                            <button
                                type="submit"
                                disabled={createLoading}
                                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {createLoading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Đang lưu...
                                    </>
                                ) : (
                                    <>
                                        <Save className="w-4 h-4" />
                                        Lưu hồ sơ
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateEmployee;
