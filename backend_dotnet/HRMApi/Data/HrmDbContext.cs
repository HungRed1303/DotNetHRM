using HRMApi.Models;
using Microsoft.EntityFrameworkCore;

namespace HRMApi.Data;

public class HrmDbContext : DbContext
{
    public HrmDbContext(DbContextOptions<HrmDbContext> options) : base(options)
    {
    }

    // DbSets
    public DbSet<Role> Roles { get; set; }
    public DbSet<Department> Departments { get; set; }
    public DbSet<Employee> Employees { get; set; }
    public DbSet<UserAccount> UserAccounts { get; set; }
    public DbSet<RefreshToken> RefreshTokens { get; set; }
    public DbSet<PasswordResetToken> PasswordResetTokens { get; set; }
    public DbSet<Point> Points { get; set; }
    public DbSet<PointTransactionHistory> PointTransactionHistories { get; set; }
    public DbSet<PointConversionRule> PointConversionRules { get; set; }
    public DbSet<PointToMoneyHistory> PointToMoneyHistories { get; set; }
    public DbSet<Activity> Activities { get; set; }
    public DbSet<Participation> Participations { get; set; }
    public DbSet<Attendance> Attendances { get; set; }
    public DbSet<Request> Requests { get; set; }
    public DbSet<ApprovalHistory> ApprovalHistories { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        
        // ============================================
        // TABLE MAPPINGS
        // ============================================
        modelBuilder.Entity<Role>().ToTable("role");
        modelBuilder.Entity<Department>().ToTable("department");
        modelBuilder.Entity<Employee>().ToTable("employee");
        modelBuilder.Entity<UserAccount>().ToTable("user_accounts");
        modelBuilder.Entity<RefreshToken>().ToTable("refresh_tokens");
        modelBuilder.Entity<PasswordResetToken>().ToTable("password_reset_tokens");
        modelBuilder.Entity<Point>().ToTable("point");
        modelBuilder.Entity<PointTransactionHistory>().ToTable("point_transaction_history");
        modelBuilder.Entity<PointConversionRule>().ToTable("point_conversion_rules");
        modelBuilder.Entity<PointToMoneyHistory>().ToTable("point_to_money_history");
        modelBuilder.Entity<Activity>().ToTable("activity");
        modelBuilder.Entity<Participation>().ToTable("participation");
        modelBuilder.Entity<Attendance>().ToTable("attendance");
        modelBuilder.Entity<Request>().ToTable("request");
        modelBuilder.Entity<ApprovalHistory>().ToTable("approval_history");

        // ============================================
        // COLUMN MAPPINGS
        // ============================================
        
        // Role
        modelBuilder.Entity<Role>(entity =>
        {
            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.Name).HasColumnName("name");
            entity.Property(e => e.Description).HasColumnName("description");
            entity.Property(e => e.CreatedAt).HasColumnName("created_at");
        });

