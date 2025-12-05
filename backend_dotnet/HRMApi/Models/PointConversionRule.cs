using System;
using System.Collections.Generic;

namespace HRMApi.Models;

public partial class PointConversionRule
{
    public int Id { get; set; }

    public int PointValue { get; set; }

    public decimal MoneyValue { get; set; }

    public int? UpdatedBy { get; set; }

    public DateTime? UpdatedAt { get; set; }

    public bool? IsActive { get; set; }

    public virtual Employee? UpdatedByNavigation { get; set; }
}
