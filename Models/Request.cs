using System;
using System.Collections.Generic;

namespace HRMApi.Models;

public partial class Request
{
    public int Id { get; set; }

    public int EmployeeId { get; set; }

    public string Description { get; set; } = null!;

    public DateTime? StartTime { get; set; }

    public DateTime? EndTime { get; set; }

    public string Type { get; set; } = null!;

    public string? Attachment { get; set; }

    public string? Status { get; set; }

    public DateTime? CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }

    public virtual ICollection<ApprovalHistory> ApprovalHistories { get; set; } = new List<ApprovalHistory>();

    public virtual Employee Employee { get; set; } = null!;
}
