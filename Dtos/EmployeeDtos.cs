using System.ComponentModel.DataAnnotations;

namespace HRMApi.DTOs;

// DTO cho danh sách nhân viên
public class EmployeeListDto
{
    public int Id { get; set; }
    public string Fullname { get; set; } = null!;
    public string Email { get; set; } = null!;
    public string? Phone { get; set; }
    public string? Status { get; set; }
    public DateOnly JoinDate { get; set; }
    public string RoleName { get; set; } = null!;
    public string? DepartmentName { get; set; }
}

// DTO cho chi tiết nhân viên
public class EmployeeDetailDto
{
    public int Id { get; set; }
    public string Fullname { get; set; } = null!;
    public string Cccd { get; set; } = null!;
    public string? TaxCode { get; set; }
    public string? Phone { get; set; }
    public string? Address { get; set; }
    public string? BankAccount { get; set; }
    public DateOnly JoinDate { get; set; }
    public string? Status { get; set; }
    public DateOnly? Birthday { get; set; }
    public string? Gender { get; set; }
    public string Email { get; set; } = null!;
    public int RoleId { get; set; }
    public string RoleName { get; set; } = null!;
    public int? DepartmentId { get; set; }
    public string? DepartmentName { get; set; }
    public DateTime? CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}

// DTO cho tạo nhân viên
public class CreateEmployeeDto
{
    [Required(ErrorMessage = "Họ tên là bắt buộc")]
    [StringLength(100, ErrorMessage = "Họ tên không được vượt quá 100 ký tự")]
    public string Fullname { get; set; } = null!;

    [Required(ErrorMessage = "CCCD là bắt buộc")]
    [StringLength(12, MinimumLength = 12, ErrorMessage = "CCCD phải có 12 số")]
    [RegularExpression(@"^\d{12}$", ErrorMessage = "CCCD phải là 12 chữ số")]
    public string Cccd { get; set; } = null!;

    [StringLength(13, ErrorMessage = "Mã số thuế không được vượt quá 13 ký tự")]
    public string? TaxCode { get; set; }

    [Phone(ErrorMessage = "Số điện thoại không hợp lệ")]
    [StringLength(15, ErrorMessage = "Số điện thoại không được vượt quá 15 ký tự")]
    public string? Phone { get; set; }

    public string? Address { get; set; }

    [StringLength(50, ErrorMessage = "Số tài khoản không được vượt quá 50 ký tự")]
    public string? BankAccount { get; set; }

    [Required(ErrorMessage = "Ngày vào làm là bắt buộc")]
    public DateOnly JoinDate { get; set; }

    public DateOnly? Birthday { get; set; }

    [RegularExpression(@"^(male|female|other)$", ErrorMessage = "Giới tính phải là: male, female, hoặc other")]
    public string? Gender { get; set; }

    [Required(ErrorMessage = "Email là bắt buộc")]
    [EmailAddress(ErrorMessage = "Email không hợp lệ")]
    [StringLength(100, ErrorMessage = "Email không được vượt quá 100 ký tự")]
    public string Email { get; set; } = null!;

    // RoleId mặc định là 4 (employee role)
    public int RoleId { get; set; } = 4;

    public int? DepartmentId { get; set; }
}

// DTO cho cập nhật nhân viên
public class UpdateEmployeeDto
{
    [Required(ErrorMessage = "Họ tên là bắt buộc")]
    [StringLength(100, ErrorMessage = "Họ tên không được vượt quá 100 ký tự")]
    public string Fullname { get; set; } = null!;

    [Phone(ErrorMessage = "Số điện thoại không hợp lệ")]
    [StringLength(15, ErrorMessage = "Số điện thoại không được vượt quá 15 ký tự")]
    public string? Phone { get; set; }

    public string? Address { get; set; }

    [StringLength(50, ErrorMessage = "Số tài khoản không được vượt quá 50 ký tự")]
    public string? BankAccount { get; set; }

    [RegularExpression(@"^(active|inactive|suspended)$", ErrorMessage = "Trạng thái phải là: active, inactive, hoặc suspended")]
    public string? Status { get; set; }

    public DateOnly? Birthday { get; set; }

    [RegularExpression(@"^(male|female|other)$", ErrorMessage = "Giới tính phải là: male, female, hoặc other")]
    public string? Gender { get; set; }

    public int? DepartmentId { get; set; }
}

// DTO cho response API
public class ApiResponse<T>
{
    public bool Success { get; set; }
    public string Message { get; set; } = string.Empty;
    public T? Data { get; set; }
    public List<string>? Errors { get; set; }

    public static ApiResponse<T> SuccessResponse(T data, string message = "Thành công")
    {
        return new ApiResponse<T>
        {
            Success = true,
            Message = message,
            Data = data
        };
    }

    public static ApiResponse<T> ErrorResponse(string message, List<string>? errors = null)
    {
        return new ApiResponse<T>
        {
            Success = false,
            Message = message,
            Errors = errors ?? new List<string>()
        };
    }
}

// DTO cho phân trang
public class PagedResult<T>
{
    public List<T> Items { get; set; } = new();
    public int TotalCount { get; set; }
    public int PageNumber { get; set; }
    public int PageSize { get; set; }
    public int TotalPages => (int)Math.Ceiling(TotalCount / (double)PageSize);
    public bool HasPreviousPage => PageNumber > 1;
    public bool HasNextPage => PageNumber < TotalPages;
}