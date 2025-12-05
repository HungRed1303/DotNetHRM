using System;
using System.Collections.Generic;

namespace HRMApi.Models;

public partial class Employee
{
    public int Id { get; set; }

    public string Fullname { get; set; } = null!;

    public string Cccd { get; set; } = null!;

    public string? TaxCode { get; set; }

    public string? Phone { get; set; }

    public string? Address { get; set; }

    public string? BankAccount { get; set; }

    public DateOnly JoinDate { get; set; }

    public string? Status { get; set; }

    public DateOnly? Birthday { get; set; }

    public string? Gender { get; set; }

    public string Email { get; set; } = null!;

    public int RoleId { get; set; }

    public int? DepartmentId { get; set; }

    public DateTime? CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }

    public virtual ICollection<Activity> Activities { get; set; } = new List<Activity>();

    public virtual ICollection<ApprovalHistory> ApprovalHistories { get; set; } = new List<ApprovalHistory>();

    public virtual ICollection<Attendance> Attendances { get; set; } = new List<Attendance>();

    public virtual Department? Department { get; set; }

    public virtual ICollection<Department> Departments { get; set; } = new List<Department>();

    public virtual ICollection<Participation> Participations { get; set; } = new List<Participation>();

    public virtual Point? Point { get; set; }

    public virtual ICollection<PointConversionRule> PointConversionRules { get; set; } = new List<PointConversionRule>();

    public virtual ICollection<PointToMoneyHistory> PointToMoneyHistories { get; set; } = new List<PointToMoneyHistory>();

    public virtual ICollection<PointTransactionHistory> PointTransactionHistoryActors { get; set; } = new List<PointTransactionHistory>();

    public virtual ICollection<PointTransactionHistory> PointTransactionHistoryEmployees { get; set; } = new List<PointTransactionHistory>();

    public virtual ICollection<Request> Requests { get; set; } = new List<Request>();

    public virtual Role Role { get; set; } = null!;

    public virtual UserAccount? UserAccount { get; set; }
}
