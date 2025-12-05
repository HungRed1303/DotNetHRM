using HRMApi.Data;
using HRMApi.Models;
using Microsoft.EntityFrameworkCore;

namespace HRMApi.Repositories;

public class PointRepository : IPointRepository
{
    private readonly HrmDbContext _context;

    public PointRepository(HrmDbContext context)
    {
        _context = context;
    }

    // ============================================
    // POINT QUERIES
    // ============================================
    
    public async Task<Point?> GetByEmployeeIdAsync(int employeeId)
    {
        return await _context.Points
            .Include(p => p.Employee)
                .ThenInclude(e => e.Role)
            .Include(p => p.Employee)
                .ThenInclude(e => e.Department)
            .FirstOrDefaultAsync(p => p.EmployeeId == employeeId);
    }

    public async Task<IEnumerable<Point>> GetAllAsync()
    {
        return await _context.Points
            .Include(p => p.Employee)
                .ThenInclude(e => e.Role)
            .Include(p => p.Employee)
                .ThenInclude(e => e.Department)
            .OrderByDescending(p => p.PointTotal)
            .ToListAsync();
    }

    public async Task<(IEnumerable<Point> items, int totalCount)> GetPagedAsync(
        int pageNumber, 
        int pageSize,
        string? searchTerm = null)
    {
        var query = _context.Points
            .Include(p => p.Employee)
                .ThenInclude(e => e.Role)
            .Include(p => p.Employee)
                .ThenInclude(e => e.Department)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(searchTerm))
        {
            searchTerm = searchTerm.ToLower();
            query = query.Where(p => 
                p.Employee.Fullname.ToLower().Contains(searchTerm) ||
                p.Employee.Email.ToLower().Contains(searchTerm));
        }

        var totalCount = await query.CountAsync();

