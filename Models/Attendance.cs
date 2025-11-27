using System;
using System.Collections.Generic;

namespace HRMApi.Models;

public partial class Attendance
{
    public int Id { get; set; }

    public int EmployeeId { get; set; }

    public DateOnly Date { get; set; }

    public DateTime? CheckinTime { get; set; }

    public DateTime? CheckoutTime { get; set; }

    public string? Status { get; set; }

    public string? Attachment { get; set; }

    public decimal? WorkHours { get; set; }

    public decimal? OvertimeHours { get; set; }

    public string? Note { get; set; }

    public DateTime? CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }

    public virtual Employee Employee { get; set; } = null!;
}
