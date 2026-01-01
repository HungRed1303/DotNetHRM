using AutoMapper;
using HRMApi.Data;
using HRMApi.DTOs;
using HRMApi.Models;
using HRMApi.Repositories;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;

namespace HRMApi.Services;

public class ParticipationService : IParticipationService
{
    private readonly IParticipationRepository _participationRepository;
    private readonly IEmployeeRepository _employeeRepository;
    private readonly HrmDbContext _context;
    private readonly IMapper _mapper;
    private readonly ILogger<ParticipationService> _logger;

    public ParticipationService(
        IParticipationRepository participationRepository,
        IEmployeeRepository employeeRepository,
        HrmDbContext context,
        IMapper mapper,
        ILogger<ParticipationService> logger)
    {
        _participationRepository = participationRepository;
        _employeeRepository = employeeRepository;
        _context = context;
        _mapper = mapper;
        _logger = logger;
    }

    // ============================================
    // EXISTING METHODS
    // ============================================

    public async Task<ApiResponse<IEnumerable<ParticipationDto>>> GetActivityParticipationAsync(int employeeId)
    {
        try
        {
            var employeeExists = await _employeeRepository.ExistsAsync(employeeId);
            if (!employeeExists)
            {
                return ApiResponse<IEnumerable<ParticipationDto>>.ErrorResponse(
                    "Không tìm thấy nhân viên",
                    new List<string> { $"Nhân viên với ID {employeeId} không tồn tại" });
            }

            var participation = await _participationRepository.GetByEmployeeIdAsync(employeeId);

            if (participation == null || !participation.Any())
            {
                return ApiResponse<IEnumerable<ParticipationDto>>.ErrorResponse(
                    "Không tìm thấy thông tin tham gia",
                    new List<string> { "Nhân viên chưa tham gia hoạt động nào" });
            }

            var dto = _mapper.Map<IEnumerable<ParticipationDto>>(participation);

            return ApiResponse<IEnumerable<ParticipationDto>>.SuccessResponse(
                dto,
                "Lấy thông tin tham gia thành công");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting employee participation information of {EmployeeId}", employeeId);
            throw;
        }
    }

    public async Task<ApiResponse<IEnumerable<ParticipationDto>>> GetEmployeeParticipationAsync(int activityId)
    {
        try
        {
            var participation = await _participationRepository.GetByActivityIdAsync(activityId);

            if (participation == null || !participation.Any())
            {
                return ApiResponse<IEnumerable<ParticipationDto>>.ErrorResponse(
                    "Không tìm thấy người tham gia",
                    new List<string> { "Chưa có nhân viên nào tham gia hoạt động" });
            }

            var dto = _mapper.Map<IEnumerable<ParticipationDto>>(participation);

            return ApiResponse<IEnumerable<ParticipationDto>>.SuccessResponse(
                dto,
                "Lấy thông tin tham gia thành công");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting employees participated in the activity");
            throw;
        }
    }

    public async Task<ApiResponse<ParticipationDto>> GetParticipationAsync(int activityId, int employeeId)
    {
        try
        {
            var employeeExists = await _employeeRepository.ExistsAsync(employeeId);
            if (!employeeExists)
            {
                return ApiResponse<ParticipationDto>.ErrorResponse(
                    "Không tìm thấy nhân viên",
                    new List<string> { $"Nhân viên với ID {employeeId} không tồn tại" });
            }

            var participation = await _participationRepository.GetByActivityIdEmployeeIdAsync(activityId, employeeId);

            if (participation == null)
            {
                return ApiResponse<ParticipationDto>.ErrorResponse(
                    "Không tìm thấy thông tin tham gia",
                    new List<string> { "Nhân viên chưa tham gia hoạt động này" });
            }

            var dto = _mapper.Map<ParticipationDto>(participation);

            return ApiResponse<ParticipationDto>.SuccessResponse(
                dto,
                "Lấy thông tin tham gia thành công");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting employee participation information of {EmployeeId}", employeeId);
            throw;
        }
    }

