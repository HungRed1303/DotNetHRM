using HRMApi.DTOs;
using HRMApi.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HRMApi.Controllers;

[ApiController]
[Route("api/v1/[controller]")]

public class ParticipationController : ControllerBase
{
    private readonly IParticipationService _participationService;
    private readonly ILogger<ParticipationController> _logger;

    public ParticipationController(
        IParticipationService participationService,
        ILogger<ParticipationController> logger)
    {
        _participationService = participationService;
        _logger = logger;
    }

    [HttpGet("employee/{employeeId}")]
    [ProducesResponseType(typeof(ApiResponse<IEnumerable<ParticipationDto>>), 200)]
    [ProducesResponseType(404)]
    [Authorize(Policy = "participate:list")]
    public async Task<ActionResult<ApiResponse<IEnumerable<ParticipationDto>>>> GetActivityParticipation(int employeeId)
    {
        try
        {
            var result = await _participationService.GetActivityParticipationAsync(employeeId);

            if (!result.Success)
            {
                return NotFound(result);
            }

            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting employee participation infomation of {EmployeeId}", employeeId);
            return StatusCode(500, ApiResponse<EmployeePointDto>.ErrorResponse(
                "Lỗi khi lấy thông tin tham gia hoạt động",
                new List<string> { ex.Message }));
        }
    }

    [HttpGet("activity/{activityId}")]
    [ProducesResponseType(typeof(PagedResult<ParticipationDto>), 200)]
    [ProducesResponseType(404)]
    [Authorize(Policy = "participate:list")]
    public async Task<ActionResult<ApiResponse<IEnumerable<ParticipationDto>>>> GetEmployeeParticipation(int activityId)
    {
        try
        {
            var result = await _participationService.GetEmployeeParticipationAsync(activityId);

            if (!result.Success)
            {
                return NotFound(result);
            }

            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting employee participated the activity");
            return StatusCode(500, ApiResponse<EmployeePointDto>.ErrorResponse(
                "Lỗi khi lấy các nhân viên tham gia hoạt động",
                new List<string> { ex.Message }));
        }
    }

    [HttpGet("{activityId}-{employeeId}")]
    [ProducesResponseType(typeof(ApiResponse<ParticipationDto>), 200)]
    [ProducesResponseType(404)]
    [Authorize(Policy = "participate:view")]
    public async Task<ActionResult<ApiResponse<ParticipationDto>>> GetParticipation(int activityId, int employeeId)
    {
        try
        {
            var result = await _participationService.GetParticipationAsync(activityId, employeeId);

            if (!result.Success)
            {
                return NotFound(result);
            }

            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting employee participation infomation of {EmployeeId}", employeeId);
            return StatusCode(500, ApiResponse<ParticipationDto>.ErrorResponse(
                "Lỗi khi lấy các nhân viên tham gia hoạt động",
                new List<string> { ex.Message }));
        }
    }

    [HttpGet]
    [ProducesResponseType(typeof(PagedResult<ParticipationDto>), 200)]
    [ProducesResponseType(404)]
    [Authorize(Policy = "participate:list")]
    public async Task<ActionResult<ApiResponse<ParticipationDto>>> GetAllParticipation(
        [FromQuery] int pageNumber = 1,
        [FromQuery] int pageSize = 10,
        [FromQuery] string? searchTerm = null)
    {
        try
        {
            if (pageNumber < 1) pageNumber = 1;
            if (pageSize < 1 || pageSize > 100) pageSize = 10;

            var result = await _participationService.GetAllParticipationsAsync(
                pageNumber, pageSize, searchTerm);

            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting all paticipations");
            return StatusCode(500, ApiResponse<object>.ErrorResponse(
                "Lỗi khi lấy danh sách tham gia",
                new List<string> { ex.Message }));
        }
    }

    /// <summary>
    /// Update participation result
    /// </summary>
    [HttpPut("{activityId}-{employeeId}/result")]
    [ProducesResponseType(typeof(ApiResponse<ParticipationDto>), 200)]
    [ProducesResponseType(404)]
    [Authorize(Policy = "participate:update")]
    public async Task<ActionResult<ApiResponse<ParticipationDto>>> UpdateParticipationResult(
        int activityId, 
        int employeeId,
        [FromBody] UpdateParticipationResultDto dto)
    {
        try
        {
            var result = await _participationService.UpdateParticipationResultAsync(
                activityId, employeeId, dto);

            if (!result.Success)
            {
                return NotFound(result);
            }

            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating participation result");
            return StatusCode(500, ApiResponse<ParticipationDto>.ErrorResponse(
                "Lỗi khi cập nhật kết quả tham gia",
                new List<string> { ex.Message }));
        }
    }

