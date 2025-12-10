using System;

namespace HRMApi.Models;

// Lịch sử chạy job cộng điểm tự động
public partial class MonthlyPointAllocationHistory
{
    public int Id { get; set; }
    public DateTime ExecutionDate { get; set; }
    public int Year { get; set; }
    public int Month { get; set; }
    public int? TotalEmployeesProcessed { get; set; }
    public int? TotalPointsAllocated { get; set; }
    public string? Status { get; set; }
    public string? ErrorMessage { get; set; }
    public DateTime? CreatedAt { get; set; }
}