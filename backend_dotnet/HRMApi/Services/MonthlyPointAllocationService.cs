using AutoMapper;
using HRMApi.Data;
using HRMApi.DTOs;
using HRMApi.Models;
using HRMApi.Repositories;
using Microsoft.EntityFrameworkCore;

namespace HRMApi.Services;

public class MonthlyPointService : IMonthlyPointService
{
    private readonly IMonthlyPointRepository _monthlyPointRepository;
    private readonly IEmployeeRepository _employeeRepository;
    private readonly IPointRepository _pointRepository;
    private readonly HrmDbContext _context;
    private readonly IMapper _mapper;
    private readonly ILogger<MonthlyPointService> _logger;

    public MonthlyPointService(
        IMonthlyPointRepository monthlyPointRepository,
        IEmployeeRepository employeeRepository,
        IPointRepository pointRepository,
        HrmDbContext context,
        IMapper mapper,
        ILogger<MonthlyPointService> logger)
    {
        _monthlyPointRepository = monthlyPointRepository;
        _employeeRepository = employeeRepository;
        _pointRepository = pointRepository;
        _context = context;
        _mapper = mapper;
        _logger = logger;
    }

    // ============================================
    // MONTHLY POINT RULES MANAGEMENT
    // ============================================

    public async Task<List<MonthlyPointRuleDto>> GetAllRulesAsync()
    {
        try
        {
            var rules = await _monthlyPointRepository.GetAllRulesAsync();
            return _mapper.Map<List<MonthlyPointRuleDto>>(rules);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting monthly point rules");
            throw;
        }
    }

    public async Task<MonthlyPointRuleDto?> GetRuleByIdAsync(int id)
    {
        try
        {
            var rule = await _monthlyPointRepository.GetRuleByIdAsync(id);
            return rule != null ? _mapper.Map<MonthlyPointRuleDto>(rule) : null;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting monthly point rule {RuleId}", id);
            throw;
        }
    }

    public async Task<ApiResponse<MonthlyPointRuleDto>> UpsertRuleAsync(UpsertMonthlyPointRuleDto dto)
    {
        try
        {
            // Check if role exists
            var roleExists = await _context.Roles.AnyAsync(r => r.Id == dto.RoleId);
            if (!roleExists)
            {
                return ApiResponse<MonthlyPointRuleDto>.ErrorResponse(
                    "Role không tồn tại",
                    new List<string> { $"Role với ID {dto.RoleId} không tồn tại" });
            }

            // Check if rule exists for this role
            var existingRule = await _monthlyPointRepository.GetRuleByRoleIdAsync(dto.RoleId);

            MonthlyPointRule rule;
            string message;

            if (existingRule != null)
            {
                // Update existing rule
                existingRule.PointValue = dto.PointValue;
                existingRule.IsActive = dto.IsActive;
                existingRule.UpdatedAt = DateTime.UtcNow;

                await _monthlyPointRepository.UpdateRuleAsync(existingRule);
                rule = existingRule;
                message = "Cập nhật quy tắc thành công";
            }
            else
            {
                // Create new rule
                var newRule = new MonthlyPointRule
                {
                    RoleId = dto.RoleId,
                    PointValue = dto.PointValue,
                    IsActive = dto.IsActive,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };

                rule = await _monthlyPointRepository.AddRuleAsync(newRule);
                message = "Tạo quy tắc thành công";
            }

            // Get rule with details
            var ruleWithDetails = await _monthlyPointRepository.GetRuleByIdAsync(rule.Id);
            var resultDto = _mapper.Map<MonthlyPointRuleDto>(ruleWithDetails);

            return ApiResponse<MonthlyPointRuleDto>.SuccessResponse(resultDto, message);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error upserting monthly point rule");
            return ApiResponse<MonthlyPointRuleDto>.ErrorResponse(
                "Lỗi khi tạo/cập nhật quy tắc",
                new List<string> { ex.Message });
        }
    }

    public async Task<ApiResponse<bool>> DeleteRuleAsync(int id)
    {
        try
        {
            var rule = await _monthlyPointRepository.GetRuleByIdAsync(id);

            if (rule == null)
            {
                return ApiResponse<bool>.ErrorResponse(
                    "Không tìm thấy quy tắc",
                    new List<string> { $"Quy tắc với ID {id} không tồn tại" });
            }

            await _monthlyPointRepository.DeleteRuleAsync(id);

            return ApiResponse<bool>.SuccessResponse(true, "Xóa quy tắc thành công");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting monthly point rule {RuleId}", id);
            return ApiResponse<bool>.ErrorResponse(
                "Lỗi khi xóa quy tắc",
                new List<string> { ex.Message });
        }
    }

    // ============================================
    // MONTHLY POINT ALLOCATION
    // ============================================

