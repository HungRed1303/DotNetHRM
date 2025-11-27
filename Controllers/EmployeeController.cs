using HRMApi.DTOs;
using HRMApi.Services;
using Microsoft.AspNetCore.Mvc;

namespace HRMApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class EmployeeController : ControllerBase
{
    private readonly IEmployeeService _employeeService;
    private readonly ILogger<EmployeeController> _logger;

    public EmployeeController(
        IEmployeeService employeeService,
        ILogger<EmployeeController> logger)
    {
        _employeeService = employeeService;
        _logger = logger;
    }

    /// <summary>
    /// Lấy danh sách nhân viên với phân trang và filter
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(PagedResult<EmployeeListDto>), 200)]
    public async Task<ActionResult<PagedResult<EmployeeListDto>>> GetEmployees(
        [FromQuery] int pageNumber = 1,
        [FromQuery] int pageSize = 10,
        [FromQuery] string? searchTerm = null,
        [FromQuery] string? status = null,
        [FromQuery] int? departmentId = null,
        [FromQuery] int? roleId = null)
    {
        try
        {
            if (pageNumber < 1) pageNumber = 1;
            if (pageSize < 1 || pageSize > 100) pageSize = 10;

            var result = await _employeeService.GetEmployeesAsync(
                pageNumber, pageSize, searchTerm, status, departmentId, roleId);

            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting employees");
            return StatusCode(500, ApiResponse<object>.ErrorResponse(
                "Lỗi khi lấy danh sách nhân viên",
                new List<string> { ex.Message }));
        }
    }

    /// <summary>
    /// Lấy thông tin chi tiết nhân viên theo ID
    /// </summary>
    [HttpGet("{id}")]
    [ProducesResponseType(typeof(ApiResponse<EmployeeDetailDto>), 200)]
    [ProducesResponseType(404)]
    public async Task<ActionResult<ApiResponse<EmployeeDetailDto>>> GetEmployee(int id)
    {
        try
        {
            var employee = await _employeeService.GetEmployeeByIdAsync(id);

            if (employee == null)
            {
                return NotFound(ApiResponse<EmployeeDetailDto>.ErrorResponse(
                    "Không tìm thấy nhân viên",
                    new List<string> { $"Nhân viên với ID {id} không tồn tại" }));
            }

            return Ok(ApiResponse<EmployeeDetailDto>.SuccessResponse(
                employee,
                "Lấy thông tin nhân viên thành công"));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting employee {EmployeeId}", id);
            return StatusCode(500, ApiResponse<EmployeeDetailDto>.ErrorResponse(
                "Lỗi khi lấy thông tin nhân viên",
                new List<string> { ex.Message }));
        }
    }

    /// <summary>
    /// Tạo nhân viên mới
    /// </summary>
    [HttpPost]
    [ProducesResponseType(typeof(ApiResponse<EmployeeDetailDto>), 201)]
    [ProducesResponseType(400)]
    public async Task<ActionResult<ApiResponse<EmployeeDetailDto>>> CreateEmployee(
        [FromBody] CreateEmployeeDto dto)
    {
        try
        {
            if (!ModelState.IsValid)
            {
                var errors = ModelState.Values
                    .SelectMany(v => v.Errors)
                    .Select(e => e.ErrorMessage)
                    .ToList();

                return BadRequest(ApiResponse<EmployeeDetailDto>.ErrorResponse(
                    "Dữ liệu không hợp lệ", errors));
            }

            var result = await _employeeService.CreateEmployeeAsync(dto);

            if (!result.Success)
            {
                return BadRequest(result);
            }

            return CreatedAtAction(
                nameof(GetEmployee),
                new { id = result.Data!.Id },
                result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating employee");
            return StatusCode(500, ApiResponse<EmployeeDetailDto>.ErrorResponse(
                "Lỗi khi tạo nhân viên",
                new List<string> { ex.Message }));
        }
    }

    /// <summary>
    /// Cập nhật thông tin nhân viên
    /// </summary>
    [HttpPut("{id}")]
    [ProducesResponseType(typeof(ApiResponse<EmployeeDetailDto>), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(404)]
    public async Task<ActionResult<ApiResponse<EmployeeDetailDto>>> UpdateEmployee(
        int id,
        [FromBody] UpdateEmployeeDto dto)
    {
        try
        {
            if (!ModelState.IsValid)
            {
                var errors = ModelState.Values
                    .SelectMany(v => v.Errors)
                    .Select(e => e.ErrorMessage)
                    .ToList();

                return BadRequest(ApiResponse<EmployeeDetailDto>.ErrorResponse(
                    "Dữ liệu không hợp lệ", errors));
            }

            var result = await _employeeService.UpdateEmployeeAsync(id, dto);

            if (!result.Success)
            {
                if (result.Message.Contains("Không tìm thấy"))
                {
                    return NotFound(result);
                }
                return BadRequest(result);
            }

            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating employee {EmployeeId}", id);
            return StatusCode(500, ApiResponse<EmployeeDetailDto>.ErrorResponse(
                "Lỗi khi cập nhật nhân viên",
                new List<string> { ex.Message }));
        }
    }

    /// <summary>
    /// Xóa nhân viên (soft delete)
    /// </summary>
    [HttpDelete("{id}")]
    [ProducesResponseType(typeof(ApiResponse<bool>), 200)]
    [ProducesResponseType(404)]
    public async Task<ActionResult<ApiResponse<bool>>> DeleteEmployee(int id)
    {
        try
        {
            var result = await _employeeService.DeleteEmployeeAsync(id);

            if (!result.Success)
            {
                return NotFound(result);
            }

            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting employee {EmployeeId}", id);
            return StatusCode(500, ApiResponse<bool>.ErrorResponse(
                "Lỗi khi xóa nhân viên",
                new List<string> { ex.Message }));
        }
    }

    /// <summary>
    /// Kiểm tra email có tồn tại
    /// </summary>
    [HttpGet("check-email")]
    [ProducesResponseType(typeof(ApiResponse<bool>), 200)]
    public async Task<ActionResult<ApiResponse<bool>>> CheckEmailExists([FromQuery] string email)
    {
        try
        {
            var exists = await _employeeService.EmailExistsAsync(email);
            return Ok(ApiResponse<bool>.SuccessResponse(
                exists,
                exists ? "Email đã tồn tại" : "Email có thể sử dụng"));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error checking email");
            return StatusCode(500, ApiResponse<bool>.ErrorResponse(
                "Lỗi khi kiểm tra email",
                new List<string> { ex.Message }));
        }
    }

    /// <summary>
    /// Kiểm tra CCCD có tồn tại
    /// </summary>
    [HttpGet("check-cccd")]
    [ProducesResponseType(typeof(ApiResponse<bool>), 200)]
    public async Task<ActionResult<ApiResponse<bool>>> CheckCccdExists([FromQuery] string cccd)
    {
        try
        {
            var exists = await _employeeService.CccdExistsAsync(cccd);
            return Ok(ApiResponse<bool>.SuccessResponse(
                exists,
                exists ? "CCCD đã tồn tại" : "CCCD có thể sử dụng"));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error checking CCCD");
            return StatusCode(500, ApiResponse<bool>.ErrorResponse(
                "Lỗi khi kiểm tra CCCD",
                new List<string> { ex.Message }));
        }
    }

    /// <summary>
    /// Lấy thống kê nhân viên
    /// </summary>
    [HttpGet("statistics")]
    [ProducesResponseType(typeof(ApiResponse<object>), 200)]
    public async Task<ActionResult<ApiResponse<object>>> GetStatistics()
    {
        try
        {
            var statistics = await _employeeService.GetStatisticsAsync();

            return Ok(ApiResponse<object>.SuccessResponse(
                statistics,
                "Lấy thống kê thành công"));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting statistics");
            return StatusCode(500, ApiResponse<object>.ErrorResponse(
                "Lỗi khi lấy thống kê",
                new List<string> { ex.Message }));
        }
    }
}