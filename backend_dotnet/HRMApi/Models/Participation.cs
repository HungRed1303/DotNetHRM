using System;
using System.Collections.Generic;
using System.Text.Json;

namespace HRMApi.Models;

public partial class Participation
{
    public int Id { get; set; }

    public int EmployeeId { get; set; }

    public int ActivityId { get; set; }

    public DateTime? RegisterDate { get; set; }

    public DateTime? CancelDate { get; set; }

    public string? Status { get; set; }

    public JsonDocument? Result { get; set; }

    public DateTime? CreatedAt { get; set; }

    public virtual Activity Activity { get; set; } = null!;

    public virtual Employee Employee { get; set; } = null!;
}
