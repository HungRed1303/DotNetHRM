using HRMApi.Services;

namespace HRMApi.BackgroundServices;

public class MonthlyPointAllocationWorker : BackgroundService
{
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<MonthlyPointAllocationWorker> _logger;
    private Timer? _timer;

    public MonthlyPointAllocationWorker(
        IServiceProvider serviceProvider,
        ILogger<MonthlyPointAllocationWorker> logger)
    {
        _serviceProvider = serviceProvider;
        _logger = logger;
    }

    protected override Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("Monthly Point Allocation Worker is starting");

        // Calculate time until next run (first day of next month at 00:00)
        var now = DateTime.UtcNow;
        var nextRun = GetNextRunTime(now);
        var delay = nextRun - now;

        _logger.LogInformation(
            "Next monthly point allocation will run at {NextRun} UTC (in {Delay})",
            nextRun, delay);

        // Schedule the timer
        _timer = new Timer(
            DoWork,
            null,
            delay,
            TimeSpan.FromDays(1)); // Check daily

        return Task.CompletedTask;
    }

    private async void DoWork(object? state)
    {
        _logger.LogInformation("Monthly Point Allocation Worker is checking if job should run");

        using var scope = _serviceProvider.CreateScope();
        var monthlyPointService = scope.ServiceProvider
            .GetRequiredService<IMonthlyPointService>();

        try
        {
            // Check if already run this month
            var hasRun = await monthlyPointService.HasRunThisMonthAsync();
            
            if (hasRun)
            {
                _logger.LogInformation("Monthly point allocation has already run this month");
                return;
            }

            // Check if it's the first day of the month
            var now = DateTime.UtcNow;
            if (now.Day != 1)
            {
                _logger.LogInformation("Not the first day of month, skipping");
                return;
            }

            _logger.LogInformation("Running monthly point allocation job");

            var result = await monthlyPointService.AllocateMonthlyPointsAsync();

            if (result.Success)
            {
                _logger.LogInformation(
                    "Monthly point allocation completed successfully: {Message}",
                    result.Message);
            }
            else
            {
                _logger.LogWarning(
                    "Monthly point allocation failed: {Message}",
                    result.Message);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error in Monthly Point Allocation Worker");
        }
    }

    private DateTime GetNextRunTime(DateTime now)
    {
        // Get first day of next month at 00:00 UTC
        var year = now.Month == 12 ? now.Year + 1 : now.Year;
        var month = now.Month == 12 ? 1 : now.Month + 1;
        
        return new DateTime(year, month, 1, 0, 0, 0, DateTimeKind.Utc);
    }

    public override void Dispose()
    {
        _timer?.Dispose();
        base.Dispose();
    }
}