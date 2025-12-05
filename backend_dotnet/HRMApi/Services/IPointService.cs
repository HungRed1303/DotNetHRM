using HRMApi.DTOs;

namespace HRMApi.Services;

public interface IPointService
{
    // Point queries
    Task<ApiResponse<EmployeePointDto>> GetEmployeePointAsync(int employeeId);
    Task<PagedResult<EmployeePointDto>> GetAllEmployeePointsAsync(
        int pageNumber, 
        int pageSize,
        string? searchTerm = null);
    
    // Point updates
    Task<ApiResponse<EmployeePointDto>> UpdateEmployeePointAsync(
        int employeeId, 
        UpdatePointDto dto);
    
    // Point Transaction History
    Task<PagedResult<PointTransactionDto>> GetPointTransactionsAsync(
        int pageNumber,
        int pageSize,
        int? employeeId = null,
        string? type = null,
        DateTime? fromDate = null,
        DateTime? toDate = null);
    Task<List<PointTransactionDto>> GetEmployeeTransactionHistoryAsync(
        int employeeId, 
        int? limit = null);
    
    // Point Conversion Rules
    Task<ApiResponse<PointConversionRuleDto>> GetActiveConversionRuleAsync();
    Task<List<PointConversionRuleDto>> GetAllConversionRulesAsync();
    Task<ApiResponse<PointConversionRuleDto>> CreateConversionRuleAsync(
        UpsertPointConversionRuleDto dto);
    Task<ApiResponse<PointConversionRuleDto>> UpdateConversionRuleAsync(
        int id, 
        UpsertPointConversionRuleDto dto);
    
    // Point to Money Conversion
    Task<ApiResponse<PointToMoneyHistoryDto>> RequestPointToMoneyConversionAsync(
        int employeeId, 
        RequestPointToMoneyDto dto);
    Task<PagedResult<PointToMoneyHistoryDto>> GetPointToMoneyHistoryAsync(
        int pageNumber,
        int pageSize,
        int? employeeId = null,
        string? status = null);
    Task<ApiResponse<PointToMoneyHistoryDto>> ProcessPointToMoneyRequestAsync(
        int requestId, 
        ProcessPointToMoneyDto dto,
        int? processorId = null);
    
    // Statistics
    Task<PointStatisticsDto> GetPointStatisticsAsync();
}