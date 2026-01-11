using HRMApi.Dtos;
using HRMApi.Repositories;

namespace HRMApi.Services;

public class ActivityService : IActivityService
{
    private readonly IActivityRepository _activityRepository;

    public ActivityService(IActivityRepository activityRepository)
    {
        _activityRepository = activityRepository;
    }

    public async Task<List<CompletedActivityDto>> GetCompletedActivitiesAsync()
    {
        return await _activityRepository.GetCompletedActivitiesAsync();
    }
}
