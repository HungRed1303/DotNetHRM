import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserPlus, User, Phone, CreditCard, Hash, MapPin, Mail, Calendar, UserCircle, Building2, Wallet, RotateCcw, Save, Loader2, Briefcase, Upload, FileSpreadsheet, X, CheckCircle, AlertCircle } from 'lucide-react';
import Papa from 'papaparse';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { createEmployee, fetchDepartments } from '../../store/employeeSlice';
import { jwtDecode } from "jwt-decode";

const CreateEmployee = () => {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();

    // decode token 
    useEffect(() => {
        const token = localStorage.getItem("accessToken");
        if (token) {
        const decoded: any = jwtDecode(token);
        console.log('check jwt decode: ', decoded)
        const permissions = decoded.permissions || [];
        if (!permissions.includes("employee:create")) {
            navigate("/forbidden");
        }
        } else {
        navigate("/forbidden");
        }
    }, [navigate]);

    const { createLoading, departments, departmentsLoading } = useAppSelector((state) => state.employee);

    const [formData, setFormData] = useState({
        fullname: '',
        birthday: '',
        phone: '',
        cccd: '',
        taxCode: '',
        address: '',
        email: '',
        joinDate: '',
        gender: '',
        departmentId: '',
        roleId: '',
        bankAccount: '',
    });

    const [csvMode, setCsvMode] = useState(false);
    const [csvData, setCsvData] = useState<any[]>([]);
    const [csvErrors, setCsvErrors] = useState<string[]>([]);
    const [importLoading, setImportLoading] = useState(false);

    // Fetch danh sách phòng ban khi component mount
    useEffect(() => {
        dispatch(fetchDepartments());
    }, [dispatch]);

    // Function để bỏ dấu tiếng Việt
    const removeVietnameseTones = (str: string): string => {
        str = str.toLowerCase();
        str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, 'a');
        str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, 'e');
        str = str.replace(/ì|í|ị|ỉ|ĩ/g, 'i');
        str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, 'o');
        str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, 'u');
        str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, 'y');
        str = str.replace(/đ/g, 'd');
        str = str.replace(/\s+/g, '');
        str = str.replace(/[^a-z0-9]/g, '');
        return str;
    };

    // Tự động tạo email từ họ tên và CCCD
    useEffect(() => {
        if (formData.fullname && formData.cccd.length >= 3) {
            const nameWithoutTones = removeVietnameseTones(formData.fullname);
            const last3Digits = formData.cccd.slice(-3);
            const generatedEmail = `${nameWithoutTones}${last3Digits}@company.com`;
            setFormData(prev => ({
                ...prev,
                email: generatedEmail
            }));
        } else if (formData.fullname && formData.cccd.length === 0) {
            const nameWithoutTones = removeVietnameseTones(formData.fullname);
            const generatedEmail = `${nameWithoutTones}@company.com`;
            setFormData(prev => ({
                ...prev,
                email: generatedEmail
            }));
        }
    }, [formData.fullname, formData.cccd]);

    const [errors, setErrors] = useState({
        phone: '',
        cccd: '',
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
            case 'cccd':
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
                fullname: formData.fullname,
                birthday: formData.birthday,
                phone: formData.phone,
                cccd: formData.cccd,
                taxCode: formData.taxCode || null,
                address: formData.address,
                email: formData.email,
                joinDate: formData.joinDate,
                gender: formData.gender,
                departmentId: parseInt(formData.departmentId),
                roleId: parseInt(formData.roleId),
                bankAccount: formData.bankAccount,
            })).unwrap();

            if (!result || !result.employee) {
                alert('Có sự cố xảy ra khi tạo hồ sơ!');
                return;
            }
            // ...existing code xử lý thành công...
            alert('Tạo hồ sơ nhân viên thành công!');
            navigate('/employee/list');
        } catch (error: any) {
            const errorMessage = error.message ? error.message : 'Có lỗi xảy ra khi tạo hồ sơ nhân viên!';
            alert(errorMessage);
        }
    };

    const handleReset = () => {
        setFormData({
            fullname: '',
            birthday: '',
            phone: '',
            cccd: '',
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
            cccd: '',
            taxCode: '',
            email: '',
            bankAccount: '',
            birthday: '',
        });
        setCsvMode(false);
        setCsvData([]);
        setCsvErrors([]);
    };

    const validateCsvRow = (row: any, index: number): string[] => {
        const errors: string[] = [];
        const requiredFields = ['fullname', 'birthday', 'phone', 'cccd', 'address', 'joinDate', 'gender', 'departmentId', 'roleId', 'bankAccount'];
        
        requiredFields.forEach(field => {
            if (!row[field] || row[field].toString().trim() === '') {
                errors.push(`Dòng ${index + 2}: Thiếu trường "${field}"`);
            }
        });

        // Validate formats
        if (row.phone && !/^[0-9]{10}$/.test(row.phone)) {
            errors.push(`Dòng ${index + 2}: Số điện thoại không hợp lệ`);
        }
        if (row.cccd && !/^[0-9]{12}$/.test(row.cccd)) {
            errors.push(`Dòng ${index + 2}: Số CCCD không hợp lệ (phải 12 số)`);
        }
        if (row.taxCode && row.taxCode.trim() !== '' && !/^[0-9]{10}$/.test(row.taxCode)) {
            errors.push(`Dòng ${index + 2}: Mã số thuế không hợp lệ`);
        }
        if (row.bankAccount && !/^[0-9]{8,15}$/.test(row.bankAccount)) {
            errors.push(`Dòng ${index + 2}: Số tài khoản không hợp lệ`);
        }
        if (row.email && !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[cC][oO][mM]$/.test(row.email)) {
            errors.push(`Dòng ${index + 2}: Email không hợp lệ`);
        }

        return errors;
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
                const allErrors: string[] = [];
                
                results.data.forEach((row: any, index) => {
                    const rowErrors = validateCsvRow(row, index);
                    allErrors.push(...rowErrors);
                });

                if (allErrors.length > 0) {
                    setCsvErrors(allErrors);
                    setCsvData([]);
                } else {
                    setCsvData(results.data);
                    setCsvErrors([]);
                    setCsvMode(true);
                }
            },
            error: (error) => {
                alert('Lỗi khi đọc file CSV: ' + error.message);
            }
        });
    };

    const handleImportCsv = async () => {
        if (csvData.length === 0) return;

        setImportLoading(true);
        try {
            let successCount = 0;
            let failCount = 0;
            const errors: string[] = [];

            for (let i = 0; i < csvData.length; i++) {
                const row = csvData[i];
                try {
                    await dispatch(createEmployee({
                        fullname: row.fullname,
                        birthday: row.birthday,
                        phone: row.phone,
                        cccd: row.cccd,
                        taxCode: row.taxCode || null,
                        address: row.address,
                        email: row.email,
                        joinDate: row.joinDate,
                        gender: row.gender,
                        departmentId: parseInt(row.departmentId),
                        roleId: parseInt(row.roleId),
                        bankAccount: row.bankAccount,
                    })).unwrap();
                    successCount++;
                } catch (error: any) {
                    failCount++;
                    errors.push(`Dòng ${i + 2} (${row.fullname}): ${error.message || 'Lỗi không xác định'}`);
                }
            }

            if (failCount === 0) {
                alert(`Tạo thành công ${successCount} nhân viên!`);
                navigate('/employee/list');
            } else {
                const message = `Tạo thành công ${successCount}/${csvData.length} nhân viên.\n\nLỗi (${failCount}):\n${errors.join('\n')}`;
                alert(message);
                if (successCount > 0) {
                    navigate('/employee/list');
                }
            }
        } catch (error) {
            alert('Có lỗi xảy ra khi import dữ liệu!');
        } finally {
            setImportLoading(false);
        }
    };

    return (
        <div className="h-full p-6">
            <div className="max-w-4xl mx-auto space-y-4">
                {/* Import CSV Button - Outside Form */}
                <div className="flex justify-start">
                    <label 
                        className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all flex items-center gap-2 cursor-pointer shadow-lg"
                        style={{ transition: 'all 0.3s ease' }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-2px)';
                            e.currentTarget.style.boxShadow = '0 5px 20px rgba(37, 99, 235, 0.4)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = 'none';
                        }}
                    >
                        <Upload className="w-5 h-5" />
                        <span className="font-medium">Import từ file CSV</span>
                        <input
                            type="file"
                            accept=".csv"
                            onChange={handleFileUpload}
                            className="hidden"
                        />
                    </label>
                </div>

                <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl overflow-hidden">
                    {/* Header */}
                    <div className="p-6 bg-linear-to-r from-blue-600 to-blue-700">
                        <div className="flex items-center space-x-3">
                            <UserPlus className="w-8 h-8 text-white" />
                            <div className="text-2xl font-bold text-white">Thêm Hồ sơ Nhân viên Mới</div>
                        </div>
                    </div>

                    <div className="p-6 space-y-6">
                        {/* CSV Errors Display */}
                        {csvErrors.length > 0 && (
                            <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4">
                                <div className="flex items-start gap-3">
                                    <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                                    <div className="flex-1">
                                        <h3 className="font-semibold text-red-800 mb-2">Lỗi trong file CSV</h3>
                                        <div className="max-h-60 overflow-y-auto space-y-1">
                                            {csvErrors.map((error, idx) => (
                                                <p key={idx} className="text-sm text-red-700">• {error}</p>
                                            ))}
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setCsvErrors([])}
                                        className="text-red-600 hover:text-red-800 transition-all"
                                        style={{ transition: 'all 0.3s ease' }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.transform = 'translateY(-2px)';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.transform = 'translateY(0)';
                                        }}
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* CSV Preview Mode */}
                        {csvMode && csvData.length > 0 && (
                            <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4">
                                <div className="flex items-start gap-3 mb-4">
                                    <CheckCircle className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                                    <div className="flex-1">
                                        <h3 className="font-semibold text-green-800 mb-1">File CSV hợp lệ</h3>
                                        <p className="text-sm text-green-700">Tìm thấy {csvData.length} nhân viên. Xem trước dữ liệu bên dưới:</p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => { setCsvMode(false); setCsvData([]); }}
                                        className="text-green-600 hover:text-green-800 transition-all"
                                        style={{ transition: 'all 0.3s ease' }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.transform = 'translateY(-2px)';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.transform = 'translateY(0)';
                                        }}
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>
                                
                                <div className="overflow-x-auto max-h-96 overflow-y-auto border border-green-200 rounded-lg">
                                    <table className="min-w-full divide-y divide-green-200 text-sm">
                                        <thead className="bg-green-100 sticky top-0">
                                            <tr>
                                                <th className="px-3 py-2 text-left font-medium text-green-800">STT</th>
                                                <th className="px-3 py-2 text-left font-medium text-green-800">Họ tên</th>
                                                <th className="px-3 py-2 text-left font-medium text-green-800">Ngày sinh</th>
                                                <th className="px-3 py-2 text-left font-medium text-green-800">SĐT</th>
                                                <th className="px-3 py-2 text-left font-medium text-green-800">CCCD</th>
                                                <th className="px-3 py-2 text-left font-medium text-green-800">Email</th>
                                                <th className="px-3 py-2 text-left font-medium text-green-800">Phòng ban</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-green-100">
                                            {csvData.map((row: any, idx: number) => (
                                                <tr key={idx} className="hover:bg-green-50">
                                                    <td className="px-3 py-2">{idx + 1}</td>
                                                    <td className="px-3 py-2">{row.fullname}</td>
                                                    <td className="px-3 py-2">{row.birthday}</td>
                                                    <td className="px-3 py-2">{row.phone}</td>
                                                    <td className="px-3 py-2">{row.cccd}</td>
                                                    <td className="px-3 py-2">{row.email}</td>
                                                    <td className="px-3 py-2">{row.departmentId}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                <div className="flex justify-end gap-4 mt-4">
                                    <button
                                        type="button"
                                        onClick={() => { setCsvMode(false); setCsvData([]); }}
                                        className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-all flex items-center gap-2"
                                        style={{ transition: 'all 0.3s ease' }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.transform = 'translateY(-2px)';
                                            e.currentTarget.style.boxShadow = '0 5px 20px rgba(107, 114, 128, 0.4)';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.transform = 'translateY(0)';
                                            e.currentTarget.style.boxShadow = 'none';
                                        }}
                                    >
                                        <X className="w-4 h-4" />
                                        Hủy
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleImportCsv}
                                        disabled={importLoading}
                                        className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                        style={{ transition: 'all 0.3s ease' }}
                                        onMouseEnter={(e) => {
                                            if (!importLoading) {
                                                e.currentTarget.style.transform = 'translateY(-2px)';
                                                e.currentTarget.style.boxShadow = '0 5px 20px rgba(22, 163, 74, 0.4)';
                                            }
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.transform = 'translateY(0)';
                                            e.currentTarget.style.boxShadow = 'none';
                                        }}
                                    >
                                        {importLoading ? (
                                            <>
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                Đang import...
                                            </>
                                        ) : (
                                            <>
                                                <Upload className="w-4 h-4" />
                                                Import {csvData.length} nhân viên
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Thông tin cá nhân */}
                        {!csvMode && <div>
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
                                        name="fullname"
                                        value={formData.fullname}
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
                                        name="cccd"
                                        value={formData.cccd}
                                        onChange={handleChange}
                                        placeholder="Nhập số căn cước công dân"
                                        required
                                        maxLength={12}
                                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:border-transparent focus:outline-none ${
                                            errors.cccd ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                                        }`}
                                    />
                                    {errors.cccd && <p className="text-red-500 text-xs mt-1 text-left">{errors.cccd}</p>}
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
                        </div>}

                        {/* Thông tin công việc */}
                        {!csvMode && <div>
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
                                        readOnly
                                        placeholder="Tự động tạo từ họ tên và CCCD"
                                        required
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed focus:outline-none"
                                    />
                                    <p className="text-gray-500 text-xs mt-1 text-left">Email được tạo tự động từ họ tên (không dấu) + 3 số cuối CCCD</p>
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
                                        disabled={departmentsLoading}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:outline-none appearance-none bg-white cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                                        style={{
                                            backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                                            backgroundPosition: 'right 0.5rem center',
                                            backgroundRepeat: 'no-repeat',
                                            backgroundSize: '1.5em 1.5em',
                                            paddingRight: '2.5rem'
                                        }}
                                    >
                                        <option value="">{departmentsLoading ? 'Đang tải...' : 'Chọn phòng ban'}</option>
                                        {departments.map((dept) => (
                                            <option key={dept.id} value={dept.id}>
                                                {dept.name}
                                            </option>
                                        ))}
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
                        </div>}

                        {/* Thông tin ngân hàng */}
                        {!csvMode && <div>
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
                        </div>}

                        {/* Buttons */}
                        {!csvMode && (
                            <div className="flex justify-end gap-4 pt-6 border-t">
                                <button
                                    type="button"
                                    onClick={handleReset}
                                    disabled={createLoading}
                                    className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                    style={{ transition: 'all 0.3s ease' }}
                                    onMouseEnter={(e) => {
                                        if (!createLoading) {
                                            e.currentTarget.style.transform = 'translateY(-2px)';
                                            e.currentTarget.style.boxShadow = '0 5px 20px rgba(107, 114, 128, 0.4)';
                                        }
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.transform = 'translateY(0)';
                                        e.currentTarget.style.boxShadow = 'none';
                                    }}
                                >
                                    <RotateCcw className="w-4 h-4" />
                                    Đặt lại
                                </button>
                                <button
                                    type="submit"
                                    disabled={createLoading}
                                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                    style={{ transition: 'all 0.3s ease' }}
                                    onMouseEnter={(e) => {
                                        if (!createLoading) {
                                            e.currentTarget.style.transform = 'translateY(-2px)';
                                            e.currentTarget.style.boxShadow = '0 5px 20px rgba(37, 99, 235, 0.4)';
                                        }
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.transform = 'translateY(0)';
                                        e.currentTarget.style.boxShadow = 'none';
                                    }}
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
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateEmployee;
