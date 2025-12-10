using HRMApi.DTOs;
using HRMApi.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HRMApi.Controllers;

[ApiController]
[Route("api/v1/[controller]")]
public class PointController : ControllerBase
{
    private readonly IPointService _pointService;
    private readonly ILogger<PointController> _logger;

    public PointController(
        IPointService pointService,
        ILogger<PointController> logger)
    {
        _pointService = pointService;
        _logger = logger;
    }

    // ============================================
    // ĐIỂM THƯỞNG - EMPLOYEE POINTS
    // ============================================

    /// <summary>
    /// Lấy thông tin điểm thưởng của nhân viên
    /// </summary>
    [HttpGet("employee/{employeeId}")]
    [ProducesResponseType(typeof(ApiResponse<EmployeePointDto>), 200)]
    [ProducesResponseType(404)]
    [Authorize(Policy = "point:view")]
    public async Task<ActionResult<ApiResponse<EmployeePointDto>>> GetEmployeePoint(int employeeId)
    {
        try
        {
            var result = await _pointService.GetEmployeePointAsync(employeeId);

            if (!result.Success)
            {
                return NotFound(result);
            }

            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting point for employee {EmployeeId}", employeeId);
            return StatusCode(500, ApiResponse<EmployeePointDto>.ErrorResponse(
                "Lỗi khi lấy thông tin điểm",
                new List<string> { ex.Message }));
        }
    }

