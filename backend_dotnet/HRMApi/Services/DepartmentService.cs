using AutoMapper;
using HRMApi.Data;
using HRMApi.DTOs;
using HRMApi.Models;
using HRMApi.Repositories;

namespace HRMApi.Services;

public interface IDepartmentService
{
    Task<List<DepartmentDto>> GetAllDepartmentsAsync();
    Task<DepartmentDto?> GetDepartmentByIdAsync(int id);
    Task<ApiResponse<DepartmentDto>> CreateDepartmentAsync(CreateDepartmentDto dto);
    Task<ApiResponse<DepartmentDto>> UpdateDepartmentAsync(int id, UpdateDepartmentDto dto);
    Task<ApiResponse<bool>> DeleteDepartmentAsync(int id);
}

public class DepartmentService : IDepartmentService
{
    private readonly IDepartmentRepository _departmentRepository;
    private readonly HrmDbContext _context;
    private readonly IMapper _mapper;
    private readonly ILogger<DepartmentService> _logger;

    public DepartmentService(
        IDepartmentRepository departmentRepository,
        HrmDbContext context,
        IMapper mapper,
        ILogger<DepartmentService> logger)
    {
        _departmentRepository = departmentRepository;
        _context = context;
        _mapper = mapper;
        _logger = logger;
    }

    public async Task<List<DepartmentDto>> GetAllDepartmentsAsync()
    {
        try
        {
            var departments = await _departmentRepository.GetAllAsync();
            var departmentDtos = new List<DepartmentDto>();

            foreach (var dept in departments)
            {
                var employeeCount = await _departmentRepository.GetEmployeeCountAsync(dept.Id);
                
                departmentDtos.Add(new DepartmentDto
                {
                    Id = dept.Id,
                    Name = dept.Name,
                    ManagerId = dept.ManagerId,
                    ManagerName = dept.Manager?.Fullname,
                    EmployeeCount = employeeCount,
                    CreatedAt = dept.CreatedAt,
                    UpdatedAt = dept.UpdatedAt
                });
            }

            return departmentDtos;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting all departments");
            throw;
        }
    }

    public async Task<DepartmentDto?> GetDepartmentByIdAsync(int id)
    {
        try
        {
            var department = await _departmentRepository.GetByIdAsync(id);

            if (department == null)
                return null;

            var employeeCount = await _departmentRepository.GetEmployeeCountAsync(id);

            return new DepartmentDto
            {
                Id = department.Id,
                Name = department.Name,
                ManagerId = department.ManagerId,
                ManagerName = department.Manager?.Fullname,
                EmployeeCount = employeeCount,
                CreatedAt = department.CreatedAt,
                UpdatedAt = department.UpdatedAt
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting department {DepartmentId}", id);
            throw;
        }
    }

    public async Task<ApiResponse<DepartmentDto>> CreateDepartmentAsync(CreateDepartmentDto dto)
    {
        try
        {
            // Validate name uniqueness
            if (await _departmentRepository.NameExistsAsync(dto.Name))
            {
                return ApiResponse<DepartmentDto>.ErrorResponse(
                    "Tên phòng ban đã tồn tại",
                    new List<string> { "Tên phòng ban này đã được sử dụng" });
            }

            // Validate manager exists if provided
            if (dto.ManagerId.HasValue)
            {
                var managerExists = await _context.Employees.FindAsync(dto.ManagerId.Value);
                if (managerExists == null)
                {
                    return ApiResponse<DepartmentDto>.ErrorResponse(
                        "Trưởng phòng không tồn tại",
                        new List<string> { $"Nhân viên với ID {dto.ManagerId} không tồn tại" });
                }
            }

            var department = new Department
            {
                Name = dto.Name,
                ManagerId = dto.ManagerId,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            var createdDepartment = await _departmentRepository.AddAsync(department);

            var departmentDto = await GetDepartmentByIdAsync(createdDepartment.Id);

            return ApiResponse<DepartmentDto>.SuccessResponse(
                departmentDto!,
                "Tạo phòng ban thành công");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating department");
            return ApiResponse<DepartmentDto>.ErrorResponse(
                "Lỗi khi tạo phòng ban",
                new List<string> { ex.Message });
        }
    }

    public async Task<ApiResponse<DepartmentDto>> UpdateDepartmentAsync(int id, UpdateDepartmentDto dto)
    {
        try
        {
            var department = await _departmentRepository.GetByIdAsync(id);

            if (department == null)
            {
                return ApiResponse<DepartmentDto>.ErrorResponse(
                    "Không tìm thấy phòng ban",
                    new List<string> { $"Phòng ban với ID {id} không tồn tại" });
            }

            // Validate name uniqueness
            if (await _departmentRepository.NameExistsAsync(dto.Name, id))
            {
                return ApiResponse<DepartmentDto>.ErrorResponse(
                    "Tên phòng ban đã tồn tại",
                    new List<string> { "Tên phòng ban này đã được sử dụng" });
            }

            // Validate manager exists if provided
            if (dto.ManagerId.HasValue)
            {
                var managerExists = await _context.Employees.FindAsync(dto.ManagerId.Value);
                if (managerExists == null)
                {
                    return ApiResponse<DepartmentDto>.ErrorResponse(
                        "Trưởng phòng không tồn tại",
                        new List<string> { $"Nhân viên với ID {dto.ManagerId} không tồn tại" });
                }
            }

            department.Name = dto.Name;
            department.ManagerId = dto.ManagerId;
            department.UpdatedAt = DateTime.UtcNow;

            await _departmentRepository.UpdateAsync(department);

            var departmentDto = await GetDepartmentByIdAsync(id);

            return ApiResponse<DepartmentDto>.SuccessResponse(
                departmentDto!,
                "Cập nhật phòng ban thành công");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating department {DepartmentId}", id);
            return ApiResponse<DepartmentDto>.ErrorResponse(
                "Lỗi khi cập nhật phòng ban",
                new List<string> { ex.Message });
        }
    }

    public async Task<ApiResponse<bool>> DeleteDepartmentAsync(int id)
    {
        try
        {
            var department = await _departmentRepository.GetByIdAsync(id);

            if (department == null)
            {
                return ApiResponse<bool>.ErrorResponse(
                    "Không tìm thấy phòng ban",
                    new List<string> { $"Phòng ban với ID {id} không tồn tại" });
            }

            // Check if department has employees
            var employeeCount = await _departmentRepository.GetEmployeeCountAsync(id);
            if (employeeCount > 0)
            {
                return ApiResponse<bool>.ErrorResponse(
                    "Không thể xóa phòng ban",
                    new List<string> { "Phòng ban còn nhân viên, không thể xóa" });
            }

            await _departmentRepository.DeleteAsync(id);

            return ApiResponse<bool>.SuccessResponse(true, "Xóa phòng ban thành công");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting department {DepartmentId}", id);
            return ApiResponse<bool>.ErrorResponse(
                "Lỗi khi xóa phòng ban",
                new List<string> { ex.Message });
        }
    }
}