using HRMApi.Models;

namespace HRMApi.Repositories;

public interface IEmployeeRepository
{
    // Basic CRUD
    Task<Employee?> GetByIdAsync(int id);
    Task<Employee?> GetByIdWithDetailsAsync(int id);
    Task<IEnumerable<Employee>> GetAllAsync();
    Task<Employee> AddAsync(Employee employee);
    Task UpdateAsync(Employee employee);
    Task DeleteAsync(int id);
    
    // Queries with filters and paging
    Task<(IEnumerable<Employee> items, int totalCount)> GetPagedAsync(
        int pageNumber,
        int pageSize,
        string? searchTerm = null,
        string? status = null,
        int? departmentId = null,
        int? roleId = null);
    
    // Check existence
    Task<bool> ExistsAsync(int id);
    Task<bool> EmailExistsAsync(string email, int? excludeEmployeeId = null);
    Task<bool> CccdExistsAsync(string cccd, int? excludeEmployeeId = null);
    Task<bool> TaxCodeExistsAsync(string taxCode, int? excludeEmployeeId = null);
    
    // Statistics
    Task<int> GetTotalCountAsync();
    Task<int> GetActiveCountAsync();
    Task<Dictionary<string, int>> GetCountByStatusAsync();
    Task<Dictionary<string, int>> GetCountByDepartmentAsync();
}