namespace HRMApi.Dtos;

public class ExcellentEmployeeDto
{
    public int Id { get; set; }
    public string Name { get; set; } = null!;
    public string Department { get; set; } = null!;
    public string Email { get; set; } = null!;
}

public class CompletedActivityDto
{
    public int Id { get; set; }
    public string Name { get; set; } = null!;
    public string? Description { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public int? MaxParticipants { get; set; }
    public int CurrentParticipants { get; set; }
    public int ExcellentEmployees { get; set; }
    public List<ExcellentEmployeeDto> ExcellentEmployeeList { get; set; } = new();
    public string? Location { get; set; }
    public string? ActivityType { get; set; }
    public string? ImageUrl { get; set; }
    public string? Organizer { get; set; }
    public int? Points { get; set; }
}
