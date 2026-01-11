using HRMApi.Dtos;

namespace HRMApi.Services;

public interface IActivityService
{
    Task<List<CompletedActivityDto>> GetCompletedActivitiesAsync();
}
