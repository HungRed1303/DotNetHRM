using System.ComponentModel.DataAnnotations;

namespace HRMApi.DTOs;

// DTO cho xem điểm thưởng của nhân viên
public class EmployeePointDto
{
    public int Id { get; set; }
    public int EmployeeId { get; set; }
    public string EmployeeName { get; set; } = null!;
    public string Email { get; set; } = null!;
    public int PointTotal { get; set; }
    public DateTime? LastUpdate { get; set; }
}

// DTO cho cập nhật điểm thưởng
public class UpdatePointDto
{
    [Required(ErrorMessage = "Giá trị điểm là bắt buộc")]
    [Range(-10000, 10000, ErrorMessage = "Giá trị điểm phải từ -10000 đến 10000")]
    public int Value { get; set; }

    [Required(ErrorMessage = "Loại giao dịch là bắt buộc")]
    [RegularExpression(@"^(earn|redeem|adjustment)$", 
        ErrorMessage = "Loại giao dịch phải là: earn (thêm điểm), redeem (dùng điểm), hoặc adjustment (điều chỉnh)")]
    public string Type { get; set; } = null!;

    [StringLength(500, ErrorMessage = "Mô tả không được vượt quá 500 ký tự")]
    public string? Description { get; set; }

    // ActorId: ID của người thực hiện cập nhật (sẽ được gửi từ client sau khi authenticate qua Java service)
    public int? ActorId { get; set; }
}

// DTO cho lịch sử giao dịch điểm
public class PointTransactionDto
{
    public int Id { get; set; }
    public int EmployeeId { get; set; }
    public string EmployeeName { get; set; } = null!;
    public int Value { get; set; }
    public string Type { get; set; } = null!;
    public string TypeDisplay { get; set; } = null!;
    public int? ActorId { get; set; }
    public string? ActorName { get; set; }
    public string? Description { get; set; }
    public DateTime? CreatedAt { get; set; }
}

// DTO cho quy tắc quy đổi điểm
public class PointConversionRuleDto
{
    public int Id { get; set; }
    public int PointValue { get; set; }
    public decimal MoneyValue { get; set; }
    public int? UpdatedBy { get; set; }
    public string? UpdatedByName { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public bool IsActive { get; set; }
}

// DTO cho tạo/cập nhật quy tắc quy đổi
public class UpsertPointConversionRuleDto
{
    [Required(ErrorMessage = "Giá trị điểm là bắt buộc")]
    [Range(1, 1000000, ErrorMessage = "Giá trị điểm phải từ 1 đến 1,000,000")]
    public int PointValue { get; set; }

    [Required(ErrorMessage = "Giá trị tiền là bắt buộc")]
    [Range(0.01, 1000000000, ErrorMessage = "Giá trị tiền phải lớn hơn 0")]
    public decimal MoneyValue { get; set; }

    // UpdatedBy sẽ được lấy từ token của user đang đăng nhập
    public int? UpdatedBy { get; set; }
}

// DTO cho lịch sử quy đổi điểm sang tiền
public class PointToMoneyHistoryDto
{
    public int Id { get; set; }
    public int EmployeeId { get; set; }
    public string EmployeeName { get; set; } = null!;
    public string Email { get; set; } = null!;
    public int PointRequested { get; set; }
    public decimal MoneyReceived { get; set; }
    public string Status { get; set; } = null!;
    public string StatusDisplay { get; set; } = null!;
    public DateTime? CreatedAt { get; set; }
    public DateTime? ProcessedAt { get; set; }
}

// DTO cho yêu cầu quy đổi điểm sang tiền
public class RequestPointToMoneyDto
{
    [Required(ErrorMessage = "Số điểm muốn quy đổi là bắt buộc")]
    [Range(1, 1000000, ErrorMessage = "Số điểm phải từ 1 đến 1,000,000")]
    public int PointRequested { get; set; }
}

// DTO cho xử lý yêu cầu quy đổi điểm
public class ProcessPointToMoneyDto
{
    [Required(ErrorMessage = "Trạng thái xử lý là bắt buộc")]
    [RegularExpression(@"^(approved|rejected)$", 
        ErrorMessage = "Trạng thái phải là: approved (chấp nhận) hoặc rejected (từ chối)")]
    public string Status { get; set; } = null!;
}

// DTO cho thống kê điểm
public class PointStatisticsDto
{
    public int TotalEmployeesWithPoints { get; set; }
    public long TotalPointsInSystem { get; set; }
    public double AveragePointsPerEmployee { get; set; }
    public EmployeePointDto? TopEmployee { get; set; }
    public int PendingConversionRequests { get; set; }
    public Dictionary<string, int> TransactionsByType { get; set; } = new();
}