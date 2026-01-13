using HRMApi.Services;
using Microsoft.AspNetCore.Mvc;

namespace HRMApi.Controllers;

[ApiController]
[Route("api/v1/[controller]")]
public class ActivityController : ControllerBase
{
    private readonly IActivityService _activityService;

    public ActivityController(IActivityService activityService)
    {
        _activityService = activityService;
    }

    /// <summary>
    /// Lấy danh sách tất cả các hoạt động đã hoàn thành
    /// </summary>
    /// <returns>Danh sách hoạt động đã hoàn thành với thông tin chi tiết</returns>
    [HttpGet("completed")]
    public async Task<IActionResult> GetCompletedActivities()
    {
        try
        {
            var completedActivities = await _activityService.GetCompletedActivitiesAsync();
            return Ok(completedActivities);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Lỗi khi lấy danh sách hoạt động đã hoàn thành", error = ex.Message });
        }
    }
}