    public async Task<PagedResult<ParticipationDto>> GetAllParticipationsAsync(
        int pageNumber,
        int pageSize,
        string? searchTerm = null)
    {
        try
        {
            var (items, totalCount) = await _participationRepository.GetPagedAsync(
                pageNumber, pageSize, searchTerm);

            var dtos = _mapper.Map<List<ParticipationDto>>(items);

            return new PagedResult<ParticipationDto>
            {
                Items = dtos,
                TotalCount = totalCount,
                PageNumber = pageNumber,
                PageSize = pageSize
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting all employee participations");
            throw;
        }
    }

    // ============================================
    // NEW METHODS - JSONB Support
    // ============================================

    /// <summary>
    /// Update participation result with JSONB data
    /// </summary>
    public async Task<ApiResponse<ParticipationDto>> UpdateParticipationResultAsync(
        int activityId,
        int employeeId,
        UpdateParticipationResultDto dto)
    {
        try
        {
            var participation = await _participationRepository
                .GetByActivityIdEmployeeIdAsync(activityId, employeeId);

            if (participation == null)
            {
                return ApiResponse<ParticipationDto>.ErrorResponse(
                    "Không tìm thấy thông tin tham gia",
                    new List<string> { "Không tồn tại bản ghi tham gia này" });
            }

            // Validate that activity is completed/attended
            if (participation.Status != "attended")
            {
                return ApiResponse<ParticipationDto>.ErrorResponse(
                    "Không thể cập nhật kết quả",
                    new List<string> { "Chỉ có thể cập nhật kết quả cho hoạt động đã tham gia (status = 'attended')" });
            }

            // Convert dictionary to JsonDocument
            var jsonString = JsonSerializer.Serialize(dto.ResultData);
            participation.Result = JsonDocument.Parse(jsonString);

            await _participationRepository.UpdateAsync(participation);

            // Reload with includes
            var updatedParticipation = await _participationRepository
                .GetByActivityIdEmployeeIdAsync(activityId, employeeId);
            
            var resultDto = _mapper.Map<ParticipationDto>(updatedParticipation);

            return ApiResponse<ParticipationDto>.SuccessResponse(
                resultDto,
                "Cập nhật kết quả thành công");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating participation result for Activity {ActivityId}, Employee {EmployeeId}", 
                activityId, employeeId);
            return ApiResponse<ParticipationDto>.ErrorResponse(
                "Lỗi khi cập nhật kết quả",
                new List<string> { ex.Message });
        }
    }

    /// <summary>
    /// Get results by activity type
    /// </summary>
    public async Task<ApiResponse<List<ParticipationDto>>> GetResultsByActivityTypeAsync(
        string activityType)
    {
        try
        {
            var participations = await _participationRepository
                .GetByActivityTypeAsync(activityType);

            // Filter only participations with result data
            var dtos = _mapper.Map<List<ParticipationDto>>(
                participations.Where(p => p.Result != null));

            return ApiResponse<List<ParticipationDto>>.SuccessResponse(
                dtos,
                $"Lấy {dtos.Count} kết quả thành công");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting results by activity type {ActivityType}", activityType);
            return ApiResponse<List<ParticipationDto>>.ErrorResponse(
                "Lỗi khi lấy kết quả",
                new List<string> { ex.Message });
        }
    }