        // Department
        modelBuilder.Entity<Department>(entity =>
        {
            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.Name).HasColumnName("name");
            entity.Property(e => e.ManagerId).HasColumnName("manager_id");
            entity.Property(e => e.CreatedAt).HasColumnName("created_at");
            entity.Property(e => e.UpdatedAt).HasColumnName("updated_at");
        });

        // Employee
        modelBuilder.Entity<Employee>(entity =>
        {
            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.Fullname).HasColumnName("fullname");
            entity.Property(e => e.Cccd).HasColumnName("cccd");
            entity.Property(e => e.TaxCode).HasColumnName("tax_code");
            entity.Property(e => e.Phone).HasColumnName("phone");
            entity.Property(e => e.Address).HasColumnName("address");
            entity.Property(e => e.BankAccount).HasColumnName("bank_account");
            entity.Property(e => e.JoinDate).HasColumnName("join_date");
            entity.Property(e => e.Status).HasColumnName("status");
            entity.Property(e => e.Birthday).HasColumnName("birthday");
            entity.Property(e => e.Gender).HasColumnName("gender");
            entity.Property(e => e.Email).HasColumnName("email");
            entity.Property(e => e.RoleId).HasColumnName("role_id");
            entity.Property(e => e.DepartmentId).HasColumnName("department_id");
            entity.Property(e => e.CreatedAt).HasColumnName("created_at");
            entity.Property(e => e.UpdatedAt).HasColumnName("updated_at");
        });

        // UserAccount
        modelBuilder.Entity<UserAccount>(entity =>
        {
            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.EmployeeId).HasColumnName("employee_id");
            entity.Property(e => e.Username).HasColumnName("username");
            entity.Property(e => e.PasswordHash).HasColumnName("password_hash");
            entity.Property(e => e.IsActive).HasColumnName("is_active");
            entity.Property(e => e.IsVerified).HasColumnName("is_verified");
            entity.Property(e => e.LastLogin).HasColumnName("last_login");
            entity.Property(e => e.FailedLoginAttempts).HasColumnName("failed_login_attempts");
            entity.Property(e => e.LockedUntil).HasColumnName("locked_until");
            entity.Property(e => e.CreatedAt).HasColumnName("created_at");
            entity.Property(e => e.UpdatedAt).HasColumnName("updated_at");
        });

        // RefreshToken
        modelBuilder.Entity<RefreshToken>(entity =>
        {
            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.UserId).HasColumnName("user_id");
            entity.Property(e => e.Token).HasColumnName("token");
            entity.Property(e => e.ExpiresAt).HasColumnName("expires_at");
            entity.Property(e => e.CreatedAt).HasColumnName("created_at");
            entity.Property(e => e.IsRevoked).HasColumnName("is_revoked");
            entity.Property(e => e.RevokedAt).HasColumnName("revoked_at");
            entity.Property(e => e.DeviceInfo).HasColumnName("device_info");
            entity.Property(e => e.IpAddress).HasColumnName("ip_address");
        });

        // PasswordResetToken
        modelBuilder.Entity<PasswordResetToken>(entity =>
        {
            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.UserId).HasColumnName("user_id");
            entity.Property(e => e.Token).HasColumnName("token");
            entity.Property(e => e.ExpiresAt).HasColumnName("expires_at");
            entity.Property(e => e.Used).HasColumnName("used");
            entity.Property(e => e.UsedAt).HasColumnName("used_at");
            entity.Property(e => e.CreatedAt).HasColumnName("created_at");
        });

        // Point
        modelBuilder.Entity<Point>(entity =>
        {
            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.EmployeeId).HasColumnName("employee_id");
            entity.Property(e => e.PointTotal).HasColumnName("point_total");
            entity.Property(e => e.LastUpdate).HasColumnName("last_update");
        });

        // PointTransactionHistory
        modelBuilder.Entity<PointTransactionHistory>(entity =>
        {
            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.EmployeeId).HasColumnName("employee_id");
            entity.Property(e => e.Value).HasColumnName("value");
            entity.Property(e => e.Type).HasColumnName("type");
            entity.Property(e => e.ActorId).HasColumnName("actor_id");
            entity.Property(e => e.Description).HasColumnName("description");
            entity.Property(e => e.CreatedAt).HasColumnName("created_at");
        });

        // PointConversionRule
        modelBuilder.Entity<PointConversionRule>(entity =>
        {
            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.PointValue).HasColumnName("point_value");
            entity.Property(e => e.MoneyValue).HasColumnName("money_value");
            entity.Property(e => e.UpdatedBy).HasColumnName("updated_by");
            entity.Property(e => e.UpdatedAt).HasColumnName("updated_at");
            entity.Property(e => e.IsActive).HasColumnName("is_active");
        });

        // PointToMoneyHistory
        modelBuilder.Entity<PointToMoneyHistory>(entity =>
        {
            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.EmployeeId).HasColumnName("employee_id");
            entity.Property(e => e.PointRequested).HasColumnName("point_requested");
            entity.Property(e => e.MoneyReceived).HasColumnName("money_received");
            entity.Property(e => e.Status).HasColumnName("status");
            entity.Property(e => e.CreatedAt).HasColumnName("created_at");
            entity.Property(e => e.ProcessedAt).HasColumnName("processed_at");
        });

        // Activity
        modelBuilder.Entity<Activity>(entity =>
        {
            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.Name).HasColumnName("name");
            entity.Property(e => e.Description).HasColumnName("description");
            entity.Property(e => e.StartDate).HasColumnName("start_date");
            entity.Property(e => e.EndDate).HasColumnName("end_date");
            entity.Property(e => e.RegisterDeadline).HasColumnName("register_deadline");
            entity.Property(e => e.MaxParticipants).HasColumnName("max_participants");
            entity.Property(e => e.Status).HasColumnName("status");
            entity.Property(e => e.CreatedBy).HasColumnName("created_by");
            entity.Property(e => e.CreatedAt).HasColumnName("created_at");
            entity.Property(e => e.UpdatedAt).HasColumnName("updated_at");
        });

        // Participation
        modelBuilder.Entity<Participation>(entity =>
        {
            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.EmployeeId).HasColumnName("employee_id");
            entity.Property(e => e.ActivityId).HasColumnName("activity_id");
            entity.Property(e => e.RegisterDate).HasColumnName("register_date");
            entity.Property(e => e.CancelDate).HasColumnName("cancel_date");
            entity.Property(e => e.Status).HasColumnName("status");
            entity.Property(e => e.Result).HasColumnName("result");
            entity.Property(e => e.CreatedAt).HasColumnName("created_at");
        });

        // Attendance
        modelBuilder.Entity<Attendance>(entity =>
        {
            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.EmployeeId).HasColumnName("employee_id");
            entity.Property(e => e.Date).HasColumnName("date");
            entity.Property(e => e.CheckinTime).HasColumnName("checkin_time");
            entity.Property(e => e.CheckoutTime).HasColumnName("checkout_time");
            entity.Property(e => e.Status).HasColumnName("status");
            entity.Property(e => e.Attachment).HasColumnName("attachment");
            entity.Property(e => e.WorkHours).HasColumnName("work_hours");
            entity.Property(e => e.OvertimeHours).HasColumnName("overtime_hours");
            entity.Property(e => e.Note).HasColumnName("note");
            entity.Property(e => e.CreatedAt).HasColumnName("created_at");
            entity.Property(e => e.UpdatedAt).HasColumnName("updated_at");
        });

        // Request
        modelBuilder.Entity<Request>(entity =>
        {
            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.EmployeeId).HasColumnName("employee_id");
            entity.Property(e => e.Description).HasColumnName("description");
            entity.Property(e => e.StartTime).HasColumnName("start_time");
            entity.Property(e => e.EndTime).HasColumnName("end_time");
            entity.Property(e => e.Type).HasColumnName("type");
            entity.Property(e => e.Attachment).HasColumnName("attachment");
            entity.Property(e => e.Status).HasColumnName("status");
            entity.Property(e => e.CreatedAt).HasColumnName("created_at");
            entity.Property(e => e.UpdatedAt).HasColumnName("updated_at");
        });

        // ApprovalHistory
        modelBuilder.Entity<ApprovalHistory>(entity =>
        {
            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.RequestId).HasColumnName("request_id");
            entity.Property(e => e.ApproverId).HasColumnName("approver_id");
            entity.Property(e => e.Status).HasColumnName("status");
            entity.Property(e => e.Note).HasColumnName("note");
            entity.Property(e => e.CreatedAt).HasColumnName("created_at");
        });

        // ============================================
        // RELATIONSHIPS
        // ============================================

        // Configure Employee - Department relationship
        modelBuilder.Entity<Employee>()
            .HasOne(e => e.Department)
            .WithMany(d => d.Employees)
            .HasForeignKey(e => e.DepartmentId)
            .OnDelete(DeleteBehavior.SetNull);

        // Configure Department - Manager relationship
        modelBuilder.Entity<Department>()
            .HasOne(d => d.Manager)
            .WithMany(e => e.Departments)
            .HasForeignKey(d => d.ManagerId)
            .OnDelete(DeleteBehavior.Restrict);

        // Configure Employee - Role relationship
        modelBuilder.Entity<Employee>()
            .HasOne(e => e.Role)
            .WithMany(r => r.Employees)
            .HasForeignKey(e => e.RoleId)
            .OnDelete(DeleteBehavior.Restrict);

        // Configure Employee - UserAccount one-to-one relationship
        modelBuilder.Entity<Employee>()
            .HasOne(e => e.UserAccount)
            .WithOne(u => u.Employee)
            .HasForeignKey<UserAccount>(u => u.EmployeeId)
            .OnDelete(DeleteBehavior.Cascade);

        // Configure Employee - Point one-to-one relationship
        modelBuilder.Entity<Employee>()
            .HasOne(e => e.Point)
            .WithOne(p => p.Employee)
            .HasForeignKey<Point>(p => p.EmployeeId)
            .OnDelete(DeleteBehavior.Cascade);

        // Configure PointTransactionHistory relationships
        modelBuilder.Entity<PointTransactionHistory>()
            .HasOne(pt => pt.Employee)
            .WithMany(e => e.PointTransactionHistoryEmployees)
            .HasForeignKey(pt => pt.EmployeeId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<PointTransactionHistory>()
            .HasOne(pt => pt.Actor)
            .WithMany(e => e.PointTransactionHistoryActors)
            .HasForeignKey(pt => pt.ActorId)
            .OnDelete(DeleteBehavior.SetNull);

        // Configure Activity - Employee relationship
        modelBuilder.Entity<Activity>()
            .HasOne(a => a.CreatedByNavigation)
            .WithMany(e => e.Activities)
            .HasForeignKey(a => a.CreatedBy)
            .OnDelete(DeleteBehavior.SetNull);

        // Configure Participation relationships
        modelBuilder.Entity<Participation>()
            .HasOne(p => p.Employee)
            .WithMany(e => e.Participations)
            .HasForeignKey(p => p.EmployeeId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Participation>()
            .HasOne(p => p.Activity)
            .WithMany(a => a.Participations)
            .HasForeignKey(p => p.ActivityId)
            .OnDelete(DeleteBehavior.Cascade);

        // Configure Attendance - Employee relationship
        modelBuilder.Entity<Attendance>()
            .HasOne(a => a.Employee)
            .WithMany(e => e.Attendances)
            .HasForeignKey(a => a.EmployeeId)
            .OnDelete(DeleteBehavior.Cascade);

        // Configure Request - Employee relationship
        modelBuilder.Entity<Request>()
            .HasOne(r => r.Employee)
            .WithMany(e => e.Requests)
            .HasForeignKey(r => r.EmployeeId)
            .OnDelete(DeleteBehavior.Cascade);

        // Configure ApprovalHistory relationships
        modelBuilder.Entity<ApprovalHistory>()
            .HasOne(ah => ah.Request)
            .WithMany(r => r.ApprovalHistories)
            .HasForeignKey(ah => ah.RequestId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<ApprovalHistory>()
            .HasOne(ah => ah.Approver)
            .WithMany(e => e.ApprovalHistories)
            .HasForeignKey(ah => ah.ApproverId)
            .OnDelete(DeleteBehavior.Restrict);

        // Configure PointConversionRule - Employee relationship
        modelBuilder.Entity<PointConversionRule>()
            .HasOne(pcr => pcr.UpdatedByNavigation)
            .WithMany(e => e.PointConversionRules)
            .HasForeignKey(pcr => pcr.UpdatedBy)
            .OnDelete(DeleteBehavior.SetNull);

        // Configure PointToMoneyHistory - Employee relationship
        modelBuilder.Entity<PointToMoneyHistory>()
            .HasOne(ptm => ptm.Employee)
            .WithMany(e => e.PointToMoneyHistories)
            .HasForeignKey(ptm => ptm.EmployeeId)
            .OnDelete(DeleteBehavior.Cascade);

        // Configure RefreshToken - UserAccount relationship
        modelBuilder.Entity<RefreshToken>()
            .HasOne(rt => rt.User)
            .WithMany(u => u.RefreshTokens)
            .HasForeignKey(rt => rt.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        // Configure PasswordResetToken - UserAccount relationship
        modelBuilder.Entity<PasswordResetToken>()
            .HasOne(prt => prt.User)
            .WithMany(u => u.PasswordResetTokens)
            .HasForeignKey(prt => prt.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        // ============================================
        // INDEXES & CONSTRAINTS
        // ============================================
        
        modelBuilder.Entity<Employee>()
            .HasIndex(e => e.Email)
            .IsUnique();

        modelBuilder.Entity<Employee>()
            .HasIndex(e => e.Cccd)
            .IsUnique();

        modelBuilder.Entity<UserAccount>()
            .HasIndex(u => u.Username)
            .IsUnique();

        modelBuilder.Entity<Participation>()
            .HasIndex(p => new { p.EmployeeId, p.ActivityId })
            .IsUnique();

        modelBuilder.Entity<Attendance>()
            .HasIndex(a => new { a.EmployeeId, a.Date })
            .IsUnique();
    }
}