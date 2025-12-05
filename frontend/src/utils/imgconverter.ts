export const fileToBase64 = (file: File | null | undefined): Promise<string | null> => {
    // 1. Kiểm tra nếu không có file, trả về null ngay lập tức.
    if (!file) {
        return Promise.resolve(null);
    }

    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        // 2. Định nghĩa hàm xử lý khi đọc thành công
        reader.onload = () => {
            // reader.result là chuỗi Base64 (string | ArrayBuffer), 
            // ta ép kiểu thành string vì readAsDataURL luôn trả về string.
            resolve(reader.result as string);
        };

        // 3. Định nghĩa hàm xử lý khi có lỗi
        reader.onerror = (error) => {
            reject(error);
        };

        // 4. Bắt đầu đọc file dưới dạng chuỗi Base64 (Data URL)
        reader.readAsDataURL(file);
    });
};