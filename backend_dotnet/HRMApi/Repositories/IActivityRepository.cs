using HRMApi.Dtos;

namespace HRMApi.Repositories;

public interface IActivityRepository
{
    Task<List<CompletedActivityDto>> GetCompletedActivitiesAsync();
}
