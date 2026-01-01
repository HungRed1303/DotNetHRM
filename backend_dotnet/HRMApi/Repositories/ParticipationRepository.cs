using HRMApi.Data;
using HRMApi.Models;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;

namespace HRMApi.Repositories;

public class ParticipationRepository : IParticipationRepository
{
    private readonly HrmDbContext _context;

    public ParticipationRepository(HrmDbContext context)
    {
        _context = context;
    }

    // ============================================
    // EXISTING METHODS (unchanged)
    // ============================================
    
    public async Task<IEnumerable<Participation?>> GetByEmployeeIdAsync(int employeeId)
    {
        return await _context.Participations
            .Include(p => p.Activity)
            .Include(p => p.Employee)
            .Where(p => p.EmployeeId == employeeId)
            .ToListAsync();
    }

    public async Task<IEnumerable<Participation?>> GetByActivityIdAsync(int activityId)
    {
        return await _context.Participations
            .Include(p => p.Activity)
            .Include(p => p.Employee)
            .Where(p => p.ActivityId == activityId)
            .ToListAsync();
    }

    public async Task<Participation?> GetByActivityIdEmployeeIdAsync(int activityId, int employeeId)
    {
        return await _context.Participations
            .Include(p => p.Activity)
            .Include(p => p.Employee)
            .Where(p => p.ActivityId == activityId && p.EmployeeId == employeeId)
            .FirstOrDefaultAsync();
    }

    public async Task<IEnumerable<Participation>> GetAllAsync()
    {
        return await _context.Participations
            .Include(p => p.Activity)
            .Include(p => p.Employee)
            .ToListAsync();
    }

    public async Task<(IEnumerable<Participation> items, int totalCount)> GetPagedAsync(
        int pageNumber,
        int pageSize,
        string? searchTerm = null)
    {
        var query = _context.Participations
            .Include(p => p.Activity)
            .Include(p => p.Employee)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(searchTerm))
        {
            searchTerm = searchTerm.ToLower();
            query = query.Where(p =>
                p.Employee.Fullname.Contains(searchTerm, StringComparison.CurrentCultureIgnoreCase) ||
                p.Activity.Name.Contains(searchTerm, StringComparison.CurrentCultureIgnoreCase));
        }

        var totalCount = await query.CountAsync();

