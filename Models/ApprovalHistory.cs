using System;
using System.Collections.Generic;

namespace HRMApi.Models;

public partial class ApprovalHistory
{
    public int Id { get; set; }

    public int RequestId { get; set; }

    public int ApproverId { get; set; }

    public string Status { get; set; } = null!;

    public string? Note { get; set; }

    public DateTime? CreatedAt { get; set; }

    public virtual Employee Approver { get; set; } = null!;

    public virtual Request Request { get; set; } = null!;
}
