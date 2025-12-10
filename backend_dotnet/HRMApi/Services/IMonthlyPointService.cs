using HRMApi.DTOs;

namespace HRMApi.Services;

public interface IMonthlyPointService
{
    // Monthly Point Rules Management
    Task<List<MonthlyPointRuleDto>> GetAllRulesAsync();
    Task<MonthlyPointRuleDto?> GetRuleByIdAsync(int id);
    Task<ApiResponse<MonthlyPointRuleDto>> UpsertRuleAsync(UpsertMonthlyPointRuleDto dto);
    Task<ApiResponse<bool>> DeleteRuleAsync(int id);
    
    // Monthly Point Allocation
    Task<ApiResponse<MonthlyPointAllocationResultDto>> AllocateMonthlyPointsAsync();
    Task<bool> HasRunThisMonthAsync();
    
    // Allocation History
    Task<List<MonthlyPointAllocationHistoryDto>> GetAllocationHistoryAsync(int limit = 12);
}