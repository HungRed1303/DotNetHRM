using System;
using System.Collections.Generic;

namespace HRMApi.Models;

public partial class PointTransactionHistory
{
    public int Id { get; set; }

    public int EmployeeId { get; set; }

    public int Value { get; set; }

    public string Type { get; set; } = null!;

    public int? ActorId { get; set; }

    public string? Description { get; set; }

    public DateTime? CreatedAt { get; set; }

    public virtual Employee? Actor { get; set; }

    public virtual Employee Employee { get; set; } = null!;
}
