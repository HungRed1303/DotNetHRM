using HRMApi.Data;
using HRMApi.Models;
using Microsoft.EntityFrameworkCore;

namespace HRMApi.Repositories;

public class EmployeeRepository : IEmployeeRepository
{
    private readonly HrmDbContext _context;

    public EmployeeRepository(HrmDbContext context)
    {
        _context = context;
    }

    public async Task<Employee?> GetByIdAsync(int id)
    {
        return await _context.Employees.FindAsync(id);
    }

    public async Task<Employee?> GetByIdWithDetailsAsync(int id)
    {
        return await _context.Employees
            .Include(e => e.Role)
            .Include(e => e.Department)
            .FirstOrDefaultAsync(e => e.Id == id);
    }

    public async Task<IEnumerable<Employee>> GetAllAsync()
    {
        return await _context.Employees
            .Include(e => e.Role)
            .Include(e => e.Department)
            .ToListAsync();
    }

    public async Task<(IEnumerable<Employee> items, int totalCount)> GetPagedAsync(
        int pageNumber,
        int pageSize,
        string? searchTerm = null,
        string? status = null,
        int? departmentId = null,
        int? roleId = null)
    {
        var query = _context.Employees
            .Include(e => e.Role)
            .Include(e => e.Department)
            .AsQueryable();

        // Apply filters
        if (!string.IsNullOrWhiteSpace(searchTerm))
        {
            searchTerm = searchTerm.ToLower();
            query = query.Where(e =>
                e.Fullname.ToLower().Contains(searchTerm) ||
                e.Email.ToLower().Contains(searchTerm) ||
                (e.Phone != null && e.Phone.Contains(searchTerm)) ||
                e.Cccd.Contains(searchTerm));
        }

        if (!string.IsNullOrWhiteSpace(status))
        {
            query = query.Where(e => e.Status == status);
        }

        if (departmentId.HasValue)
        {
            query = query.Where(e => e.DepartmentId == departmentId.Value);
        }

        if (roleId.HasValue)
        {
            query = query.Where(e => e.RoleId == roleId.Value);
        }

        // Get total count
        var totalCount = await query.CountAsync();

        // Apply paging
        var items = await query
            .OrderBy(e => e.Id)
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return (items, totalCount);
    }

    public async Task<Employee> AddAsync(Employee employee)
    {
        await _context.Employees.AddAsync(employee);
        await _context.SaveChangesAsync();
        return employee;
    }

    public async Task UpdateAsync(Employee employee)
    {
        _context.Employees.Update(employee);
        await _context.SaveChangesAsync();
    }

    public async Task DeleteAsync(int id)
    {
        var employee = await GetByIdAsync(id);
        if (employee != null)
        {
            _context.Employees.Remove(employee);
            await _context.SaveChangesAsync();
        }
    }

    public async Task<bool> ExistsAsync(int id)
    {
        return await _context.Employees.AnyAsync(e => e.Id == id);
    }

    public async Task<bool> EmailExistsAsync(string email, int? excludeEmployeeId = null)
    {
        var query = _context.Employees.Where(e => e.Email == email);
        
        if (excludeEmployeeId.HasValue)
        {
            query = query.Where(e => e.Id != excludeEmployeeId.Value);
        }
        
        return await query.AnyAsync();
    }

    public async Task<bool> CccdExistsAsync(string cccd, int? excludeEmployeeId = null)
    {
        var query = _context.Employees.Where(e => e.Cccd == cccd);
        
        if (excludeEmployeeId.HasValue)
        {
            query = query.Where(e => e.Id != excludeEmployeeId.Value);
        }
        
        return await query.AnyAsync();
    }

    public async Task<bool> TaxCodeExistsAsync(string taxCode, int? excludeEmployeeId = null)
    {
        var query = _context.Employees.Where(e => e.TaxCode == taxCode);
        
        if (excludeEmployeeId.HasValue)
        {
            query = query.Where(e => e.Id != excludeEmployeeId.Value);
        }
        
        return await query.AnyAsync();
    }

    public async Task<int> GetTotalCountAsync()
    {
        return await _context.Employees.CountAsync();
    }

    public async Task<int> GetActiveCountAsync()
    {
        return await _context.Employees.CountAsync(e => e.Status == "active");
    }

    public async Task<Dictionary<string, int>> GetCountByStatusAsync()
    {
        return await _context.Employees
            .GroupBy(e => e.Status ?? "unknown")
            .Select(g => new { Status = g.Key, Count = g.Count() })
            .ToDictionaryAsync(x => x.Status, x => x.Count);
    }

    public async Task<Dictionary<string, int>> GetCountByDepartmentAsync()
    {
        return await _context.Employees
            .Include(e => e.Department)
            .GroupBy(e => e.Department != null ? e.Department.Name : "No Department")
            .Select(g => new { Department = g.Key, Count = g.Count() })
            .ToDictionaryAsync(x => x.Department, x => x.Count);
    }
}