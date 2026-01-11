using System.ComponentModel.DataAnnotations;

namespace HRMApi.DTOs;

// DTO cho danh sách phòng ban
public class DepartmentDto
{
    public int Id { get; set; }
    public string Name { get; set; } = null!;
    public int? ManagerId { get; set; }
    public string? ManagerName { get; set; }
    public int EmployeeCount { get; set; }
    public DateTime? CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}

// DTO cho tạo phòng ban
public class CreateDepartmentDto
{
    [Required(ErrorMessage = "Tên phòng ban là bắt buộc")]
    [StringLength(100, ErrorMessage = "Tên phòng ban không được vượt quá 100 ký tự")]
    public string Name { get; set; } = null!;

    public int? ManagerId { get; set; }
}

// DTO cho cập nhật phòng ban
public class UpdateDepartmentDto
{
    [Required(ErrorMessage = "Tên phòng ban là bắt buộc")]
    [StringLength(100, ErrorMessage = "Tên phòng ban không được vượt quá 100 ký tự")]
    public string Name { get; set; } = null!;

    public int? ManagerId { get; set; }
}