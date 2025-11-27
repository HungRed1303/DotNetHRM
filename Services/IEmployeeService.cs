using HRMApi.DTOs;

namespace HRMApi.Services;

public interface IEmployeeService
{
    // CRUD Operations
    Task<PagedResult<EmployeeListDto>> GetEmployeesAsync(
        int pageNumber,
        int pageSize,
        string? searchTerm = null,
        string? status = null,
        int? departmentId = null,
        int? roleId = null);
    
    Task<EmployeeDetailDto?> GetEmployeeByIdAsync(int id);
    
    Task<ApiResponse<EmployeeDetailDto>> CreateEmployeeAsync(CreateEmployeeDto dto);
    
    Task<ApiResponse<EmployeeDetailDto>> UpdateEmployeeAsync(int id, UpdateEmployeeDto dto);
    
    Task<ApiResponse<bool>> DeleteEmployeeAsync(int id);
    
    // Validation
    Task<bool> EmployeeExistsAsync(int id);
    Task<bool> EmailExistsAsync(string email, int? excludeEmployeeId = null);
    Task<bool> CccdExistsAsync(string cccd, int? excludeEmployeeId = null);
    Task<bool> TaxCodeExistsAsync(string taxCode, int? excludeEmployeeId = null);
    
    // Statistics
    Task<object> GetStatisticsAsync();
}