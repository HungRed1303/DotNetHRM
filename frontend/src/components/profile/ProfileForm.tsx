import { DocumentTextIcon, CloudArrowUpIcon } from '@heroicons/react/24/outline';

import Modal from '../common/Modal';
import { useForm, Controller } from 'react-hook-form';
import { useState, useEffect } from 'react';
import { fileToBase64 } from '../../utils/imgconverter';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchEmployeeDetail, clearSelectedEmployee } from '../../store/employeeSlice';

interface DataEmployeeProps {
    employeeId: number,
    fullname: string;
    phone: string;
    email: string;
    address: string;
    bankAccount: string;
    status: string;
    birthday: string;
    gender: string;
    departmentId: number;
    //avatar: string;
}

interface UpdateEmployeeInformationModalProps {
    employeeId: number | null;
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: DataEmployeeProps) => Promise<void>;
    isSubmitting: boolean;
}

const UpdateEmployeeInformation = ({ employeeId, isOpen, onClose, onSubmit, isSubmitting }: UpdateEmployeeInformationModalProps) => {
    const dispatch = useAppDispatch();
    const { selectedEmployee: employeeData, detailLoading: loading, detailError: error } = useAppSelector(
        (state) => state.employee
    );

    // Sử dụng React Hook Form
    const { control, handleSubmit, reset, formState: { errors } } = useForm<DataEmployeeProps>({
        mode: "onChange"
    });

    // Fetch employee detail khi modal mở
    useEffect(() => {
        if (isOpen && employeeId) {
            dispatch(fetchEmployeeDetail(employeeId));
        }

        // Cleanup khi đóng modal
        return () => {
            if (!isOpen) {
                dispatch(clearSelectedEmployee());
            }
        };
    }, [isOpen, employeeId, dispatch]);

    // Reset form khi employeeData thay đổi
    useEffect(() => {
        if (employeeData && isOpen) {
            reset({
                employeeId: employeeData.id,
                fullname: employeeData.fullname,
                phone: employeeData.phone,
                email: employeeData.email,
                birthday: employeeData.birthday,
                address: employeeData.address,
                gender: employeeData.gender,
                bankAccount: employeeData.bankAccount,
                status: employeeData.status,
                departmentId: employeeData.departmentId,
            });
        }
    }, [employeeData, isOpen, reset]);

    // Early return sau khi tất cả hooks đã được gọi
    if (!employeeId) return null;
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        });
    };

    // Sử dụng React Hook Form
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    const getGenderText = (gender: string) => {
        switch (gender) {
            case 'male':
                return 'Nam';
            case 'female':
                return 'Nữ';
            case 'other':
                return 'Khác';
            default:
                return '';
        }
    };

    // useEffect(() => {
    //     if (employee) {
    //         // Khởi tạo avatar preview từ dữ liệu entity nếu có
    //         setAvatarPreview(employee.avatar || null);
    //     } else {
    //         // Đảm bảo form sạch nếu không có nhân viên
    //         reset();
    //         setAvatarPreview(null);
    //     }
    // }, [employee, reset]);

    // const handleAvatarChange = (files: FileList | null) => {
    //     if (files && files.length > 0) {
    //         const file = files[0];
    //         setSelectedFile(file); // <--- Cập nhật state file

    //         const reader = new FileReader();
    //         reader.onloadend = () => {
    //             setAvatarPreview(reader.result as string);
    //         };
    //         reader.readAsDataURL(file);
    //     } else {
    //         setSelectedFile(null); // <--- Đặt lại file
    //         setAvatarPreview(employee?.avatar || null);
    //     }
    // }

    const handleSubmitForm = async (data: Omit<DataEmployeeProps, 'employeeId'>) => {
        if (!employeeId) return;

        const payload: DataEmployeeProps = {
            ...data,
            employeeId: employeeId,
        };
        await onSubmit(payload);
        onClose();
    };

    const handleClose = () => {
        onClose();
        reset(); // Reset form khi đóng
        //setAvatarPreview(employee?.avatar || null);
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Chỉnh sửa thông tin nhân viên"
            titleIcon={<DocumentTextIcon className="w-7 h-7" />}
            size="xl"
        >
            {loading ? (
                <div className="flex justify-center items-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    <span className="ml-3 text-gray-600">Đang tải dữ liệu...</span>
                </div>
            ) : error ? (
                <div className="text-center py-12">
                    <p className="text-red-600">{error}</p>
                    <button
                        onClick={onClose}
                        className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                        Đóng
                    </button>
                </div>
            ) : employeeData ? (
                <form onSubmit={handleSubmit(handleSubmitForm)} className="space-y-6">

                    {/* Avatar( nếu có thì hiển thị) */}
                    {/* <div className="flex items-center gap-6 pb-4 border-b">
                        <div className="shrink-0">
                            <img
                                className="h-24 w-24 rounded-full object-cover border-2 border-gray-200"
                                src={avatarPreview || 'https://via.placeholder.com/96'}
                                alt="Avatar Preview"
                            />
                        </div>

                        {/* Input Upload Avatar 
                        <Controller
                            name="avatar"
                            control={control}
                            defaultValue={''} // Giữ lại avatar cũ
                            render={({ field: { onChange, ...field } }) => (
                                <label className="cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors">
                                    <CloudArrowUpIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                                    Tải ảnh mới
                                    <input
                                        type="file"
                                        accept="image/*"
                                        className="sr-only"
                                        {...field}
                                        value={undefined} // Để RHF không kiểm soát giá trị file, chỉ kiểm soát change
                                    // onChange={(e) => {
                                    //     handleAvatarChange(e.target.files);
                                    // }}
                                    />
                                </label>
                            )}
                        />
                    </div> */}

                    <p className="text-gray-500">Những thông tin không thể chỉnh sửa</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2 text-left">
                                Mã nhân viên
                            </label>
                            <input
                                type="text"
                                value={employeeData?.id}
                                readOnly
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-900 focus:outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2 text-left">
                                Ngày vào làm
                            </label>
                            <input
                                type="text"
                                value={formatDate(employeeData?.joinDate || '')}
                                readOnly
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-900 focus:outline-none"
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2 text-left">
                                Phòng ban
                            </label>
                            <input
                                type="text"
                                value={employeeData?.departmentName || ''}
                                readOnly
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-900 focus:outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2 text-left">
                                Vai trò
                            </label>
                            <input
                                type="text"
                                value={employeeData?.roleName || ''}
                                readOnly
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-900 focus:outline-none"
                            />
                        </div>

                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2 text-left">
                            Trạng thái
                        </label>
                        <input
                            type="text"
                            value={employeeData?.status || ''}
                            readOnly
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-900 focus:outline-none"
                        />
                    </div>
                    <p className="text-gray-500">Những thông tin có thể chỉnh sửa</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Họ tên */}
                        <Controller
                            name="fullname"
                            defaultValue={employeeData?.fullname || ''}
                            control={control}
                            rules={{ required: 'Họ tên là bắt buộc.' }}
                            render={({ field }) => (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2 text-left">Họ và Tên (*)</label>
                                    <input {...field} type="text" className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-900 focus:outline-none" />
                                    {errors.fullname && <p className="text-red-500 text-sm mt-1">{errors.fullname.message}</p>}
                                </div>
                            )}
                        />
                    </div>

                    {/* SĐT */}
                    <Controller
                        name="phone"
                        defaultValue={employeeData?.phone || ''}
                        control={control}
                        rules={{ required: 'SĐT là bắt buộc.', pattern: { value: /^\d{10,11}$/, message: 'SĐT không hợp lệ.' } }}
                        render={({ field }) => (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2 text-left">Số Điện Thoại (*)</label>
                                <input {...field} type="tel" className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-900 focus:outline-none" />
                                {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>}
                            </div>
                        )}
                    />

                    <Controller
                        name="birthday"
                        defaultValue={employeeData?.birthday || ''}
                        control={control}
                        rules={{ required: 'Ngày sinh là bắt buộc.', pattern: { value: /^\d{10,11}$/, message: 'Ngày sinh không hợp lệ.' } }}
                        render={({ field }) => (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2 text-left">Ngày Sinh (*)</label>
                                <input {...field} type="date" className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-900 focus:outline-none" />
                                {errors.birthday && <p className="text-red-500 text-sm mt-1">{errors.birthday.message}</p>}
                            </div>
                        )}
                    />

                    <Controller
                        name="email"
                        defaultValue={employeeData?.email || ''}
                        control={control}
                        rules={{ required: 'Email là bắt buộc.', pattern: { value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i, message: 'Email không hợp lệ.' } }}
                        render={({ field }) => (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2 text-left">Email (*)</label>
                                <input {...field} type="email" className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-900 focus:outline-none" />
                                {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
                            </div>
                        )}
                    />

                    <Controller
                        name="gender"
                        defaultValue={getGenderText(employeeData?.gender || '')}
                        control={control}
                        rules={{ required: 'Giới tính là bắt buộc.' }}
                        render={({ field }) => (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2 text-left">Giới tính (*)</label>
                                <input {...field} type="text" className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-900 focus:outline-none" />
                                {errors.gender && <p className="text-red-500 text-sm mt-1">{errors.gender.message}</p>}
                            </div>
                        )}
                    />

                    <Controller
                        name="address"
                        defaultValue={employeeData?.address || ''}
                        control={control}
                        rules={{ required: 'Địa chỉ là bắt buộc.' }}
                        render={({ field }) => (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2 text-left">Địa Chỉ (*)</label>
                                <input {...field} type="text" className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-900 focus:outline-none" />
                                {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address.message}</p>}
                            </div>
                        )}
                    />

                    <Controller
                        name="bankAccount"
                        defaultValue={employeeData?.bankAccount || ''}
                        control={control}
                        rules={{ required: 'Tên ngân hàng là bắt buộc.' }}
                        render={({ field }) => (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2 text-left">Tên Ngân Hàng (*)</label>
                                <input {...field} type="text" className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-900 focus:outline-none" />
                                {errors.bankAccount && <p className="text-red-500 text-sm mt-1">{errors.bankAccount.message}</p>}
                            </div>
                        )}
                    />

                    {/* -------------------- HÀNH ĐỘNG -------------------- */}
                    <div className="flex justify-end gap-3 pt-6 border-t">
                        <button
                            type="button"
                            onClick={handleClose}
                            className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-all"
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
                            disabled={isSubmitting}
                        >
                            Hủy
                        </button>
                        <button
                            type="submit"
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all"
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
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? 'Đang Lưu...' : 'Lưu Thay Đổi'}
                        </button>
                    </div>
                </form>
            ) : null}
        </Modal>
    );
};

export default UpdateEmployeeInformation;