        var items = await query
            .OrderByDescending(p => p.PointTotal)
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return (items, totalCount);
    }

    public async Task UpdateAsync(Point point)
    {
        _context.Points.Update(point);
        await _context.SaveChangesAsync();
    }

    // ============================================
    // POINT TRANSACTION HISTORY
    // ============================================
    
    public async Task<PointTransactionHistory> AddTransactionAsync(PointTransactionHistory transaction)
    {
        await _context.PointTransactionHistories.AddAsync(transaction);
        await _context.SaveChangesAsync();
        return transaction;
    }

    public async Task<IEnumerable<PointTransactionHistory>> GetTransactionsByEmployeeIdAsync(
        int employeeId,
        int? limit = null)
    {
        var query = _context.PointTransactionHistories
            .Include(t => t.Employee)
            .Include(t => t.Actor)
            .Where(t => t.EmployeeId == employeeId)
            .OrderByDescending(t => t.CreatedAt);

        if (limit.HasValue)
        {
            query = (IOrderedQueryable<PointTransactionHistory>)query.Take(limit.Value);
        }

        return await query.ToListAsync();
    }

    public async Task<(IEnumerable<PointTransactionHistory> items, int totalCount)> GetTransactionsPagedAsync(
        int pageNumber,
        int pageSize,
        int? employeeId = null,
        string? type = null,
        DateTime? fromDate = null,
        DateTime? toDate = null)
    {
        var query = _context.PointTransactionHistories
            .Include(t => t.Employee)
            .Include(t => t.Actor)
            .AsQueryable();

        if (employeeId.HasValue)
        {
            query = query.Where(t => t.EmployeeId == employeeId.Value);
        }

        if (!string.IsNullOrWhiteSpace(type))
        {
            query = query.Where(t => t.Type == type);
        }

        if (fromDate.HasValue)
        {
            query = query.Where(t => t.CreatedAt >= fromDate.Value);
        }

        if (toDate.HasValue)
        {
            query = query.Where(t => t.CreatedAt <= toDate.Value);
        }

        var totalCount = await query.CountAsync();

        var items = await query
            .OrderByDescending(t => t.CreatedAt)
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return (items, totalCount);
    }

    // ============================================
    // POINT CONVERSION RULES
    // ============================================
    
    public async Task<PointConversionRule?> GetActiveConversionRuleAsync()
    {
        return await _context.PointConversionRules
            .Include(r => r.UpdatedByNavigation)
            .Where(r => r.IsActive == true)
            .OrderByDescending(r => r.UpdatedAt)
            .FirstOrDefaultAsync();
    }

    public async Task<IEnumerable<PointConversionRule>> GetAllConversionRulesAsync()
    {
        return await _context.PointConversionRules
            .Include(r => r.UpdatedByNavigation)
            .OrderByDescending(r => r.UpdatedAt)
            .ToListAsync();
    }

    public async Task<PointConversionRule> AddConversionRuleAsync(PointConversionRule rule)
    {
        await _context.PointConversionRules.AddAsync(rule);
        await _context.SaveChangesAsync();
        return rule;
    }

    public async Task UpdateConversionRuleAsync(PointConversionRule rule)
    {
        _context.PointConversionRules.Update(rule);
        await _context.SaveChangesAsync();
    }

    public async Task<PointConversionRule?> GetConversionRuleByIdAsync(int id)
    {
        return await _context.PointConversionRules
            .Include(r => r.UpdatedByNavigation)
            .FirstOrDefaultAsync(r => r.Id == id);
    }

    // ============================================
    // POINT TO MONEY HISTORY
    // ============================================
    
    public async Task<PointToMoneyHistory> AddPointToMoneyHistoryAsync(PointToMoneyHistory history)
    {
        await _context.PointToMoneyHistories.AddAsync(history);
        await _context.SaveChangesAsync();
        return history;
    }

    public async Task<PointToMoneyHistory?> GetPointToMoneyHistoryByIdAsync(int id)
    {
        return await _context.PointToMoneyHistories
            .Include(h => h.Employee)
                .ThenInclude(e => e.Role)
            .Include(h => h.Employee)
                .ThenInclude(e => e.Department)
            .FirstOrDefaultAsync(h => h.Id == id);
    }

    public async Task UpdatePointToMoneyHistoryAsync(PointToMoneyHistory history)
    {
        _context.PointToMoneyHistories.Update(history);
        await _context.SaveChangesAsync();
    }

    public async Task<(IEnumerable<PointToMoneyHistory> items, int totalCount)> GetPointToMoneyHistoryPagedAsync(
        int pageNumber,
        int pageSize,
        int? employeeId = null,
        string? status = null)
    {
        var query = _context.PointToMoneyHistories
            .Include(h => h.Employee)
                .ThenInclude(e => e.Role)
            .Include(h => h.Employee)
                .ThenInclude(e => e.Department)
            .AsQueryable();

        if (employeeId.HasValue)
        {
            query = query.Where(h => h.EmployeeId == employeeId.Value);
        }

        if (!string.IsNullOrWhiteSpace(status))
        {
            query = query.Where(h => h.Status == status);
        }

        var totalCount = await query.CountAsync();

        var items = await query
            .OrderByDescending(h => h.CreatedAt)
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return (items, totalCount);
    }

    // ============================================
    // STATISTICS
    // ============================================
    
    public async Task<int> GetTotalEmployeesWithPointsAsync()
    {
        return await _context.Points.CountAsync();
    }

    public async Task<long> GetTotalPointsInSystemAsync()
    {
        return await _context.Points.SumAsync(p => (long)(p.PointTotal ?? 0));
    }

    public async Task<Point?> GetTopEmployeeByPointsAsync()
    {
        return await _context.Points
            .Include(p => p.Employee)
                .ThenInclude(e => e.Role)
            .Include(p => p.Employee)
                .ThenInclude(e => e.Department)
            .OrderByDescending(p => p.PointTotal)
            .FirstOrDefaultAsync();
    }

    public async Task<int> GetPendingConversionRequestsCountAsync()
    {
        return await _context.PointToMoneyHistories
            .CountAsync(h => h.Status == "pending");
    }

    public async Task<Dictionary<string, int>> GetTransactionCountsByTypeAsync()
    {
        return await _context.PointTransactionHistories
            .GroupBy(t => t.Type)
            .Select(g => new { Type = g.Key, Count = g.Count() })
            .ToDictionaryAsync(x => x.Type, x => x.Count);
    }
}