    /// <summary>
    /// Get participation results by activity type
    /// </summary>
    [HttpGet("results/by-type/{activityType}")]
    [ProducesResponseType(typeof(ApiResponse<List<ParticipationDto>>), 200)]
    [Authorize(Policy = "participate:list")]
    public async Task<ActionResult<ApiResponse<List<ParticipationDto>>>> GetResultsByActivityType(
        string activityType)
    {
        try
        {
            var result = await _participationService.GetResultsByActivityTypeAsync(activityType);

            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting results by activity type");
            return StatusCode(500, ApiResponse<List<ParticipationDto>>.ErrorResponse(
                "Lỗi khi lấy kết quả theo loại hoạt động",
                new List<string> { ex.Message }));
        }
    }

    /// <summary>
    /// Điểm danh cho nhân viên tham gia hoạt động
    /// </summary>
    [HttpPut("{activityId}-{employeeId}/attendance")]
    [ProducesResponseType(typeof(ApiResponse<ParticipationDto>), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(404)]
    [Authorize(Policy = "participate:attendance")]
    public async Task<ActionResult<ApiResponse<ParticipationDto>>> UpdateAttendanceStatus(
        int activityId, 
        int employeeId,
        [FromBody] UpdateAttendanceStatusDto dto)
    {
        try
        {
            if (!ModelState.IsValid)
            {
                var errors = ModelState.Values
                    .SelectMany(v => v.Errors)
                    .Select(e => e.ErrorMessage)
                    .ToList();

                return BadRequest(ApiResponse<ParticipationDto>.ErrorResponse(
                    "Dữ liệu không hợp lệ", errors));
            }

            var result = await _participationService.UpdateAttendanceStatusAsync(
                activityId, employeeId, dto);

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
            _logger.LogError(ex, "Error updating attendance status");
            return StatusCode(500, ApiResponse<ParticipationDto>.ErrorResponse(
                "Lỗi khi điểm danh",
                new List<string> { ex.Message }));
        }
    }

    /// <summary>
    /// Điểm danh hàng loạt cho nhiều nhân viên
    /// </summary>
    [HttpPut("activity/{activityId}/batch-attendance")]
    [ProducesResponseType(typeof(ApiResponse<BatchAttendanceResultDto>), 200)]
    [Authorize(Policy = "participate:attendance")]
    public async Task<ActionResult<ApiResponse<BatchAttendanceResultDto>>> BatchUpdateAttendance(
        int activityId,
        [FromBody] BatchUpdateAttendanceDto dto)
    {
        try
        {
            if (!ModelState.IsValid)
            {
                var modelErrors = ModelState.Values
                    .SelectMany(v => v.Errors)
                    .Select(e => e.ErrorMessage)
                    .ToList();

                return BadRequest(ApiResponse<BatchAttendanceResultDto>.ErrorResponse(
                    "Dữ liệu không hợp lệ", modelErrors));
            }

            int successCount = 0;
            int failCount = 0;
            var attendanceErrors = new List<string>();

            foreach (var item in dto.Attendances)
            {
                var updateDto = new UpdateAttendanceStatusDto 
                { 
                    Status = item.Status,
                    Note = item.Note 
                };

                var result = await _participationService.UpdateAttendanceStatusAsync(
                    activityId, item.EmployeeId, updateDto);

                if (result.Success)
                {
                    successCount++;
                }
                else
                {
                    failCount++;
                    attendanceErrors.Add($"Employee {item.EmployeeId}: {result.Message}");
                }
            }

            var resultData = new BatchAttendanceResultDto
            {
                SuccessCount = successCount,
                FailCount = failCount,
                Errors = attendanceErrors
            };

            return Ok(ApiResponse<BatchAttendanceResultDto>.SuccessResponse(
                resultData,
                $"Điểm danh hoàn tất: {successCount} thành công, {failCount} thất bại"));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error batch updating attendance");
            return StatusCode(500, ApiResponse<BatchAttendanceResultDto>.ErrorResponse(
                "Lỗi khi điểm danh hàng loạt",
                new List<string> { ex.Message }));
        }
    }
}