using HRMApi.DTOs;
using HRMApi.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;

namespace HRMApi.Controllers;

[ApiController]
[Route("api/v1/[controller]")]
public class DepartmentController : ControllerBase
{
    private readonly IDepartmentService _departmentService;
    private readonly ILogger<DepartmentController> _logger;

    public DepartmentController(
        IDepartmentService departmentService,
        ILogger<DepartmentController> logger)
    {
        _departmentService = departmentService;
        _logger = logger;
    }

    /// <summary>
    /// Lấy danh sách tất cả phòng ban
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(ApiResponse<List<DepartmentDto>>), 200)]
    public async Task<ActionResult<ApiResponse<List<DepartmentDto>>>> GetAllDepartments()
    {
        try
        {
            var departments = await _departmentService.GetAllDepartmentsAsync();

            return Ok(ApiResponse<List<DepartmentDto>>.SuccessResponse(
                departments,
                "Lấy danh sách phòng ban thành công"));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting departments");
            return StatusCode(500, ApiResponse<List<DepartmentDto>>.ErrorResponse(
                "Lỗi khi lấy danh sách phòng ban",
                new List<string> { ex.Message }));
        }
    }

    /// <summary>
    /// Lấy thông tin chi tiết phòng ban theo ID
    /// </summary>
    [HttpGet("{id}")]
    [ProducesResponseType(typeof(ApiResponse<DepartmentDto>), 200)]
    [ProducesResponseType(404)]
    public async Task<ActionResult<ApiResponse<DepartmentDto>>> GetDepartment(int id)
    {
        try
        {
            var department = await _departmentService.GetDepartmentByIdAsync(id);

            if (department == null)
            {
                return NotFound(ApiResponse<DepartmentDto>.ErrorResponse(
                    "Không tìm thấy phòng ban",
                    new List<string> { $"Phòng ban với ID {id} không tồn tại" }));
            }

            return Ok(ApiResponse<DepartmentDto>.SuccessResponse(
                department,
                "Lấy thông tin phòng ban thành công"));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting department {DepartmentId}", id);
            return StatusCode(500, ApiResponse<DepartmentDto>.ErrorResponse(
                "Lỗi khi lấy thông tin phòng ban",
                new List<string> { ex.Message }));
        }
    }

    /// <summary>
    /// Tạo phòng ban mới
    /// </summary>
    [HttpPost]
    [ProducesResponseType(typeof(ApiResponse<DepartmentDto>), 201)]
    [ProducesResponseType(400)]
    [Authorize(Policy = "department:create")]
    public async Task<ActionResult<ApiResponse<DepartmentDto>>> CreateDepartment(
        [FromBody] CreateDepartmentDto dto)
    {
        try
        {
            if (!ModelState.IsValid)
            {
                var errors = ModelState.Values
                    .SelectMany(v => v.Errors)
                    .Select(e => e.ErrorMessage)
                    .ToList();

                return BadRequest(ApiResponse<DepartmentDto>.ErrorResponse(
                    "Dữ liệu không hợp lệ", errors));
            }

            var result = await _departmentService.CreateDepartmentAsync(dto);

            if (!result.Success)
            {
                return BadRequest(result);
            }

            return CreatedAtAction(
                nameof(GetDepartment),
                new { id = result.Data!.Id },
                result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating department");
            return StatusCode(500, ApiResponse<DepartmentDto>.ErrorResponse(
                "Lỗi khi tạo phòng ban",
                new List<string> { ex.Message }));
        }
    }

    /// <summary>
    /// Cập nhật thông tin phòng ban
    /// </summary>
    [HttpPut("{id}")]
    [ProducesResponseType(typeof(ApiResponse<DepartmentDto>), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(404)]
    [Authorize(Policy = "department:update")]
    public async Task<ActionResult<ApiResponse<DepartmentDto>>> UpdateDepartment(
        int id,
        [FromBody] UpdateDepartmentDto dto)
    {
        try
        {
            if (!ModelState.IsValid)
            {
                var errors = ModelState.Values
                    .SelectMany(v => v.Errors)
                    .Select(e => e.ErrorMessage)
                    .ToList();

                return BadRequest(ApiResponse<DepartmentDto>.ErrorResponse(
                    "Dữ liệu không hợp lệ", errors));
            }

            var result = await _departmentService.UpdateDepartmentAsync(id, dto);

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
            _logger.LogError(ex, "Error updating department {DepartmentId}", id);
            return StatusCode(500, ApiResponse<DepartmentDto>.ErrorResponse(
                "Lỗi khi cập nhật phòng ban",
                new List<string> { ex.Message }));
        }
    }

    /// <summary>
    /// Xóa phòng ban
    /// </summary>
    [HttpDelete("{id}")]
    [ProducesResponseType(typeof(ApiResponse<bool>), 200)]
    [ProducesResponseType(404)]
    [Authorize(Policy = "department:delete")]
    public async Task<ActionResult<ApiResponse<bool>>> DeleteDepartment(int id)
    {
        try
        {
            var result = await _departmentService.DeleteDepartmentAsync(id);

            if (!result.Success)
            {
                return NotFound(result);
            }

            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting department {DepartmentId}", id);
            return StatusCode(500, ApiResponse<bool>.ErrorResponse(
                "Lỗi khi xóa phòng ban",
                new List<string> { ex.Message }));
        }
    }
}