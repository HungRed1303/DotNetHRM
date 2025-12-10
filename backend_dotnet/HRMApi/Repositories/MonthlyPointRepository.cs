using HRMApi.Data;
using HRMApi.Models;
using Microsoft.EntityFrameworkCore;

namespace HRMApi.Repositories;

public class MonthlyPointRepository : IMonthlyPointRepository
{
    private readonly HrmDbContext _context;

    public MonthlyPointRepository(HrmDbContext context)
    {
        _context = context;
    }

    // ============================================
    // MONTHLY POINT RULES
    // ============================================
    
    public async Task<IEnumerable<MonthlyPointRule>> GetAllRulesAsync()
    {
        return await _context.MonthlyPointRules
            .Include(r => r.Role)
            .OrderBy(r => r.RoleId)
            .ToListAsync();
    }

    public async Task<IEnumerable<MonthlyPointRule>> GetActiveRulesAsync()
    {
        return await _context.MonthlyPointRules
            .Include(r => r.Role)
            .Where(r => r.IsActive == true)
            .ToListAsync();
    }

    public async Task<MonthlyPointRule?> GetRuleByIdAsync(int id)
    {
        return await _context.MonthlyPointRules
            .Include(r => r.Role)
            .FirstOrDefaultAsync(r => r.Id == id);
    }

    public async Task<MonthlyPointRule?> GetRuleByRoleIdAsync(int roleId)
    {
        return await _context.MonthlyPointRules
            .Include(r => r.Role)
            .FirstOrDefaultAsync(r => r.RoleId == roleId);
    }

    public async Task<MonthlyPointRule> AddRuleAsync(MonthlyPointRule rule)
    {
        await _context.MonthlyPointRules.AddAsync(rule);
        await _context.SaveChangesAsync();
        return rule;
    }

    public async Task UpdateRuleAsync(MonthlyPointRule rule)
    {
        _context.MonthlyPointRules.Update(rule);
        await _context.SaveChangesAsync();
    }

    public async Task DeleteRuleAsync(int id)
    {
        var rule = await GetRuleByIdAsync(id);
        if (rule != null)
        {
            _context.MonthlyPointRules.Remove(rule);
            await _context.SaveChangesAsync();
        }
    }

    public async Task<bool> RuleExistsByRoleIdAsync(int roleId)
    {
        return await _context.MonthlyPointRules
            .AnyAsync(r => r.RoleId == roleId);
    }

    // ============================================
    // MONTHLY POINT ALLOCATION HISTORY
    // ============================================
    
    public async Task<MonthlyPointAllocationHistory> AddAllocationHistoryAsync(
        MonthlyPointAllocationHistory history)
    {
        await _context.MonthlyPointAllocationHistories.AddAsync(history);
        await _context.SaveChangesAsync();
        return history;
    }

    public async Task<IEnumerable<MonthlyPointAllocationHistory>> GetAllocationHistoryAsync(
        int limit = 12)
    {
        return await _context.MonthlyPointAllocationHistories
            .OrderByDescending(h => h.ExecutionDate)
            .Take(limit)
            .ToListAsync();
    }

    public async Task<MonthlyPointAllocationHistory?> GetAllocationHistoryByMonthAsync(
        int year, 
        int month)
    {
        return await _context.MonthlyPointAllocationHistories
            .FirstOrDefaultAsync(h => h.Year == year && h.Month == month);
    }

    public async Task<bool> HasAllocationForMonthAsync(int year, int month)
    {
        return await _context.MonthlyPointAllocationHistories
            .AnyAsync(h => h.Year == year && h.Month == month && h.Status == "completed");
    }
}