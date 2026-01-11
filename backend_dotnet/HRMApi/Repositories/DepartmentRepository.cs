using HRMApi.Data;
using HRMApi.Models;
using Microsoft.EntityFrameworkCore;

namespace HRMApi.Repositories;

public interface IDepartmentRepository
{
    Task<Department?> GetByIdAsync(int id);
    Task<IEnumerable<Department>> GetAllAsync();
    Task<Department> AddAsync(Department department);
    Task UpdateAsync(Department department);
    Task DeleteAsync(int id);
    Task<bool> ExistsAsync(int id);
    Task<bool> NameExistsAsync(string name, int? excludeDepartmentId = null);
    Task<int> GetEmployeeCountAsync(int departmentId);
}

public class DepartmentRepository : IDepartmentRepository
{
    private readonly HrmDbContext _context;

    public DepartmentRepository(HrmDbContext context)
    {
        _context = context;
    }

    public async Task<Department?> GetByIdAsync(int id)
    {
        return await _context.Departments
            .Include(d => d.Manager)
            .Include(d => d.Employees)
            .FirstOrDefaultAsync(d => d.Id == id);
    }

    public async Task<IEnumerable<Department>> GetAllAsync()
    {
        return await _context.Departments
            .Include(d => d.Manager)
            .Include(d => d.Employees)
            .OrderBy(d => d.Name)
            .ToListAsync();
    }

    public async Task<Department> AddAsync(Department department)
    {
        await _context.Departments.AddAsync(department);
        await _context.SaveChangesAsync();
        return department;
    }

    public async Task UpdateAsync(Department department)
    {
        _context.Departments.Update(department);
        await _context.SaveChangesAsync();
    }

    public async Task DeleteAsync(int id)
    {
        var department = await GetByIdAsync(id);
        if (department != null)
        {
            _context.Departments.Remove(department);
            await _context.SaveChangesAsync();
        }
    }

    public async Task<bool> ExistsAsync(int id)
    {
        return await _context.Departments.AnyAsync(d => d.Id == id);
    }

    public async Task<bool> NameExistsAsync(string name, int? excludeDepartmentId = null)
    {
        var query = _context.Departments.Where(d => d.Name == name);
        
        if (excludeDepartmentId.HasValue)
        {
            query = query.Where(d => d.Id != excludeDepartmentId.Value);
        }
        
        return await query.AnyAsync();
    }

    public async Task<int> GetEmployeeCountAsync(int departmentId)
    {
        return await _context.Employees
            .CountAsync(e => e.DepartmentId == departmentId && e.Status == "active");
    }
}