        var items = await query
            .OrderByDescending(p => p.CreatedAt)
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return (items, totalCount);
    }

    // ============================================
    // NEW METHODS - JSONB Support
    // ============================================

    /// <summary>
    /// Update participation (including result JSONB field)
    /// </summary>
    public async Task UpdateAsync(Participation participation)
    {
        _context.Participations.Update(participation);
        await _context.SaveChangesAsync();
    }

    /// <summary>
    /// Get all participations for a specific activity type
    /// </summary>
    public async Task<IEnumerable<Participation>> GetByActivityTypeAsync(string activityType)
    {
        return await _context.Participations
            .Include(p => p.Activity)
            .Include(p => p.Employee)
            .Where(p => p.Activity.ActivityType == activityType)
            .OrderByDescending(p => p.CreatedAt)
            .ToListAsync();
    }

    /// <summary>
    /// Get all participations that have result data
    /// </summary>
    public async Task<IEnumerable<Participation>> GetWithResultsAsync()
    {
        return await _context.Participations
            .Include(p => p.Activity)
            .Include(p => p.Employee)
            .Where(p => p.Result != null)
            .OrderByDescending(p => p.CreatedAt)
            .ToListAsync();
    }

    /// <summary>
    /// Get participations where result contains a specific key
    /// Example: GetByResultKeyAsync("certificate_issued")
    /// </summary>
    public async Task<IEnumerable<Participation>> GetByResultKeyAsync(string key)
    {
        // Use raw SQL for JSONB operator ?
        var sql = @"
            SELECT p.* 
            FROM participation p
            INNER JOIN activity a ON p.activity_id = a.id
            INNER JOIN employee e ON p.employee_id = e.id
            WHERE p.result ? {0}
            ORDER BY p.created_at DESC";

        return await _context.Participations
            .FromSqlRaw(sql, key)
            .Include(p => p.Activity)
            .Include(p => p.Employee)
            .ToListAsync();
    }

    /// <summary>
    /// Get participations where result[key] = value
    /// Example: GetByResultValueAsync("certificate_issued", true)
    /// </summary>
    public async Task<IEnumerable<Participation>> GetByResultValueAsync(string key, object value)
    {
        var valueJson = JsonSerializer.Serialize(value);
        
        // Use raw SQL for JSONB operator ->>
        var sql = @"
            SELECT p.* 
            FROM participation p
            INNER JOIN activity a ON p.activity_id = a.id
            INNER JOIN employee e ON p.employee_id = e.id
            WHERE p.result->>'{0}' = {1}
            ORDER BY p.created_at DESC";

        return await _context.Participations
            .FromSqlRaw(sql, key, valueJson.Trim('"'))
            .Include(p => p.Activity)
            .Include(p => p.Employee)
            .ToListAsync();
    }

    /// <summary>
    /// Get top performers by activity type, sorted by a result field
    /// Example: GetTopPerformersByActivityTypeAsync("sports", "rank", 10)
    /// </summary>
    public async Task<IEnumerable<Participation>> GetTopPerformersByActivityTypeAsync(
        string activityType, 
        string sortKey, 
        int limit = 10)
    {
        // Use raw SQL for JSONB casting and ordering
        var sql = $@"
            SELECT p.* 
            FROM participation p
            INNER JOIN activity a ON p.activity_id = a.id
            INNER JOIN employee e ON p.employee_id = e.id
            WHERE a.activity_type = {{0}}
                AND p.result ? {{1}}
                AND p.status = 'attended'
            ORDER BY (p.result->>{{1}})::numeric ASC
            LIMIT {{2}}";

        return await _context.Participations
            .FromSqlRaw(sql, activityType, sortKey, limit)
            .Include(p => p.Activity)
            .Include(p => p.Employee)
            .ToListAsync();
    }

    /// <summary>
    /// Get statistics about results by activity type
    /// Returns count of participations with different result keys
    /// </summary>
    public async Task<Dictionary<string, int>> GetResultStatsByActivityTypeAsync(string activityType)
    {
        // This is a complex query - for now return basic stats
        // In production, you might want to create a stored procedure
        var participations = await _context.Participations
            .Include(p => p.Activity)
            .Where(p => 
                p.Activity.ActivityType == activityType && 
                p.Result != null)
            .ToListAsync();

        var stats = new Dictionary<string, int>
        {
            { "total_with_results", participations.Count },
            { "total_attended", participations.Count(p => p.Status == "attended") }
        };

        // Count participations with specific keys
        var keysToCheck = new[] { "rank", "score", "certificate_issued", "time", "hours_contributed" };
        
        foreach (var key in keysToCheck)
        {
            var count = participations.Count(p => 
                p.Result != null && 
                p.Result.RootElement.TryGetProperty(key, out _));
            
            if (count > 0)
            {
                stats[$"with_{key}"] = count;
            }
        }

        return stats;
    }

    /// <summary>
    /// Get participation for attendance update (lighter query)
    /// </summary>
    public async Task<Participation?> GetByActivityIdEmployeeIdForAttendanceAsync(
        int activityId, 
        int employeeId)
    {
        return await _context.Participations
            .Include(p => p.Activity)
            .Include(p => p.Employee)
            .Where(p => p.ActivityId == activityId && p.EmployeeId == employeeId)
            .FirstOrDefaultAsync();
    }
    // ============================================
    // ADVANCED QUERY EXAMPLES
    // ============================================

    /// <summary>
    /// Get running results with time under specified duration
    /// Example: GetRunningResultsUnderTimeAsync("01:30:00")
    /// </summary>
    public async Task<IEnumerable<Participation>> GetRunningResultsUnderTimeAsync(string maxTime)
    {
        var sql = @"
            SELECT p.* 
            FROM participation p
            INNER JOIN activity a ON p.activity_id = a.id
            INNER JOIN employee e ON p.employee_id = e.id
            WHERE a.activity_type = 'sports'
                AND p.result ? 'time'
                AND p.result->>'time' < {0}
            ORDER BY p.result->>'time'";

        return await _context.Participations
            .FromSqlRaw(sql, maxTime)
            .Include(p => p.Activity)
            .Include(p => p.Employee)
            .ToListAsync();
    }

    /// <summary>
    /// Get training results with quiz score above threshold
    /// </summary>
    public async Task<IEnumerable<Participation>> GetTrainingResultsAboveScoreAsync(int minScore)
    {
        var sql = @"
            SELECT p.* 
            FROM participation p
            INNER JOIN activity a ON p.activity_id = a.id
            INNER JOIN employee e ON p.employee_id = e.id
            WHERE a.activity_type = 'training'
                AND p.result ? 'quiz_score'
                AND (p.result->>'quiz_score')::int > {0}
            ORDER BY (p.result->>'quiz_score')::int DESC";

        return await _context.Participations
            .FromSqlRaw(sql, minScore)
            .Include(p => p.Activity)
            .Include(p => p.Employee)
            .ToListAsync();
    }

    /// <summary>
    /// Get volunteer hours summary by employee
    /// </summary>
    public async Task<Dictionary<int, double>> GetVolunteerHoursByEmployeeAsync()
    {
        var sql = @"
            SELECT 
                p.employee_id,
                SUM((p.result->>'hours_contributed')::numeric) as total_hours
            FROM participation p
            INNER JOIN activity a ON p.activity_id = a.id
            WHERE a.activity_type = 'volunteer'
                AND p.result ? 'hours_contributed'
            GROUP BY p.employee_id
            ORDER BY total_hours DESC";

        var result = await _context.Database
            .SqlQueryRaw<VolunteerHoursSummary>(sql)
            .ToListAsync();

        return result.ToDictionary(
            x => x.EmployeeId, 
            x => (double)x.TotalHours);
    }

    /// <summary>
    /// Get employees with certificates issued
    /// </summary>
    public async Task<IEnumerable<Participation>> GetCertifiedEmployeesAsync()
    {
        var sql = @"
            SELECT p.* 
            FROM participation p
            INNER JOIN activity a ON p.activity_id = a.id
            INNER JOIN employee e ON p.employee_id = e.id
            WHERE p.result ? 'certificate_issued'
                AND (p.result->>'certificate_issued')::boolean = true
            ORDER BY p.created_at DESC";

        return await _context.Participations
            .FromSqlRaw(sql)
            .Include(p => p.Activity)
            .Include(p => p.Employee)
            .ToListAsync();
    }

    /// <summary>
    /// Search in result JSONB field
    /// Example: SearchInResultsAsync("excellent")
    /// </summary>
    public async Task<IEnumerable<Participation>> SearchInResultsAsync(string searchTerm)
    {
        var sql = @"
            SELECT p.* 
            FROM participation p
            INNER JOIN activity a ON p.activity_id = a.id
            INNER JOIN employee e ON p.employee_id = e.id
            WHERE p.result::text ILIKE {0}
            ORDER BY p.created_at DESC";

        return await _context.Participations
            .FromSqlRaw(sql, $"%{searchTerm}%")
            .Include(p => p.Activity)
            .Include(p => p.Employee)
            .ToListAsync();
    }
}

// ============================================
// Helper class for raw SQL queries
// ============================================
public class VolunteerHoursSummary
{
    public int EmployeeId { get; set; }
    public decimal TotalHours { get; set; }
}