    public async Task<ApiResponse<MonthlyPointAllocationResultDto>> AllocateMonthlyPointsAsync()
    {
        await using var transaction = await _context.Database.BeginTransactionAsync();

        try
        {
            var now = DateTime.UtcNow;
            var year = now.Year;
            var month = now.Month;

            // Check if already run this month
            var alreadyRun = await _monthlyPointRepository.HasAllocationForMonthAsync(year, month);

            if (alreadyRun)
            {
                return ApiResponse<MonthlyPointAllocationResultDto>.ErrorResponse(
                    $"Đã chạy job cộng điểm cho tháng {month}/{year} rồi",
                    new List<string>());
            }

            // Get active monthly point rules
            var rules = await _monthlyPointRepository.GetActiveRulesAsync();

            if (!rules.Any())
            {
                return ApiResponse<MonthlyPointAllocationResultDto>.ErrorResponse(
                    "Không có quy tắc cộng điểm nào được kích hoạt",
                    new List<string>());
            }

            // Get all active employees
            var employees = await _context.Employees
                .Include(e => e.Point)
                .Where(e => e.Status == "active")
                .ToListAsync();

            int employeesProcessed = 0;
            int totalPointsAllocated = 0;

            foreach (var employee in employees)
            {
                // Find matching rule for employee's role
                var rule = rules.FirstOrDefault(r => r.RoleId == employee.RoleId);

                if (rule == null)
                {
                    _logger.LogWarning(
                        "No monthly point rule found for role {RoleId}, skipping employee {EmployeeId}",
                        employee.RoleId, employee.Id);
                    continue;
                }

                // Update employee's point
                if (employee.Point != null)
                {
                    employee.Point.PointTotal = (employee.Point.PointTotal ?? 0) + rule.PointValue;
                    employee.Point.LastUpdate = DateTime.UtcNow;
                }
                else
                {
                    // Create point record if doesn't exist
                    var newPoint = new Point
                    {
                        EmployeeId = employee.Id,
                        PointTotal = rule.PointValue,
                        LastUpdate = DateTime.UtcNow
                    };
                    await _context.Points.AddAsync(newPoint);
                }

                // Create transaction history
                var transactionHistory = new PointTransactionHistory
                {
                    EmployeeId = employee.Id,
                    Value = rule.PointValue,
                    Type = "earn",
                    ActorId = null, // System-generated
                    Description = $"Điểm thưởng tháng {month}/{year} cho role {rule.Role.Name}",
                    CreatedAt = DateTime.UtcNow
                };
                await _context.PointTransactionHistories.AddAsync(transactionHistory);

                employeesProcessed++;
                totalPointsAllocated += rule.PointValue;
            }

            // Save all changes
            await _context.SaveChangesAsync();

            // Create allocation history record
            var allocationHistory = new MonthlyPointAllocationHistory
            {
                ExecutionDate = DateTime.UtcNow,
                Year = year,
                Month = month,
                TotalEmployeesProcessed = employeesProcessed,
                TotalPointsAllocated = totalPointsAllocated,
                Status = "completed",
                CreatedAt = DateTime.UtcNow
            };
            await _monthlyPointRepository.AddAllocationHistoryAsync(allocationHistory);

            await transaction.CommitAsync();

            var message = $"Đã cộng điểm thành công cho {employeesProcessed} nhân viên, tổng {totalPointsAllocated} điểm";
            _logger.LogInformation(message);

            var result = new MonthlyPointAllocationResultDto
            {
                EmployeesProcessed = employeesProcessed,
                PointsAllocated = totalPointsAllocated,
                Message = message
            };

            return ApiResponse<MonthlyPointAllocationResultDto>.SuccessResponse(result, message);
        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync();

            _logger.LogError(ex, "Error allocating monthly points");

            // Save error to history
            try
            {
                var now = DateTime.UtcNow;
                var errorHistory = new MonthlyPointAllocationHistory
                {
                    ExecutionDate = DateTime.UtcNow,
                    Year = now.Year,
                    Month = now.Month,
                    TotalEmployeesProcessed = 0,
                    TotalPointsAllocated = 0,
                    Status = "failed",
                    ErrorMessage = ex.Message,
                    CreatedAt = DateTime.UtcNow
                };
                await _monthlyPointRepository.AddAllocationHistoryAsync(errorHistory);
            }
            catch (Exception logEx)
            {
                _logger.LogError(logEx, "Error saving error history");
            }

            return ApiResponse<MonthlyPointAllocationResultDto>.ErrorResponse(
                $"Lỗi: {ex.Message}",
                new List<string> { ex.Message });
        }
    }

    public async Task<bool> HasRunThisMonthAsync()
    {
        var now = DateTime.UtcNow;
        return await _monthlyPointRepository.HasAllocationForMonthAsync(now.Year, now.Month);
    }

    // ============================================
    // ALLOCATION HISTORY
    // ============================================

    public async Task<List<MonthlyPointAllocationHistoryDto>> GetAllocationHistoryAsync(int limit = 12)
    {
        try
        {
            var history = await _monthlyPointRepository.GetAllocationHistoryAsync(limit);
            return _mapper.Map<List<MonthlyPointAllocationHistoryDto>>(history);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting allocation history");
            throw;
        }
    }
}