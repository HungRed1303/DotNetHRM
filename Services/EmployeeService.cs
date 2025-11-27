using AutoMapper;
using HRMApi.Data;
using HRMApi.DTOs;
using HRMApi.Models;
using HRMApi.Repositories;

namespace HRMApi.Services;

public class EmployeeService : IEmployeeService
{
    private readonly IEmployeeRepository _employeeRepository;
    private readonly HrmDbContext _context;
    private readonly IMapper _mapper;
    private readonly ILogger<EmployeeService> _logger;

    public EmployeeService(
        IEmployeeRepository employeeRepository,
        HrmDbContext context,
        IMapper mapper,
        ILogger<EmployeeService> logger)
    {
        _employeeRepository = employeeRepository;
        _context = context;
        _mapper = mapper;
        _logger = logger;
    }

    public async Task<PagedResult<EmployeeListDto>> GetEmployeesAsync(
        int pageNumber,
        int pageSize,
        string? searchTerm = null,
        string? status = null,
        int? departmentId = null,
        int? roleId = null)
    {
        try
        {
            var (items, totalCount) = await _employeeRepository.GetPagedAsync(
                pageNumber, pageSize, searchTerm, status, departmentId, roleId);

            var employeeDtos = _mapper.Map<List<EmployeeListDto>>(items);

            return new PagedResult<EmployeeListDto>
            {
                Items = employeeDtos,
                TotalCount = totalCount,
                PageNumber = pageNumber,
                PageSize = pageSize
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting employees list");
            throw;
        }
    }

    public async Task<EmployeeDetailDto?> GetEmployeeByIdAsync(int id)
    {
        try
        {
            var employee = await _employeeRepository.GetByIdWithDetailsAsync(id);
            
            if (employee == null)
                return null;

            return _mapper.Map<EmployeeDetailDto>(employee);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting employee {EmployeeId}", id);
            throw;
        }
    }

    public async Task<ApiResponse<EmployeeDetailDto>> CreateEmployeeAsync(CreateEmployeeDto dto)
    {
        try
        {
            // Validate email
            if (await EmailExistsAsync(dto.Email))
            {
                return ApiResponse<EmployeeDetailDto>.ErrorResponse(
                    "Email đã tồn tại trong hệ thống",
                    new List<string> { "Email này đã được sử dụng" });
            }

            // Validate CCCD
            if (await CccdExistsAsync(dto.Cccd))
            {
                return ApiResponse<EmployeeDetailDto>.ErrorResponse(
                    "CCCD đã tồn tại trong hệ thống",
                    new List<string> { "CCCD này đã được sử dụng" });
            }

            // Validate TaxCode if provided
            if (!string.IsNullOrEmpty(dto.TaxCode) && await TaxCodeExistsAsync(dto.TaxCode))
            {
                return ApiResponse<EmployeeDetailDto>.ErrorResponse(
                    "Mã số thuế đã tồn tại trong hệ thống",
                    new List<string> { "Mã số thuế này đã được sử dụng" });
            }

            // Nếu không truyền RoleId hoặc RoleId = 0, set mặc định là 4 (employee)
            if (dto.RoleId == 0)
            {
                dto.RoleId = 4;
            }

            // Validate Role exists
            var roleExists = await _context.Roles.FindAsync(dto.RoleId);
            if (roleExists == null)
            {
                return ApiResponse<EmployeeDetailDto>.ErrorResponse(
                    "Role không tồn tại",
                    new List<string> { $"Role với ID {dto.RoleId} không tồn tại trong hệ thống" });
            }

            // Validate Department exists (if provided)
            if (dto.DepartmentId.HasValue)
            {
                var deptExists = await _context.Departments.FindAsync(dto.DepartmentId.Value);
                if (deptExists == null)
                {
                    return ApiResponse<EmployeeDetailDto>.ErrorResponse(
                        "Phòng ban không tồn tại",
                        new List<string> { $"Phòng ban với ID {dto.DepartmentId} không tồn tại" });
                }
            }

            // Map DTO to Entity
            var employee = _mapper.Map<Employee>(dto);
            employee.Status = "active";
            employee.CreatedAt = DateTime.UtcNow;
            employee.UpdatedAt = DateTime.UtcNow;

            // Begin transaction
            await using var transaction = await _context.Database.BeginTransactionAsync();
            
            try
            {
                // Add employee
                var createdEmployee = await _employeeRepository.AddAsync(employee);

                // Create Point record for new employee
                var point = new Point
                {
                    EmployeeId = createdEmployee.Id,
                    PointTotal = 0,
                    LastUpdate = DateTime.UtcNow
                };
                await _context.Points.AddAsync(point);
                await _context.SaveChangesAsync();

                await transaction.CommitAsync();

                // Get employee with details
                var employeeWithDetails = await _employeeRepository.GetByIdWithDetailsAsync(createdEmployee.Id);
                var employeeDto = _mapper.Map<EmployeeDetailDto>(employeeWithDetails);

                return ApiResponse<EmployeeDetailDto>.SuccessResponse(
                    employeeDto,
                    "Tạo nhân viên thành công");
            }
            catch
            {
                await transaction.RollbackAsync();
                throw;
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating employee");
            return ApiResponse<EmployeeDetailDto>.ErrorResponse(
                "Lỗi khi tạo nhân viên",
                new List<string> { ex.Message });
        }
    }

    public async Task<ApiResponse<EmployeeDetailDto>> UpdateEmployeeAsync(int id, UpdateEmployeeDto dto)
    {
        try
        {
            var employee = await _employeeRepository.GetByIdAsync(id);
            
            if (employee == null)
            {
                return ApiResponse<EmployeeDetailDto>.ErrorResponse(
                    "Không tìm thấy nhân viên",
                    new List<string> { $"Nhân viên với ID {id} không tồn tại" });
            }

            // Validate Department exists (if provided)
            if (dto.DepartmentId.HasValue)
            {
                var deptExists = await _context.Departments.FindAsync(dto.DepartmentId.Value);
                if (deptExists == null)
                {
                    return ApiResponse<EmployeeDetailDto>.ErrorResponse(
                        "Phòng ban không tồn tại",
                        new List<string> { $"Phòng ban với ID {dto.DepartmentId} không tồn tại" });
                }
            }

            // Map updates
            _mapper.Map(dto, employee);
            employee.UpdatedAt = DateTime.UtcNow;

            await _employeeRepository.UpdateAsync(employee);

            // Get updated employee with details
            var updatedEmployee = await _employeeRepository.GetByIdWithDetailsAsync(id);
            var employeeDto = _mapper.Map<EmployeeDetailDto>(updatedEmployee);

            return ApiResponse<EmployeeDetailDto>.SuccessResponse(
                employeeDto,
                "Cập nhật nhân viên thành công");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating employee {EmployeeId}", id);
            return ApiResponse<EmployeeDetailDto>.ErrorResponse(
                "Lỗi khi cập nhật nhân viên",
                new List<string> { ex.Message });
        }
    }

    public async Task<ApiResponse<bool>> DeleteEmployeeAsync(int id)
    {
        try
        {
            var employee = await _employeeRepository.GetByIdAsync(id);
            
            if (employee == null)
            {
                return ApiResponse<bool>.ErrorResponse(
                    "Không tìm thấy nhân viên",
                    new List<string> { $"Nhân viên với ID {id} không tồn tại" });
            }

            // Soft delete: update status to inactive
            employee.Status = "inactive";
            employee.UpdatedAt = DateTime.UtcNow;
            await _employeeRepository.UpdateAsync(employee);

            // For hard delete, use:
            // await _employeeRepository.DeleteAsync(id);

            return ApiResponse<bool>.SuccessResponse(true, "Xóa nhân viên thành công");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting employee {EmployeeId}", id);
            return ApiResponse<bool>.ErrorResponse(
                "Lỗi khi xóa nhân viên",
                new List<string> { ex.Message });
        }
    }

    public async Task<bool> EmployeeExistsAsync(int id)
    {
        return await _employeeRepository.ExistsAsync(id);
    }

    public async Task<bool> EmailExistsAsync(string email, int? excludeEmployeeId = null)
    {
        return await _employeeRepository.EmailExistsAsync(email, excludeEmployeeId);
    }

    public async Task<bool> CccdExistsAsync(string cccd, int? excludeEmployeeId = null)
    {
        return await _employeeRepository.CccdExistsAsync(cccd, excludeEmployeeId);
    }

    public async Task<bool> TaxCodeExistsAsync(string taxCode, int? excludeEmployeeId = null)
    {
        return await _employeeRepository.TaxCodeExistsAsync(taxCode, excludeEmployeeId);
    }

    public async Task<object> GetStatisticsAsync()
    {
        try
        {
            var totalCount = await _employeeRepository.GetTotalCountAsync();
            var activeCount = await _employeeRepository.GetActiveCountAsync();
            var countByStatus = await _employeeRepository.GetCountByStatusAsync();
            var countByDepartment = await _employeeRepository.GetCountByDepartmentAsync();

            return new
            {
                TotalEmployees = totalCount,
                ActiveEmployees = activeCount,
                InactiveEmployees = totalCount - activeCount,
                ByStatus = countByStatus,
                ByDepartment = countByDepartment
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting statistics");
            throw;
        }
    }
}