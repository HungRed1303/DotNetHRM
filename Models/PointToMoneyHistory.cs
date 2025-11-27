using System;
using System.Collections.Generic;

namespace HRMApi.Models;

public partial class PointToMoneyHistory
{
    public int Id { get; set; }

    public int EmployeeId { get; set; }

    public int PointRequested { get; set; }

    public decimal MoneyReceived { get; set; }

    public string? Status { get; set; }

    public DateTime? CreatedAt { get; set; }

    public DateTime? ProcessedAt { get; set; }

    public virtual Employee Employee { get; set; } = null!;
}
