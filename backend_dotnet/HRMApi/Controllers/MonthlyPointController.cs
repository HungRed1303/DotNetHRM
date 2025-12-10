using HRMApi.DTOs;
using HRMApi.Services;
using Microsoft.AspNetCore.Mvc;

namespace HRMApi.Controllers;

[ApiController]
[Route("api/v1/[controller]")]
public class MonthlyPointController : ControllerBase
{
    private readonly IMonthlyPointService _monthlyPointService;
    private readonly ILogger<MonthlyPointController> _logger;

    public MonthlyPointController(
        IMonthlyPointService monthlyPointService,
        ILogger<MonthlyPointController> logger)
    {
        _monthlyPointService = monthlyPointService;
        _logger = logger;
    }

    /// <summary>
    /// Lấy danh sách quy tắc cộng điểm hàng tháng
    /// </summary>
    [HttpGet("rules")]
    [ProducesResponseType(typeof(ApiResponse<List<MonthlyPointRuleDto>>), 200)]
    public async Task<ActionResult<ApiResponse<List<MonthlyPointRuleDto>>>> GetMonthlyPointRules()
    {
        try
        {
            var rules = await _monthlyPointService.GetAllRulesAsync();

            return Ok(ApiResponse<List<MonthlyPointRuleDto>>.SuccessResponse(
                rules,
                "Lấy danh sách quy tắc thành công"));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting monthly point rules");
            return StatusCode(500, ApiResponse<List<MonthlyPointRuleDto>>.ErrorResponse(
                "Lỗi khi lấy danh sách quy tắc",
                new List<string> { ex.Message }));
        }
    }

    /// <summary>
    /// Lấy quy tắc cộng điểm theo ID
    /// </summary>
    [HttpGet("rules/{id}")]
    [ProducesResponseType(typeof(ApiResponse<MonthlyPointRuleDto>), 200)]
    [ProducesResponseType(404)]
    public async Task<ActionResult<ApiResponse<MonthlyPointRuleDto>>> GetMonthlyPointRule(int id)
    {
        try
        {
            var rule = await _monthlyPointService.GetRuleByIdAsync(id);

            if (rule == null)
            {
                return NotFound(ApiResponse<MonthlyPointRuleDto>.ErrorResponse(
                    "Không tìm thấy quy tắc",
                    new List<string> { $"Quy tắc với ID {id} không tồn tại" }));
            }

            return Ok(ApiResponse<MonthlyPointRuleDto>.SuccessResponse(
                rule,
                "Lấy quy tắc thành công"));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting monthly point rule {RuleId}", id);
            return StatusCode(500, ApiResponse<MonthlyPointRuleDto>.ErrorResponse(
                "Lỗi khi lấy quy tắc",
                new List<string> { ex.Message }));
        }
    }

    /// <summary>
    /// Tạo hoặc cập nhật quy tắc cộng điểm cho một role
    /// </summary>
    [HttpPost("rules")]
    [ProducesResponseType(typeof(ApiResponse<MonthlyPointRuleDto>), 200)]
    [ProducesResponseType(400)]
    public async Task<ActionResult<ApiResponse<MonthlyPointRuleDto>>> UpsertMonthlyPointRule(
        [FromBody] UpsertMonthlyPointRuleDto dto)
    {
        try
        {
            if (!ModelState.IsValid)
            {
                var errors = ModelState.Values
                    .SelectMany(v => v.Errors)
                    .Select(e => e.ErrorMessage)
                    .ToList();

                return BadRequest(ApiResponse<MonthlyPointRuleDto>.ErrorResponse(
                    "Dữ liệu không hợp lệ", errors));
            }

            var result = await _monthlyPointService.UpsertRuleAsync(dto);

            if (!result.Success)
            {
                return BadRequest(result);
            }

            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error upserting monthly point rule");
            return StatusCode(500, ApiResponse<MonthlyPointRuleDto>.ErrorResponse(
                "Lỗi khi tạo/cập nhật quy tắc",
                new List<string> { ex.Message }));
        }
    }

    /// <summary>
    /// Xóa quy tắc cộng điểm
    /// </summary>
    [HttpDelete("rules/{id}")]
    [ProducesResponseType(typeof(ApiResponse<bool>), 200)]
    [ProducesResponseType(404)]
    public async Task<ActionResult<ApiResponse<bool>>> DeleteMonthlyPointRule(int id)
    {
        try
        {
            var result = await _monthlyPointService.DeleteRuleAsync(id);

            if (!result.Success)
            {
                return NotFound(result);
            }

            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting monthly point rule {RuleId}", id);
            return StatusCode(500, ApiResponse<bool>.ErrorResponse(
                "Lỗi khi xóa quy tắc",
                new List<string> { ex.Message }));
        }
    }

    /// <summary>
    /// Chạy job cộng điểm thủ công (manual trigger)
    /// </summary>
    [HttpPost("allocate")]
    [ProducesResponseType(typeof(ApiResponse<MonthlyPointAllocationResultDto>), 200)]
    public async Task<ActionResult<ApiResponse<MonthlyPointAllocationResultDto>>> AllocateMonthlyPoints()
    {
        try
        {
            var result = await _monthlyPointService.AllocateMonthlyPointsAsync();

            if (result.Success)
            {
                return Ok(result);
            }
            else
            {
                return BadRequest(result);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error allocating monthly points");
            return StatusCode(500, ApiResponse<MonthlyPointAllocationResultDto>.ErrorResponse(
                "Lỗi khi cộng điểm",
                new List<string> { ex.Message }));
        }
    }

    /// <summary>
    /// Lấy lịch sử chạy job cộng điểm tự động
    /// </summary>
    [HttpGet("history")]
    [ProducesResponseType(typeof(ApiResponse<List<MonthlyPointAllocationHistoryDto>>), 200)]
    public async Task<ActionResult<ApiResponse<List<MonthlyPointAllocationHistoryDto>>>> GetAllocationHistory(
        [FromQuery] int limit = 12)
    {
        try
        {
            var history = await _monthlyPointService.GetAllocationHistoryAsync(limit);

            return Ok(ApiResponse<List<MonthlyPointAllocationHistoryDto>>.SuccessResponse(
                history,
                "Lấy lịch sử thành công"));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting allocation history");
            return StatusCode(500, ApiResponse<List<MonthlyPointAllocationHistoryDto>>.ErrorResponse(
                "Lỗi khi lấy lịch sử",
                new List<string> { ex.Message }));
        }
    }
}