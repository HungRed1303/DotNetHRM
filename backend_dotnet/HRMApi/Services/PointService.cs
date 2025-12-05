using AutoMapper;
using HRMApi.Data;
using HRMApi.DTOs;
using HRMApi.Models;
using HRMApi.Repositories;

namespace HRMApi.Services;

public class PointService : IPointService
{
    private readonly IPointRepository _pointRepository;
    private readonly IEmployeeRepository _employeeRepository;
    private readonly HrmDbContext _context;
    private readonly IMapper _mapper;
    private readonly ILogger<PointService> _logger;

    public PointService(
        IPointRepository pointRepository,
        IEmployeeRepository employeeRepository,
        HrmDbContext context,
        IMapper mapper,
        ILogger<PointService> logger)
    {
        _pointRepository = pointRepository;
        _employeeRepository = employeeRepository;
        _context = context;
        _mapper = mapper;
        _logger = logger;
    }

    // ============================================
    // POINT QUERIES
    // ============================================
    
    public async Task<ApiResponse<EmployeePointDto>> GetEmployeePointAsync(int employeeId)
    {
        try
        {
            var employeeExists = await _employeeRepository.ExistsAsync(employeeId);
            if (!employeeExists)
            {
                return ApiResponse<EmployeePointDto>.ErrorResponse(
                    "Không tìm thấy nhân viên",
                    new List<string> { $"Nhân viên với ID {employeeId} không tồn tại" });
            }

            var point = await _pointRepository.GetByEmployeeIdAsync(employeeId);
            
            if (point == null)
            {
                return ApiResponse<EmployeePointDto>.ErrorResponse(
                    "Không tìm thấy thông tin điểm",
                    new List<string> { "Nhân viên chưa có thông tin điểm thưởng" });
            }

            var dto = _mapper.Map<EmployeePointDto>(point);
            
            return ApiResponse<EmployeePointDto>.SuccessResponse(
                dto, 
                "Lấy thông tin điểm thành công");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting employee point for {EmployeeId}", employeeId);
            throw;
        }
    }

