using HRMApi.Models;

namespace HRMApi.Repositories;

public interface IParticipationRepository
{
    // Existing methods
    Task<IEnumerable<Participation?>> GetByEmployeeIdAsync(int employeeId);
    Task<IEnumerable<Participation?>> GetByActivityIdAsync(int activityId);
    Task<Participation?> GetByActivityIdEmployeeIdAsync(int activityId, int employeeId);
    Task<IEnumerable<Participation>> GetAllAsync();
    Task<(IEnumerable<Participation> items, int totalCount)> GetPagedAsync(
        int pageNumber,
        int pageSize,
        string? searchTerm = null);

    // JSONB support methods
    Task UpdateAsync(Participation participation);
    Task<IEnumerable<Participation>> GetByActivityTypeAsync(string activityType);
    Task<IEnumerable<Participation>> GetWithResultsAsync();
    Task<IEnumerable<Participation>> GetByResultKeyAsync(string key);
    Task<IEnumerable<Participation>> GetByResultValueAsync(string key, object value);
    
    // Advanced JSONB queries
    Task<IEnumerable<Participation>> GetTopPerformersByActivityTypeAsync(
        string activityType, 
        string sortKey, 
        int limit = 10);
    Task<Dictionary<string, int>> GetResultStatsByActivityTypeAsync(string activityType);
    
    // Additional specialized query methods
    Task<IEnumerable<Participation>> GetRunningResultsUnderTimeAsync(string maxTime);
    Task<IEnumerable<Participation>> GetTrainingResultsAboveScoreAsync(int minScore);
    Task<Dictionary<int, double>> GetVolunteerHoursByEmployeeAsync();
    Task<IEnumerable<Participation>> GetCertifiedEmployeesAsync();
    Task<IEnumerable<Participation>> SearchInResultsAsync(string searchTerm);
    Task<Participation?> GetByActivityIdEmployeeIdForAttendanceAsync(int activityId, int employeeId);
}