    /// <summary>
    /// Get top performers for a specific activity type
    /// Example: Top 10 fastest runners
    /// </summary>
    public async Task<ApiResponse<List<ParticipationDto>>> GetTopPerformersAsync(
        string activityType,
        string sortKey,
        int limit = 10)
    {
        try
        {
            var participations = await _participationRepository
                .GetTopPerformersByActivityTypeAsync(activityType, sortKey, limit);

            var dtos = _mapper.Map<List<ParticipationDto>>(participations);

            return ApiResponse<List<ParticipationDto>>.SuccessResponse(
                dtos,
                $"Lấy top {dtos.Count} thành công");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting top performers for {ActivityType}, sorted by {SortKey}", 
                activityType, sortKey);
            return ApiResponse<List<ParticipationDto>>.ErrorResponse(
                "Lỗi khi lấy danh sách",
                new List<string> { ex.Message });
        }
    }

    /// <summary>
    /// Get all participations with results
    /// </summary>
    public async Task<ApiResponse<List<ParticipationDto>>> GetAllWithResultsAsync()
    {
        try
        {
            var participations = await _participationRepository.GetWithResultsAsync();
            var dtos = _mapper.Map<List<ParticipationDto>>(participations);

            return ApiResponse<List<ParticipationDto>>.SuccessResponse(
                dtos,
                "Lấy danh sách thành công");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting all participations with results");
            return ApiResponse<List<ParticipationDto>>.ErrorResponse(
                "Lỗi khi lấy danh sách",
                new List<string> { ex.Message });
        }
    }

    /// <summary>
    /// Get employees who received certificates
    /// </summary>
    public async Task<ApiResponse<List<ParticipationDto>>> GetCertifiedEmployeesAsync()
    {
        try
        {
            var participations = await _participationRepository.GetCertifiedEmployeesAsync();
            var dtos = _mapper.Map<List<ParticipationDto>>(participations);

            return ApiResponse<List<ParticipationDto>>.SuccessResponse(
                dtos,
                $"Tìm thấy {dtos.Count} nhân viên có chứng chỉ");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting certified employees");
            return ApiResponse<List<ParticipationDto>>.ErrorResponse(
                "Lỗi khi lấy danh sách",
                new List<string> { ex.Message });
        }
    }

    /// <summary>
    /// Get volunteer hours statistics by employee
    /// </summary>
    public async Task<ApiResponse<Dictionary<int, double>>> GetVolunteerHoursStatsAsync()
    {
        try
        {
            var stats = await _participationRepository.GetVolunteerHoursByEmployeeAsync();

            return ApiResponse<Dictionary<int, double>>.SuccessResponse(
                stats,
                "Lấy thống kê giờ tình nguyện thành công");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting volunteer hours statistics");
            return ApiResponse<Dictionary<int, double>>.ErrorResponse(
                "Lỗi khi lấy thống kê",
                new List<string> { ex.Message });
        }
    }

    /// <summary>
    /// Get statistics about results by activity type
    /// </summary>
    public async Task<ApiResponse<Dictionary<string, int>>> GetResultStatsByActivityTypeAsync(
        string activityType)
    {
        try
        {
            var stats = await _participationRepository
                .GetResultStatsByActivityTypeAsync(activityType);

            return ApiResponse<Dictionary<string, int>>.SuccessResponse(
                stats,
                "Lấy thống kê thành công");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting result stats for activity type {ActivityType}", activityType);
            return ApiResponse<Dictionary<string, int>>.ErrorResponse(
                "Lỗi khi lấy thống kê",
                new List<string> { ex.Message });
        }
    }

    /// <summary>
    /// Get running results with time under specified duration
    /// </summary>
    public async Task<ApiResponse<List<ParticipationDto>>> GetRunningResultsUnderTimeAsync(
        string maxTime)
    {
        try
        {
            var participations = await _participationRepository
                .GetRunningResultsUnderTimeAsync(maxTime);
            
            var dtos = _mapper.Map<List<ParticipationDto>>(participations);

            return ApiResponse<List<ParticipationDto>>.SuccessResponse(
                dtos,
                $"Tìm thấy {dtos.Count} kết quả");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting running results under time {MaxTime}", maxTime);
            return ApiResponse<List<ParticipationDto>>.ErrorResponse(
                "Lỗi khi lấy kết quả",
                new List<string> { ex.Message });
        }
    }

    /// <summary>
    /// Get training results with quiz score above threshold
    /// </summary>
    public async Task<ApiResponse<List<ParticipationDto>>> GetTrainingResultsAboveScoreAsync(
        int minScore)
    {
        try
        {
            var participations = await _participationRepository
                .GetTrainingResultsAboveScoreAsync(minScore);
            
            var dtos = _mapper.Map<List<ParticipationDto>>(participations);

            return ApiResponse<List<ParticipationDto>>.SuccessResponse(
                dtos,
                $"Tìm thấy {dtos.Count} kết quả với điểm > {minScore}");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting training results above score {MinScore}", minScore);
            return ApiResponse<List<ParticipationDto>>.ErrorResponse(
                "Lỗi khi lấy kết quả",
                new List<string> { ex.Message });
        }
    }

    /// <summary>
    /// Search in result JSONB field
    /// </summary>
    public async Task<ApiResponse<List<ParticipationDto>>> SearchInResultsAsync(
        string searchTerm)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(searchTerm))
            {
                return ApiResponse<List<ParticipationDto>>.ErrorResponse(
                    "Từ khóa tìm kiếm không được để trống",
                    new List<string> { "Vui lòng nhập từ khóa tìm kiếm" });
            }

            var participations = await _participationRepository
                .SearchInResultsAsync(searchTerm);
            
            var dtos = _mapper.Map<List<ParticipationDto>>(participations);

            return ApiResponse<List<ParticipationDto>>.SuccessResponse(
                dtos,
                $"Tìm thấy {dtos.Count} kết quả cho '{searchTerm}'");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error searching in results with term {SearchTerm}", searchTerm);
            return ApiResponse<List<ParticipationDto>>.ErrorResponse(
                "Lỗi khi tìm kiếm",
                new List<string> { ex.Message });
        }
    }

    /// <summary>
    /// Get participations by result key
    /// Example: Get all participations that have "certificate_issued" field
    /// </summary>
    public async Task<ApiResponse<List<ParticipationDto>>> GetByResultKeyAsync(
        string key)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(key))
            {
                return ApiResponse<List<ParticipationDto>>.ErrorResponse(
                    "Key không được để trống",
                    new List<string> { "Vui lòng cung cấp key cần tìm" });
            }

            var participations = await _participationRepository.GetByResultKeyAsync(key);
            var dtos = _mapper.Map<List<ParticipationDto>>(participations);

            return ApiResponse<List<ParticipationDto>>.SuccessResponse(
                dtos,
                $"Tìm thấy {dtos.Count} kết quả có field '{key}'");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting participations by result key {Key}", key);
            return ApiResponse<List<ParticipationDto>>.ErrorResponse(
                "Lỗi khi tìm kiếm",
                new List<string> { ex.Message });
        }
    }

    /// <summary>
    /// Get participations by result key-value pair
    /// Example: Get all participations where certificate_issued = true
    /// </summary>
    public async Task<ApiResponse<List<ParticipationDto>>> GetByResultValueAsync(
        string key,
        object value)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(key))
            {
                return ApiResponse<List<ParticipationDto>>.ErrorResponse(
                    "Key không được để trống",
                    new List<string> { "Vui lòng cung cấp key cần tìm" });
            }

            var participations = await _participationRepository
                .GetByResultValueAsync(key, value);
            
            var dtos = _mapper.Map<List<ParticipationDto>>(participations);

            return ApiResponse<List<ParticipationDto>>.SuccessResponse(
                dtos,
                $"Tìm thấy {dtos.Count} kết quả với {key} = {value}");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting participations by result value {Key}={Value}", key, value);
            return ApiResponse<List<ParticipationDto>>.ErrorResponse(
                "Lỗi khi tìm kiếm",
                new List<string> { ex.Message });
        }
    }

    /// <summary>
    /// Update attendance status (điểm danh)
    /// </summary>
    public async Task<ApiResponse<ParticipationDto>> UpdateAttendanceStatusAsync(
        int activityId,
        int employeeId,
        UpdateAttendanceStatusDto dto)
    {
        try
        {
            var participation = await _participationRepository
                .GetByActivityIdEmployeeIdForAttendanceAsync(activityId, employeeId);

            if (participation == null)
            {
                return ApiResponse<ParticipationDto>.ErrorResponse(
                    "Không tìm thấy thông tin đăng ký",
                    new List<string> { "Nhân viên chưa đăng ký hoạt động này" });
            }

            // Validate current status
            if (participation.Status == "cancelled")
            {
                return ApiResponse<ParticipationDto>.ErrorResponse(
                    "Không thể điểm danh",
                    new List<string> { "Không thể điểm danh cho đăng ký đã bị hủy" });
            }

            // Check if activity has started
            if (participation.Activity.StartDate > DateTime.UtcNow)
            {
                return ApiResponse<ParticipationDto>.ErrorResponse(
                    "Chưa thể điểm danh",
                    new List<string> { "Hoạt động chưa bắt đầu" });
            }

            // Check if already has this status
            if (participation.Status == dto.Status)
            {
                return ApiResponse<ParticipationDto>.ErrorResponse(
                    "Trạng thái không thay đổi",
                    new List<string> { $"Nhân viên đã được đánh dấu là '{dto.Status}' rồi" });
            }

            // Update status
            var oldStatus = participation.Status;
            participation.Status = dto.Status;

            // If marking as absent, clear any existing result
            if (dto.Status == "absent")
            {
                participation.Result = null;
            }

            await _participationRepository.UpdateAsync(participation);

            // Reload with full details
            var updatedParticipation = await _participationRepository
                .GetByActivityIdEmployeeIdAsync(activityId, employeeId);
            
            var resultDto = _mapper.Map<ParticipationDto>(updatedParticipation);

            _logger.LogInformation(
                "Attendance updated: Activity {ActivityId}, Employee {EmployeeId}, {OldStatus} → {NewStatus}",
                activityId, employeeId, oldStatus, dto.Status);

            return ApiResponse<ParticipationDto>.SuccessResponse(
                resultDto,
                $"Điểm danh thành công: {(dto.Status == "attended" ? "Có mặt" : "Vắng mặt")}");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, 
                "Error updating attendance for Activity {ActivityId}, Employee {EmployeeId}", 
                activityId, employeeId);
            return ApiResponse<ParticipationDto>.ErrorResponse(
                "Lỗi khi điểm danh",
                new List<string> { ex.Message });
        }
    }
}