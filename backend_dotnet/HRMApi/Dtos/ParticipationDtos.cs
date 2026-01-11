using System.ComponentModel.DataAnnotations;
using System.Text.Json;

namespace HRMApi.DTOs;

public class ParticipationDto
{
    public int Id { get; set; }
    public int EmployeeId { get; set; }
    public int ActivityId { get; set; }
    public string EmployeeName { get; set; } = null!;
    public string ActivityName { get; set; } = null!;
    public string Description { get; set; } = null!;
    public DateTime? RegisterDate { get; set; }
    public DateTime? CancelDate { get; set; }
    public string Status { get; set; } = null!;
    
    // Return as Dictionary for easy JSON serialization
    public Dictionary<string, object?>? Result { get; set; }
}

// DTO for creating/updating participation result
public class UpdateParticipationResultDto
{
    [Required(ErrorMessage = "Result data is required")]
    public Dictionary<string, object?> ResultData { get; set; } = new();
}

// Specific result DTOs for different activity types
public class RunningResultDto
{
    [Required]
    public string Time { get; set; } = null!; // Format: HH:mm:ss
    
    [Range(0.1, 1000)]
    public double DistanceKm { get; set; }
    
    [Range(1, int.MaxValue)]
    public int? Rank { get; set; }
    
    public string? PacePerKm { get; set; } // Format: mm:ss
    
    public string? Note { get; set; }
}

public class SwimmingResultDto
{
    [Required]
    public string Style { get; set; } = null!; // freestyle, backstroke, breaststroke, butterfly
    
    [Range(1, 10000)]
    public int DistanceM { get; set; }
    
    [Required]
    public string Time { get; set; } = null!; // Format: HH:mm:ss
    
    [Range(1, int.MaxValue)]
    public int? Rank { get; set; }
    
    public string? Note { get; set; }
}

public class TrainingResultDto
{
    [Range(0, 100)]
    public int AttendanceHours { get; set; }
    
    [Range(0, 100)]
    public int? QuizScore { get; set; }
    
    public bool CertificateIssued { get; set; }
    
    public DateTime? CompletionDate { get; set; }
    
    public string? Feedback { get; set; }
}

public class VolunteerResultDto
{
    [Range(0.5, 24)]
    public double HoursContributed { get; set; }
    
    public List<string>? TasksCompleted { get; set; }
    
    public string? Impact { get; set; }
    
    public string? Recognition { get; set; }
}

public class TeamBuildingResultDto
{
    public string? TeamName { get; set; }
    
    [Range(1, int.MaxValue)]
    public int? TeamRank { get; set; }
    
    public List<string>? ActivitiesCompleted { get; set; }
    
    [Range(0, int.MaxValue)]
    public int? PointsEarned { get; set; }
    
    public string? Note { get; set; }
}

public class UpdateAttendanceStatusDto
{
    [Required(ErrorMessage = "Trạng thái điểm danh là bắt buộc")]
    [RegularExpression(@"^(attended|absent)$", 
        ErrorMessage = "Trạng thái phải là: attended (có mặt) hoặc absent (vắng mặt)")]
    public string Status { get; set; } = null!;
    
    public string? Note { get; set; }
}

// Batch attendance DTOs
public class BatchUpdateAttendanceDto
{
    [Required]
    public List<AttendanceItemDto> Attendances { get; set; } = new();
}

public class AttendanceItemDto
{
    [Required]
    public int EmployeeId { get; set; }
    
    [Required]
    [RegularExpression(@"^(attended|absent)$")]
    public string Status { get; set; } = null!;
    
    public string? Note { get; set; }
}

public class BatchAttendanceResultDto
{
    public int SuccessCount { get; set; }
    public int FailCount { get; set; }
    public List<string> Errors { get; set; } = new();
    public string Result { get; set; } = null!;
    public string imgPath { get; set; } = null!;
}