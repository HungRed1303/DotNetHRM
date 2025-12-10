using HRMApi.Models;

namespace HRMApi.Repositories;

public interface IMonthlyPointRepository
{
    // Monthly Point Rules
    Task<IEnumerable<MonthlyPointRule>> GetAllRulesAsync();
    Task<IEnumerable<MonthlyPointRule>> GetActiveRulesAsync();
    Task<MonthlyPointRule?> GetRuleByIdAsync(int id);
    Task<MonthlyPointRule?> GetRuleByRoleIdAsync(int roleId);
    Task<MonthlyPointRule> AddRuleAsync(MonthlyPointRule rule);
    Task UpdateRuleAsync(MonthlyPointRule rule);
    Task DeleteRuleAsync(int id);
    Task<bool> RuleExistsByRoleIdAsync(int roleId);
    
    // Monthly Point Allocation History
    Task<MonthlyPointAllocationHistory> AddAllocationHistoryAsync(MonthlyPointAllocationHistory history);
    Task<IEnumerable<MonthlyPointAllocationHistory>> GetAllocationHistoryAsync(int limit = 12);
    Task<MonthlyPointAllocationHistory?> GetAllocationHistoryByMonthAsync(int year, int month);
    Task<bool> HasAllocationForMonthAsync(int year, int month);
}