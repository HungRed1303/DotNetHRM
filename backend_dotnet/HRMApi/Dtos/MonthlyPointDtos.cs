using System.ComponentModel.DataAnnotations;

namespace HRMApi.DTOs;

// DTO cho quy tắc cộng điểm hàng tháng
public class MonthlyPointRuleDto
{
    public int Id { get; set; }
    public int RoleId { get; set; }
    public string RoleName { get; set; } = null!;
    public int PointValue { get; set; }
    public bool IsActive { get; set; }
    public DateTime? CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}

// DTO cho tạo/cập nhật quy tắc
public class UpsertMonthlyPointRuleDto
{
    [Required(ErrorMessage = "RoleId là bắt buộc")]
    public int RoleId { get; set; }

    [Required(ErrorMessage = "Số điểm là bắt buộc")]
    [Range(0, 10000, ErrorMessage = "Số điểm phải từ 0 đến 10000")]
    public int PointValue { get; set; }

    public bool IsActive { get; set; } = true;
}

// DTO cho lịch sử cộng điểm
public class MonthlyPointAllocationHistoryDto
{
    public int Id { get; set; }
    public DateTime ExecutionDate { get; set; }
    public int Year { get; set; }
    public int Month { get; set; }
    public int TotalEmployeesProcessed { get; set; }
    public int TotalPointsAllocated { get; set; }
    public string Status { get; set; } = null!;
    public string StatusDisplay { get; set; } = null!;
    public string? ErrorMessage { get; set; }
    public DateTime? CreatedAt { get; set; }
}

// DTO cho kết quả chạy job
public class MonthlyPointAllocationResultDto
{
    public int EmployeesProcessed { get; set; }
    public int PointsAllocated { get; set; }
    public string Message { get; set; } = null!;
}