    /// <summary>
    /// Lấy danh sách điểm thưởng của tất cả nhân viên
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(PagedResult<EmployeePointDto>), 200)]
    [Authorize(Policy = "point:list")]
    public async Task<ActionResult<PagedResult<EmployeePointDto>>> GetAllEmployeePoints(
        [FromQuery] int pageNumber = 1,
        [FromQuery] int pageSize = 10,
        [FromQuery] string? searchTerm = null)
    {
        try
        {
            if (pageNumber < 1) pageNumber = 1;
            if (pageSize < 1 || pageSize > 100) pageSize = 10;

            var result = await _pointService.GetAllEmployeePointsAsync(
                pageNumber, pageSize, searchTerm);

            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting all employee points");
            return StatusCode(500, ApiResponse<object>.ErrorResponse(
                "Lỗi khi lấy danh sách điểm",
                new List<string> { ex.Message }));
        }
    }

    /// <summary>
    /// Cập nhật điểm thưởng cho nhân viên
    /// </summary>
    [HttpPut("employee/{employeeId}")]
    [ProducesResponseType(typeof(ApiResponse<EmployeePointDto>), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(404)]
    [Authorize(Policy = "point:update")]
    public async Task<ActionResult<ApiResponse<EmployeePointDto>>> UpdateEmployeePoint(
        int employeeId,
        [FromBody] UpdatePointDto dto)
    {
        try
        {
            if (!ModelState.IsValid)
            {
                var errors = ModelState.Values
                    .SelectMany(v => v.Errors)
                    .Select(e => e.ErrorMessage)
                    .ToList();

                return BadRequest(ApiResponse<EmployeePointDto>.ErrorResponse(
                    "Dữ liệu không hợp lệ", errors));
            }

            var result = await _pointService.UpdateEmployeePointAsync(employeeId, dto);

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
            _logger.LogError(ex, "Error updating point for employee {EmployeeId}", employeeId);
            return StatusCode(500, ApiResponse<EmployeePointDto>.ErrorResponse(
                "Lỗi khi cập nhật điểm",
                new List<string> { ex.Message }));
        }
    }

    // ============================================
    // LỊCH SỬ GIAO DỊCH ĐIỂM - POINT TRANSACTIONS
    // ============================================

    /// <summary>
    /// Lấy lịch sử giao dịch điểm với filter và phân trang
    /// </summary>
    [HttpGet("transactions")]
    [ProducesResponseType(typeof(PagedResult<PointTransactionDto>), 200)]
    [Authorize(Policy = "point:view")]
    public async Task<ActionResult<PagedResult<PointTransactionDto>>> GetPointTransactions(
        [FromQuery] int pageNumber = 1,
        [FromQuery] int pageSize = 10,
        [FromQuery] int? employeeId = null,
        [FromQuery] string? type = null,
        [FromQuery] DateTime? fromDate = null,
        [FromQuery] DateTime? toDate = null)
    {
        try
        {
            if (pageNumber < 1) pageNumber = 1;
            if (pageSize < 1 || pageSize > 100) pageSize = 10;

            var result = await _pointService.GetPointTransactionsAsync(
                pageNumber, pageSize, employeeId, type, fromDate, toDate);

            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting point transactions");
            return StatusCode(500, ApiResponse<object>.ErrorResponse(
                "Lỗi khi lấy lịch sử giao dịch",
                new List<string> { ex.Message }));
        }
    }

    /// <summary>
    /// Lấy lịch sử giao dịch điểm của nhân viên
    /// </summary>
    [HttpGet("transactions/employee/{employeeId}")]
    [ProducesResponseType(typeof(ApiResponse<List<PointTransactionDto>>), 200)]
    public async Task<ActionResult<ApiResponse<List<PointTransactionDto>>>> GetEmployeeTransactionHistory(
        int employeeId,
        [FromQuery] int? limit = null)
    {
        try
        {
            var transactions = await _pointService.GetEmployeeTransactionHistoryAsync(
                employeeId, limit);

            return Ok(ApiResponse<List<PointTransactionDto>>.SuccessResponse(
                transactions,
                "Lấy lịch sử giao dịch thành công"));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting transaction history for employee {EmployeeId}", employeeId);
            return StatusCode(500, ApiResponse<List<PointTransactionDto>>.ErrorResponse(
                "Lỗi khi lấy lịch sử giao dịch",
                new List<string> { ex.Message }));
        }
    }

    // ============================================
    // QUY TẮC QUY ĐỔI ĐIỂM - CONVERSION RULES
    // ============================================

    /// <summary>
    /// Lấy quy tắc quy đổi điểm đang hoạt động
    /// </summary>
    [HttpGet("conversion-rules/active")]
    [ProducesResponseType(typeof(ApiResponse<PointConversionRuleDto>), 200)]
    [ProducesResponseType(404)]
    public async Task<ActionResult<ApiResponse<PointConversionRuleDto>>> GetActiveConversionRule()
    {
        try
        {
            var result = await _pointService.GetActiveConversionRuleAsync();

            if (!result.Success)
            {
                return NotFound(result);
            }

            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting active conversion rule");
            return StatusCode(500, ApiResponse<PointConversionRuleDto>.ErrorResponse(
                "Lỗi khi lấy quy tắc quy đổi",
                new List<string> { ex.Message }));
        }
    }

    /// <summary>
    /// Lấy tất cả quy tắc quy đổi điểm
    /// </summary>
    [HttpGet("conversion-rules")]
    [ProducesResponseType(typeof(ApiResponse<List<PointConversionRuleDto>>), 200)]
    public async Task<ActionResult<ApiResponse<List<PointConversionRuleDto>>>> GetAllConversionRules()
    {
        try
        {
            var rules = await _pointService.GetAllConversionRulesAsync();

            return Ok(ApiResponse<List<PointConversionRuleDto>>.SuccessResponse(
                rules,
                "Lấy danh sách quy tắc thành công"));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting all conversion rules");
            return StatusCode(500, ApiResponse<List<PointConversionRuleDto>>.ErrorResponse(
                "Lỗi khi lấy danh sách quy tắc",
                new List<string> { ex.Message }));
        }
    }

    /// <summary>
    /// Tạo quy tắc quy đổi điểm mới
    /// </summary>
    [HttpPost("conversion-rules")]
    [ProducesResponseType(typeof(ApiResponse<PointConversionRuleDto>), 201)]
    [ProducesResponseType(400)]
    public async Task<ActionResult<ApiResponse<PointConversionRuleDto>>> CreateConversionRule(
        [FromBody] UpsertPointConversionRuleDto dto)
    {
        try
        {
            if (!ModelState.IsValid)
            {
                var errors = ModelState.Values
                    .SelectMany(v => v.Errors)
                    .Select(e => e.ErrorMessage)
                    .ToList();

                return BadRequest(ApiResponse<PointConversionRuleDto>.ErrorResponse(
                    "Dữ liệu không hợp lệ", errors));
            }

            var result = await _pointService.CreateConversionRuleAsync(dto);

            if (!result.Success)
            {
                return BadRequest(result);
            }

            return CreatedAtAction(
                nameof(GetActiveConversionRule),
                result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating conversion rule");
            return StatusCode(500, ApiResponse<PointConversionRuleDto>.ErrorResponse(
                "Lỗi khi tạo quy tắc quy đổi",
                new List<string> { ex.Message }));
        }
    }

    /// <summary>
    /// Cập nhật quy tắc quy đổi điểm
    /// </summary>
    [HttpPut("conversion-rules/{id}")]
    [ProducesResponseType(typeof(ApiResponse<PointConversionRuleDto>), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(404)]
    public async Task<ActionResult<ApiResponse<PointConversionRuleDto>>> UpdateConversionRule(
        int id,
        [FromBody] UpsertPointConversionRuleDto dto)
    {
        try
        {
            if (!ModelState.IsValid)
            {
                var errors = ModelState.Values
                    .SelectMany(v => v.Errors)
                    .Select(e => e.ErrorMessage)
                    .ToList();

                return BadRequest(ApiResponse<PointConversionRuleDto>.ErrorResponse(
                    "Dữ liệu không hợp lệ", errors));
            }

            var result = await _pointService.UpdateConversionRuleAsync(id, dto);

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
            _logger.LogError(ex, "Error updating conversion rule {RuleId}", id);
            return StatusCode(500, ApiResponse<PointConversionRuleDto>.ErrorResponse(
                "Lỗi khi cập nhật quy tắc quy đổi",
                new List<string> { ex.Message }));
        }
    }

    // ============================================
    // QUY ĐỔI ĐIỂM SANG TIỀN - POINT TO MONEY
    // ============================================

    /// <summary>
    /// Gửi yêu cầu quy đổi điểm sang tiền
    /// </summary>
    [HttpPost("employee/{employeeId}/convert")]
    [ProducesResponseType(typeof(ApiResponse<PointToMoneyHistoryDto>), 201)]
    [ProducesResponseType(400)]
    public async Task<ActionResult<ApiResponse<PointToMoneyHistoryDto>>> RequestPointToMoneyConversion(
        int employeeId,
        [FromBody] RequestPointToMoneyDto dto)
    {
        try
        {
            if (!ModelState.IsValid)
            {
                var errors = ModelState.Values
                    .SelectMany(v => v.Errors)
                    .Select(e => e.ErrorMessage)
                    .ToList();

                return BadRequest(ApiResponse<PointToMoneyHistoryDto>.ErrorResponse(
                    "Dữ liệu không hợp lệ", errors));
            }

            var result = await _pointService.RequestPointToMoneyConversionAsync(employeeId, dto);

            if (!result.Success)
            {
                return BadRequest(result);
            }

            return CreatedAtAction(
                nameof(GetPointToMoneyHistory),
                new { pageNumber = 1, pageSize = 10, employeeId },
                result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error requesting point conversion for employee {EmployeeId}", employeeId);
            return StatusCode(500, ApiResponse<PointToMoneyHistoryDto>.ErrorResponse(
                "Lỗi khi gửi yêu cầu quy đổi",
                new List<string> { ex.Message }));
        }
    }

    /// <summary>
    /// Lấy lịch sử quy đổi điểm sang tiền
    /// </summary>
    [HttpGet("conversion-history")]
    [ProducesResponseType(typeof(PagedResult<PointToMoneyHistoryDto>), 200)]
    public async Task<ActionResult<PagedResult<PointToMoneyHistoryDto>>> GetPointToMoneyHistory(
        [FromQuery] int pageNumber = 1,
        [FromQuery] int pageSize = 10,
        [FromQuery] int? employeeId = null,
        [FromQuery] string? status = null)
    {
        try
        {
            if (pageNumber < 1) pageNumber = 1;
            if (pageSize < 1 || pageSize > 100) pageSize = 10;

            var result = await _pointService.GetPointToMoneyHistoryAsync(
                pageNumber, pageSize, employeeId, status);

            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting point to money history");
            return StatusCode(500, ApiResponse<object>.ErrorResponse(
                "Lỗi khi lấy lịch sử quy đổi",
                new List<string> { ex.Message }));
        }
    }

    /// <summary>
    /// Xử lý yêu cầu quy đổi điểm (duyệt/từ chối)
    /// </summary>
    [HttpPut("conversion-history/{requestId}/process")]
    [ProducesResponseType(typeof(ApiResponse<PointToMoneyHistoryDto>), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(404)]
    public async Task<ActionResult<ApiResponse<PointToMoneyHistoryDto>>> ProcessPointToMoneyRequest(
        int requestId,
        [FromBody] ProcessPointToMoneyDto dto)
    {
        try
        {
            if (!ModelState.IsValid)
            {
                var errors = ModelState.Values
                    .SelectMany(v => v.Errors)
                    .Select(e => e.ErrorMessage)
                    .ToList();

                return BadRequest(ApiResponse<PointToMoneyHistoryDto>.ErrorResponse(
                    "Dữ liệu không hợp lệ", errors));
            }

            // TODO: Get processorId from authenticated user
            int? processorId = null;

            var result = await _pointService.ProcessPointToMoneyRequestAsync(
                requestId, dto, processorId);

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
            _logger.LogError(ex, "Error processing point conversion request {RequestId}", requestId);
            return StatusCode(500, ApiResponse<PointToMoneyHistoryDto>.ErrorResponse(
                "Lỗi khi xử lý yêu cầu quy đổi",
                new List<string> { ex.Message }));
        }
    }

    // ============================================
    // THỐNG KÊ - STATISTICS
    // ============================================

    /// <summary>
    /// Lấy thống kê điểm thưởng
    /// </summary>
    [HttpGet("statistics")]
    [ProducesResponseType(typeof(ApiResponse<PointStatisticsDto>), 200)]
    public async Task<ActionResult<ApiResponse<PointStatisticsDto>>> GetStatistics()
    {
        try
        {
            var statistics = await _pointService.GetPointStatisticsAsync();

            return Ok(ApiResponse<PointStatisticsDto>.SuccessResponse(
                statistics,
                "Lấy thống kê thành công"));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting point statistics");
            return StatusCode(500, ApiResponse<PointStatisticsDto>.ErrorResponse(
                "Lỗi khi lấy thống kê",
                new List<string> { ex.Message }));
        }
    }
}