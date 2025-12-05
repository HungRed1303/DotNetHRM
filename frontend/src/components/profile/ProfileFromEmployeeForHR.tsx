import { DocumentTextIcon } from '@heroicons/react/24/outline';
import Modal from '../common/Modal';
import { useForm, Controller } from 'react-hook-form';
import { useState, useEffect } from 'react';
import ConfirmStatusEmployee from './ConfirmStatusEmployee';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchEmployeeDetail, clearSelectedEmployee } from '../../store/employeeSlice';

interface WorkingInformationProps {
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
}

interface UpdateEmployeeWorkingInformationModalProps {
    employeeId: number | null;
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: WorkingInformationProps) => Promise<void>;
    isSubmitting: boolean;
}

const UpdateEmployeeWorkingInformation = ({ employeeId, isOpen, onClose, onSubmit, isSubmitting }: UpdateEmployeeWorkingInformationModalProps) => {
    const dispatch = useAppDispatch();
    const { selectedEmployee: employeeData, detailLoading: loading, detailError: error } = useAppSelector(
        (state) => state.employee
    );

    const [isDeactivationConfirmOpen, setIsDeactivationConfirmOpen] = useState(false);
    const [formDataToSubmit, setFormDataToSubmit] = useState<WorkingInformationProps | null>(null);

    // Sử dụng React Hook Form
    const { control, handleSubmit, reset, setValue, formState: { errors } } = useForm<WorkingInformationProps>({
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
                phone: employeeData.phone || '',
                email: employeeData.email || '',
                address: employeeData.address || '',
                bankAccount: employeeData.bankAccount || '',
                birthday: employeeData.birthday || '',
                gender: employeeData.gender || '',
                departmentId: employeeData.departmentId || 0,
                status: employeeData.status || 'active',
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

    const handleSubmitForm = async (data: Omit<WorkingInformationProps, 'employeeId'>) => {
        if (!employeeId) return;

        const payload: WorkingInformationProps = {
            ...data,
            employeeId: employeeId,
        };

        if (data.status === 'terminated' && employeeData?.status !== 'terminated') {
            setFormDataToSubmit(payload);
            setIsDeactivationConfirmOpen(true);
        } else {
            await onSubmit(payload);
            onClose();
        }
    };

    const handleConfirmDeactivation = async () => {
        if (!formDataToSubmit || !employeeId) return;

        const finalPayload: WorkingInformationProps = {
            ...formDataToSubmit,
            employeeId: employeeId,
        };

        // Gọi hàm submit API
        await onSubmit(finalPayload);

        // Đóng cả hai modal và reset state
        setIsDeactivationConfirmOpen(false);
        setFormDataToSubmit(null);
        onClose();
    };

    const handleClose = () => {
        onClose();
        reset(); // Reset form khi đóng
    };

    const handleCancelDeactivation = () => {
        setIsDeactivationConfirmOpen(false);
        setFormDataToSubmit(null);
        // Quan trọng: Set lại trường status về giá trị cũ (hoặc giá trị hợp lệ khác)
        setValue('status', employeeData?.status || 'terminated');
        setValue('departmentId', employeeData?.departmentId || 0);
    };

    return (
        <>
            <Modal
                isOpen={isOpen}
                onClose={onClose}
                title="Chỉnh sửa thông tin làm việc của nhân viên"
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

                        <p className="text-gray-500">Thông tin cá nhân( chỉ đọc)</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-light text-gray-700 mb-2 text-left">
                                    Họ và tên
                                </label>
                                <input
                                    type="text"
                                    value={employeeData?.fullname}
                                    readOnly
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-900 focus:outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-light text-gray-700 mb-2 text-left">
                                    Mã nhân viên
                                </label>
                                <input
                                    type="text"
                                    value={employeeData?.id}
                                    readOnly
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-900 focus:outline-none"
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-light text-gray-700 mb-2 text-left">
                                    Email
                                </label>
                                <input
                                    type="text"
                                    value={employeeData?.email}
                                    readOnly
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-900 focus:outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-light text-gray-700 mb-2 text-left">
                                    Số điện thoại
                                </label>
                                <input
                                    type="text"
                                    value={employeeData?.phone}
                                    readOnly
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-900 focus:outline-none"
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-light text-gray-700 mb-2 text-left">
                                    Địa chỉ
                                </label>
                                <input
                                    type="text"
                                    value={employeeData?.address}
                                    readOnly
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-900 focus:outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-light text-gray-700 mb-2 text-left">
                                    Tài khoản ngân hàng
                                </label>
                                <input
                                    type="text"
                                    value={employeeData?.bankAccount}
                                    readOnly
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-900 focus:outline-none"
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-light text-gray-700 mb-2 text-left">
                                    Ngày sinh
                                </label>
                                <input
                                    type="text"
                                    value={employeeData?.birthday ? formatDate(employeeData.birthday) : 'Chưa cập nhật'}
                                    readOnly
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-900 focus:outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-light text-gray-700 mb-2 text-left">
                                    Giới tính
                                </label>
                                <input
                                    type="text"
                                    value={employeeData?.gender}
                                    readOnly
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-900 focus:outline-none"
                                />
                            </div>
                        </div>

                        <p className="text-gray-500">Thông tin làm việc</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Phòng ban */}
                            <Controller
                                name="departmentId"
                                defaultValue={employeeData?.departmentId || 0}
                                control={control}
                                rules={{
                                    required: 'Nhân viên phải có bộ phận',
                                    validate: (value) => value > 0 || 'Vui lòng nhập ID bộ phận hợp lệ'
                                }}
                                render={({ field }) => (
                                    <div>
                                        <label className="block text-sm font-light text-gray-700 mb-2 text-left">
                                            Bộ phận (*)
                                            {employeeData?.departmentName && (
                                                <span className="text-gray-500 text-xs ml-2">(Hiện tại: {employeeData.departmentName})</span>
                                            )}
                                        </label>
                                        <input
                                            {...field}
                                            type="number"
                                            min="1"
                                            value={field.value || ''}
                                            onChange={(e) => field.onChange(Number(e.target.value) || 0)}
                                            placeholder="Nhập ID bộ phận"
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                        {errors.departmentId && <p className="text-red-500 text-sm mt-1">{errors.departmentId.message}</p>}
                                    </div>
                                )}
                            />
                            {/* Trạng thái */}
                            <Controller
                                name="status"
                                defaultValue={employeeData?.status}
                                control={control}
                                rules={{ required: 'Nhân viên phải có trạng hái làm việc', pattern: { value: /^(active|inactive|terminated)$/, message: 'Trạng thái không hợp lệ' } }}
                                render={({ field }) => (
                                    <div>
                                        <label className="block text-sm font-light text-gray-700 mb-2 text-left">Trạng thái (*)</label>
                                        <select {...field} className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-900 focus:outline-none">
                                            <option value="active">Đang làm việc</option>
                                            <option value="inactive">Tạm nghỉ</option>
                                            <option value="terminated">Đã thôi việc (Vô hiệu hóa)</option>
                                        </select>
                                        {errors.status && <p className="text-red-500 text-sm mt-1">{errors.status.message}</p>}
                                    </div>
                                )}
                            />
                        </div>
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
            {/* Modal Xác nhận Vô hiệu hóa (Deactivation Confirmation Modal) */}
            {employeeId && (
                <ConfirmStatusEmployee
                    employeeName={employeeData?.fullname!}
                    isOpen={isDeactivationConfirmOpen}
                    onClose={handleCancelDeactivation} // Nếu hủy, quay lại form chính
                    onSubmit={handleConfirmDeactivation}
                    isSubmitting={isSubmitting}
                />
            )}
        </>
    );
};

export default UpdateEmployeeWorkingInformation;