    public async Task<PagedResult<EmployeePointDto>> GetAllEmployeePointsAsync(
        int pageNumber, 
        int pageSize,
        string? searchTerm = null)
    {
        try
        {
            var (items, totalCount) = await _pointRepository.GetPagedAsync(
                pageNumber, pageSize, searchTerm);

            var dtos = _mapper.Map<List<EmployeePointDto>>(items);

            return new PagedResult<EmployeePointDto>
            {
                Items = dtos,
                TotalCount = totalCount,
                PageNumber = pageNumber,
                PageSize = pageSize
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting all employee points");
            throw;
        }
    }

    // ============================================
    // POINT UPDATES
    // ============================================
    
    public async Task<ApiResponse<EmployeePointDto>> UpdateEmployeePointAsync(
        int employeeId, 
        UpdatePointDto dto)
    {
        await using var transaction = await _context.Database.BeginTransactionAsync();
        
        try
        {
            // Validate employee exists
            var employeeExists = await _employeeRepository.ExistsAsync(employeeId);
            if (!employeeExists)
            {
                return ApiResponse<EmployeePointDto>.ErrorResponse(
                    "Không tìm thấy nhân viên",
                    new List<string> { $"Nhân viên với ID {employeeId} không tồn tại" });
            }

            // Get or create point record
            var point = await _pointRepository.GetByEmployeeIdAsync(employeeId);
            if (point == null)
            {
                return ApiResponse<EmployeePointDto>.ErrorResponse(
                    "Không tìm thấy thông tin điểm",
                    new List<string> { "Nhân viên chưa có thông tin điểm thưởng" });
            }

            // Calculate new point total
            int newTotal = point.PointTotal ?? 0;
            
            switch (dto.Type.ToLower())
            {
                case "earn":
                    newTotal += Math.Abs(dto.Value);
                    break;
                case "redeem":
                    newTotal -= Math.Abs(dto.Value);
                    break;
                case "adjustment":
                    newTotal = dto.Value;
                    break;
            }

            // Validate point total doesn't go negative
            if (newTotal < 0)
            {
                return ApiResponse<EmployeePointDto>.ErrorResponse(
                    "Điểm không hợp lệ",
                    new List<string> { "Tổng điểm không thể âm" });
            }

            // Update point
            point.PointTotal = newTotal;
            point.LastUpdate = DateTime.UtcNow;
            await _pointRepository.UpdateAsync(point);

            // Create transaction history
            var transaction_history = new PointTransactionHistory
            {
                EmployeeId = employeeId,
                Value = dto.Value,
                Type = dto.Type.ToLower(),
                ActorId = dto.ActorId, // ActorId được truyền từ client
                Description = dto.Description ?? $"Cập nhật điểm: {dto.Type}",
                CreatedAt = DateTime.UtcNow
            };
            await _pointRepository.AddTransactionAsync(transaction_history);

            await transaction.CommitAsync();

            // Get updated point with details
            var updatedPoint = await _pointRepository.GetByEmployeeIdAsync(employeeId);
            var resultDto = _mapper.Map<EmployeePointDto>(updatedPoint);

            return ApiResponse<EmployeePointDto>.SuccessResponse(
                resultDto,
                "Cập nhật điểm thành công");
        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync();
            _logger.LogError(ex, "Error updating point for employee {EmployeeId}", employeeId);
            return ApiResponse<EmployeePointDto>.ErrorResponse(
                "Lỗi khi cập nhật điểm",
                new List<string> { ex.Message });
        }
    }

    // ============================================
    // POINT TRANSACTION HISTORY
    // ============================================
    
    public async Task<PagedResult<PointTransactionDto>> GetPointTransactionsAsync(
        int pageNumber,
        int pageSize,
        int? employeeId = null,
        string? type = null,
        DateTime? fromDate = null,
        DateTime? toDate = null)
    {
        try
        {
            var (items, totalCount) = await _pointRepository.GetTransactionsPagedAsync(
                pageNumber, pageSize, employeeId, type, fromDate, toDate);

            var dtos = _mapper.Map<List<PointTransactionDto>>(items);

            return new PagedResult<PointTransactionDto>
            {
                Items = dtos,
                TotalCount = totalCount,
                PageNumber = pageNumber,
                PageSize = pageSize
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting point transactions");
            throw;
        }
    }

    public async Task<List<PointTransactionDto>> GetEmployeeTransactionHistoryAsync(
        int employeeId, 
        int? limit = null)
    {
        try
        {
            var transactions = await _pointRepository.GetTransactionsByEmployeeIdAsync(
                employeeId, limit);

            return _mapper.Map<List<PointTransactionDto>>(transactions);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting transaction history for employee {EmployeeId}", employeeId);
            throw;
        }
    }

    // ============================================
    // POINT CONVERSION RULES
    // ============================================
    
    public async Task<ApiResponse<PointConversionRuleDto>> GetActiveConversionRuleAsync()
    {
        try
        {
            var rule = await _pointRepository.GetActiveConversionRuleAsync();
            
            if (rule == null)
            {
                return ApiResponse<PointConversionRuleDto>.ErrorResponse(
                    "Không tìm thấy quy tắc quy đổi",
                    new List<string> { "Chưa có quy tắc quy đổi điểm nào được kích hoạt" });
            }

            var dto = _mapper.Map<PointConversionRuleDto>(rule);
            
            return ApiResponse<PointConversionRuleDto>.SuccessResponse(
                dto,
                "Lấy quy tắc quy đổi thành công");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting active conversion rule");
            throw;
        }
    }

    public async Task<List<PointConversionRuleDto>> GetAllConversionRulesAsync()
    {
        try
        {
            var rules = await _pointRepository.GetAllConversionRulesAsync();
            return _mapper.Map<List<PointConversionRuleDto>>(rules);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting all conversion rules");
            throw;
        }
    }

    public async Task<ApiResponse<PointConversionRuleDto>> CreateConversionRuleAsync(
        UpsertPointConversionRuleDto dto)
    {
        await using var transaction = await _context.Database.BeginTransactionAsync();
        
        try
        {
            // Deactivate all existing rules
            var existingRules = await _pointRepository.GetAllConversionRulesAsync();
            foreach (var existingRule in existingRules)
            {
                existingRule.IsActive = false;
                await _pointRepository.UpdateConversionRuleAsync(existingRule);
            }

            // Create new rule
            var rule = new PointConversionRule
            {
                PointValue = dto.PointValue,
                MoneyValue = dto.MoneyValue,
                UpdatedBy = dto.UpdatedBy,
                UpdatedAt = DateTime.UtcNow,
                IsActive = true
            };

            var createdRule = await _pointRepository.AddConversionRuleAsync(rule);
            await transaction.CommitAsync();

            // Get rule with details
            var ruleWithDetails = await _pointRepository.GetConversionRuleByIdAsync(createdRule.Id);
            var resultDto = _mapper.Map<PointConversionRuleDto>(ruleWithDetails);

            return ApiResponse<PointConversionRuleDto>.SuccessResponse(
                resultDto,
                "Tạo quy tắc quy đổi thành công");
        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync();
            _logger.LogError(ex, "Error creating conversion rule");
            return ApiResponse<PointConversionRuleDto>.ErrorResponse(
                "Lỗi khi tạo quy tắc quy đổi",
                new List<string> { ex.Message });
        }
    }

    public async Task<ApiResponse<PointConversionRuleDto>> UpdateConversionRuleAsync(
        int id, 
        UpsertPointConversionRuleDto dto)
    {
        await using var transaction = await _context.Database.BeginTransactionAsync();
        
        try
        {
            var rule = await _pointRepository.GetConversionRuleByIdAsync(id);
            
            if (rule == null)
            {
                return ApiResponse<PointConversionRuleDto>.ErrorResponse(
                    "Không tìm thấy quy tắc",
                    new List<string> { $"Quy tắc với ID {id} không tồn tại" });
            }

            // Deactivate all other rules
            var existingRules = await _pointRepository.GetAllConversionRulesAsync();
            foreach (var existingRule in existingRules.Where(r => r.Id != id))
            {
                existingRule.IsActive = false;
                await _pointRepository.UpdateConversionRuleAsync(existingRule);
            }

            // Update rule
            rule.PointValue = dto.PointValue;
            rule.MoneyValue = dto.MoneyValue;
            rule.UpdatedBy = dto.UpdatedBy;
            rule.UpdatedAt = DateTime.UtcNow;
            rule.IsActive = true;

            await _pointRepository.UpdateConversionRuleAsync(rule);
            await transaction.CommitAsync();

            // Get updated rule with details
            var updatedRule = await _pointRepository.GetConversionRuleByIdAsync(id);
            var resultDto = _mapper.Map<PointConversionRuleDto>(updatedRule);

            return ApiResponse<PointConversionRuleDto>.SuccessResponse(
                resultDto,
                "Cập nhật quy tắc quy đổi thành công");
        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync();
            _logger.LogError(ex, "Error updating conversion rule {RuleId}", id);
            return ApiResponse<PointConversionRuleDto>.ErrorResponse(
                "Lỗi khi cập nhật quy tắc quy đổi",
                new List<string> { ex.Message });
        }
    }

    // ============================================
    // POINT TO MONEY CONVERSION
    // ============================================
    
    public async Task<ApiResponse<PointToMoneyHistoryDto>> RequestPointToMoneyConversionAsync(
        int employeeId, 
        RequestPointToMoneyDto dto)
    {
        await using var transaction = await _context.Database.BeginTransactionAsync();
        
        try
        {
            // Validate employee exists
            var employeeExists = await _employeeRepository.ExistsAsync(employeeId);
            if (!employeeExists)
            {
                return ApiResponse<PointToMoneyHistoryDto>.ErrorResponse(
                    "Không tìm thấy nhân viên",
                    new List<string> { $"Nhân viên với ID {employeeId} không tồn tại" });
            }

            // Get employee point
            var point = await _pointRepository.GetByEmployeeIdAsync(employeeId);
            if (point == null || (point.PointTotal ?? 0) < dto.PointRequested)
            {
                return ApiResponse<PointToMoneyHistoryDto>.ErrorResponse(
                    "Điểm không đủ",
                    new List<string> { "Số điểm hiện có không đủ để quy đổi" });
            }

            // Get active conversion rule
            var rule = await _pointRepository.GetActiveConversionRuleAsync();
            if (rule == null)
            {
                return ApiResponse<PointToMoneyHistoryDto>.ErrorResponse(
                    "Không thể quy đổi",
                    new List<string> { "Hiện tại chưa có quy tắc quy đổi điểm" });
            }

            // Calculate money
            decimal moneyReceived = (decimal)dto.PointRequested / rule.PointValue * rule.MoneyValue;

            // Create conversion request
            var history = new PointToMoneyHistory
            {
                EmployeeId = employeeId,
                PointRequested = dto.PointRequested,
                MoneyReceived = moneyReceived,
                Status = "pending",
                CreatedAt = DateTime.UtcNow
            };

            var createdHistory = await _pointRepository.AddPointToMoneyHistoryAsync(history);
            await transaction.CommitAsync();

            // Get history with details
            var historyWithDetails = await _pointRepository.GetPointToMoneyHistoryByIdAsync(createdHistory.Id);
            var resultDto = _mapper.Map<PointToMoneyHistoryDto>(historyWithDetails);

            return ApiResponse<PointToMoneyHistoryDto>.SuccessResponse(
                resultDto,
                "Gửi yêu cầu quy đổi điểm thành công");
        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync();
            _logger.LogError(ex, "Error requesting point conversion for employee {EmployeeId}", employeeId);
            return ApiResponse<PointToMoneyHistoryDto>.ErrorResponse(
                "Lỗi khi gửi yêu cầu quy đổi",
                new List<string> { ex.Message });
        }
    }

    public async Task<PagedResult<PointToMoneyHistoryDto>> GetPointToMoneyHistoryAsync(
        int pageNumber,
        int pageSize,
        int? employeeId = null,
        string? status = null)
    {
        try
        {
            var (items, totalCount) = await _pointRepository.GetPointToMoneyHistoryPagedAsync(
                pageNumber, pageSize, employeeId, status);

            var dtos = _mapper.Map<List<PointToMoneyHistoryDto>>(items);

            return new PagedResult<PointToMoneyHistoryDto>
            {
                Items = dtos,
                TotalCount = totalCount,
                PageNumber = pageNumber,
                PageSize = pageSize
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting point to money history");
            throw;
        }
    }

    public async Task<ApiResponse<PointToMoneyHistoryDto>> ProcessPointToMoneyRequestAsync(
        int requestId, 
        ProcessPointToMoneyDto dto,
        int? processorId = null)
    {
        await using var transaction = await _context.Database.BeginTransactionAsync();
        
        try
        {
            // Get request
            var history = await _pointRepository.GetPointToMoneyHistoryByIdAsync(requestId);
            
            if (history == null)
            {
                return ApiResponse<PointToMoneyHistoryDto>.ErrorResponse(
                    "Không tìm thấy yêu cầu",
                    new List<string> { $"Yêu cầu với ID {requestId} không tồn tại" });
            }

            if (history.Status != "pending")
            {
                return ApiResponse<PointToMoneyHistoryDto>.ErrorResponse(
                    "Yêu cầu đã được xử lý",
                    new List<string> { "Không thể xử lý yêu cầu đã được duyệt hoặc từ chối" });
            }

            // If approved, deduct points
            if (dto.Status == "approved")
            {
                var point = await _pointRepository.GetByEmployeeIdAsync(history.EmployeeId);
                
                if (point == null || (point.PointTotal ?? 0) < history.PointRequested)
                {
                    return ApiResponse<PointToMoneyHistoryDto>.ErrorResponse(
                        "Điểm không đủ",
                        new List<string> { "Nhân viên không còn đủ điểm để quy đổi" });
                }

                point.PointTotal = (point.PointTotal ?? 0) - history.PointRequested;
                point.LastUpdate = DateTime.UtcNow;
                await _pointRepository.UpdateAsync(point);

                // Create transaction history
                var transactionHistory = new PointTransactionHistory
                {
                    EmployeeId = history.EmployeeId,
                    Value = -history.PointRequested,
                    Type = "redeem",
                    ActorId = processorId,
                    Description = $"Quy đổi {history.PointRequested} điểm sang {history.MoneyReceived:N0} VNĐ",
                    CreatedAt = DateTime.UtcNow
                };
                await _pointRepository.AddTransactionAsync(transactionHistory);
            }

            // Update history status
            history.Status = dto.Status;
            history.ProcessedAt = DateTime.UtcNow;
            await _pointRepository.UpdatePointToMoneyHistoryAsync(history);

            await transaction.CommitAsync();

            // Get updated history with details
            var updatedHistory = await _pointRepository.GetPointToMoneyHistoryByIdAsync(requestId);
            var resultDto = _mapper.Map<PointToMoneyHistoryDto>(updatedHistory);

            return ApiResponse<PointToMoneyHistoryDto>.SuccessResponse(
                resultDto,
                dto.Status == "approved" ? "Duyệt yêu cầu thành công" : "Từ chối yêu cầu thành công");
        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync();
            _logger.LogError(ex, "Error processing point conversion request {RequestId}", requestId);
            return ApiResponse<PointToMoneyHistoryDto>.ErrorResponse(
                "Lỗi khi xử lý yêu cầu",
                new List<string> { ex.Message });
        }
    }

    // ============================================
    // STATISTICS
    // ============================================
    
    public async Task<PointStatisticsDto> GetPointStatisticsAsync()
    {
        try
        {
            var totalEmployees = await _pointRepository.GetTotalEmployeesWithPointsAsync();
            var totalPoints = await _pointRepository.GetTotalPointsInSystemAsync();
            var topEmployee = await _pointRepository.GetTopEmployeeByPointsAsync();
            var pendingRequests = await _pointRepository.GetPendingConversionRequestsCountAsync();
            var transactionsByType = await _pointRepository.GetTransactionCountsByTypeAsync();

            return new PointStatisticsDto
            {
                TotalEmployeesWithPoints = totalEmployees,
                TotalPointsInSystem = totalPoints,
                AveragePointsPerEmployee = totalEmployees > 0 ? (double)totalPoints / totalEmployees : 0,
                TopEmployee = topEmployee != null ? _mapper.Map<EmployeePointDto>(topEmployee) : null,
                PendingConversionRequests = pendingRequests,
                TransactionsByType = transactionsByType
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting point statistics");
            throw;
        }
    }
}