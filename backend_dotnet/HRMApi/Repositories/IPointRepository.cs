using HRMApi.Models;

namespace HRMApi.Repositories;

public interface IPointRepository
{
    // Point queries
    Task<Point?> GetByEmployeeIdAsync(int employeeId);
    Task<IEnumerable<Point>> GetAllAsync();
    Task<(IEnumerable<Point> items, int totalCount)> GetPagedAsync(
        int pageNumber,
        int pageSize,
        string? searchTerm = null);
    Task UpdateAsync(Point point);

    // Point Transaction History
    Task<PointTransactionHistory> AddTransactionAsync(PointTransactionHistory transaction);
    Task<IEnumerable<PointTransactionHistory>> GetTransactionsByEmployeeIdAsync(
        int employeeId,
        int? limit = null);
    Task<(IEnumerable<PointTransactionHistory> items, int totalCount)> GetTransactionsPagedAsync(
        int pageNumber,
        int pageSize,
        int? employeeId = null,
        string? type = null,
        DateTime? fromDate = null,
        DateTime? toDate = null);

    // Point Conversion Rules
    Task<PointConversionRule?> GetActiveConversionRuleAsync();
    Task<IEnumerable<PointConversionRule>> GetAllConversionRulesAsync();
    Task<PointConversionRule> AddConversionRuleAsync(PointConversionRule rule);
    Task UpdateConversionRuleAsync(PointConversionRule rule);
    Task<PointConversionRule?> GetConversionRuleByIdAsync(int id);

    // Point to Money History
    Task<PointToMoneyHistory> AddPointToMoneyHistoryAsync(PointToMoneyHistory history);
    Task<PointToMoneyHistory?> GetPointToMoneyHistoryByIdAsync(int id);
    Task UpdatePointToMoneyHistoryAsync(PointToMoneyHistory history);
    Task<(IEnumerable<PointToMoneyHistory> items, int totalCount)> GetPointToMoneyHistoryPagedAsync(
        int pageNumber,
        int pageSize,
        int? employeeId = null,
        string? status = null);

    // Statistics
    Task<int> GetTotalEmployeesWithPointsAsync();
    Task<long> GetTotalPointsInSystemAsync();
    Task<Point?> GetTopEmployeeByPointsAsync();
    Task<int> GetPendingConversionRequestsCountAsync();
    Task<Dictionary<string, int>> GetTransactionCountsByTypeAsync();
}