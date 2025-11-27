using System;
using System.Collections.Generic;

namespace HRMApi.Models;

public partial class Activity
{
    public int Id { get; set; }

    public string Name { get; set; } = null!;

    public string? Description { get; set; }

    public DateTime StartDate { get; set; }

    public DateTime EndDate { get; set; }

    public DateTime RegisterDeadline { get; set; }

    public int? MaxParticipants { get; set; }

    public string? Status { get; set; }

    public int? CreatedBy { get; set; }

    public DateTime? CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }

    public virtual Employee? CreatedByNavigation { get; set; }

    public virtual ICollection<Participation> Participations { get; set; } = new List<Participation>();
}
