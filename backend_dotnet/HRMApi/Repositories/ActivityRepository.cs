using HRMApi.Data;
using HRMApi.Dtos;
using Microsoft.EntityFrameworkCore;

namespace HRMApi.Repositories;

public class ActivityRepository : IActivityRepository
{
    private readonly HrmDbContext _context;

    public ActivityRepository(HrmDbContext context)
    {
        _context = context;
    }

    public async Task<List<CompletedActivityDto>> GetCompletedActivitiesAsync()
    {
        var completedActivities = await _context.Activities
            .Where(a => a.Status == "completed" && (a.IsDeleted == null || a.IsDeleted == false))
            .Select(a => new CompletedActivityDto
            {
                Id = a.Id,
                Name = a.Name,
                Description = a.Description,
                StartDate = a.StartDate,
                EndDate = a.EndDate,
                MaxParticipants = a.MaxParticipants,
                CurrentParticipants = a.Participations.Count(p => p.Status == "attended"),
                ExcellentEmployees = a.Participations.Count(p => p.Status == "attended" && p.Performance == "excellent"),
                ExcellentEmployeeList = a.Participations
                    .Where(p => p.Status == "attended" && p.Performance == "excellent")
                    .Select(p => new ExcellentEmployeeDto
                    {
                        Id = p.Employee.Id,
                        Name = p.Employee.Fullname,
                        Department = p.Employee.Department != null ? p.Employee.Department.Name : "N/A",
                        Email = p.Employee.Email
                    })
                    .ToList(),
                Location = a.Location,
                ActivityType = a.ActivityType,
                ImageUrl = a.ImageUrl,
                Organizer = a.Organizer,
                Points = a.Points
            })
            .ToListAsync();

        return completedActivities;
    }
}
