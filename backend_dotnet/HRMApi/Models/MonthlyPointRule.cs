using System;

namespace HRMApi.Models;

// Quy tắc cộng điểm hàng tháng theo role
public partial class MonthlyPointRule
{
    public int Id { get; set; }
    public int RoleId { get; set; }
    public int PointValue { get; set; }
    public bool? IsActive { get; set; }
    public DateTime? CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }

    public virtual Role Role { get; set; } = null!;
}