import React, { useState, useEffect } from 'react';

// --- Hàm tiện ích để lấy ngày hiện tại ở định dạng YYYY-MM-DD ---
const getTodayDateString = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

// --- 1. Định nghĩa Kiểu Dữ liệu (Types) ---

interface ConfirrmStatusEmployee {
    employeeName: string;
    isOpen: boolean;
    onClose: () => void;
    // Hàm onSubmit bây giờ nhận giá trị ngày (string)
    onSubmit: (terminationDate: string) => Promise<void>;
    isSubmitting: boolean;
}

// --- 2. Component Chính (Đã Đơn Giản Hóa) ---

const DeactivateEmployeeModal: React.FC<ConfirrmStatusEmployee> = ({
    employeeName,
    isOpen,
    onClose,
    onSubmit,
    isSubmitting,
}) => {
    // Chỉ cần 1 state để quản lý trường Ngày nghỉ việc
    const [terminationDate, setTerminationDate] = useState(getTodayDateString());
    const [error, setError] = useState('');

    // Đặt lại giá trị ngày về ngày hiện tại mỗi khi Modal mở
    useEffect(() => {
        if (isOpen) {
            setTerminationDate(getTodayDateString());
            setError(''); // Reset lỗi khi mở
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleConfirm = async () => {
        // Validation thủ công đơn giản
        if (!terminationDate || terminationDate.trim() === '') {
            setError('Ngày nghỉ việc là bắt buộc.');
            return;
        }

        // Gọi hàm submit từ component cha với giá trị ngày
        await onSubmit(terminationDate);
        // Component cha sẽ tự đóng Modal sau khi xử lý xong
    };

    return (
        // Modal Wrapper (Overlay)
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-600 bg-opacity-75">
            {/* Modal Content */}
            <div className="bg-white rounded-lg shadow-xl max-w-lg w-full mx-4 p-6 transform transition-all">

                <h2 className="text-gray-900 text-xl font-bold mb-4">Vô hiệu hóa tài khoản nhân viên</h2>

                <p className="text-left text-gray-700 mb-4">
                    Bạn có chắc chắn muốn vô hiệu hóa tài khoản của nhân viên <span className="font-semibold">{employeeName}</span>? Hành động này sẽ:
                </p>

                {/* Danh sách hành động */}
                <ul className="text-left list-disc ml-6 space-y-2 text-sm text-gray-600 mb-6">
                    <li>Ngừng quyền truy cập hệ thống của nhân viên</li>
                    <li>Cập nhật trạng thái hồ sơ sang "Đã nghỉ việc"</li>
                    <li>Lưu lại thông tin trong hệ thống để tra cứu</li>
                    <li>Ghi nhận lịch sử thay đổi</li>
                </ul>

                {/* Trường Ngày nghỉ việc */}
                <div className="mb-6">
                    <label htmlFor="terminationDate" className="block text-sm font-medium text-gray-700 mb-1">
                        Ngày nghỉ việc <span className="text-red-500">*</span>
                    </label>
                    <input
                        id="terminationDate"
                        type="date"
                        value={terminationDate}
                        onChange={(e) => {
                            setTerminationDate(e.target.value);
                            setError(''); // Xóa lỗi khi người dùng thay đổi
                        }}
                        className={`text-gray-900 input-field w-full p-2 border rounded-md shadow-sm ${error ? 'border-red-500' : 'border-gray-300'
                            }`}
                        disabled={isSubmitting}
                    />
                    {error && (
                        <p className="text-red-500 text-sm mt-1">{error}</p>
                    )}
                </div>

                {/* Thông báo chú ý */}
                <div className="flex items-center p-3 mb-6 bg-yellow-50 text-gray-800 rounded-md border border-yellow-200">
                    {/* ... (SVG icon) ... */}
                    <svg className="w-5 h-5 mr-2 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"></path>
                    </svg>
                    <p className="text-sm">Hồ sơ nhân viên sẽ được lưu trữ và có thể tra cứu sau này.</p>
                </div>

                {/* Footer - Nút hành động */}
                <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-100 disabled:opacity-50"
                        disabled={isSubmitting}
                    >
                        Hủy
                    </button>
                    <button
                        type="button" // Sử dụng type="button" và gọi hàm handleConfirm
                        onClick={handleConfirm}
                        className="px-4 py-2 text-white bg-red-600 rounded-md hover:bg-red-700 disabled:opacity-50"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? 'Đang Vô hiệu hóa...' : 'Vô hiệu hóa'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DeactivateEmployeeModal;