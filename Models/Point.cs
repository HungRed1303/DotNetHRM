using System;
using System.Collections.Generic;

namespace HRMApi.Models;

public partial class Point
{
    public int Id { get; set; }

    public int EmployeeId { get; set; }

    public int? PointTotal { get; set; }

    public DateTime? LastUpdate { get; set; }

    public virtual Employee Employee { get; set; } = null!;
}
