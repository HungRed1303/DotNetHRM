using AutoMapper;
using HRMApi.DTOs;
using HRMApi.Models;

namespace HRMApi.Mappings;

public class MonthlyPointMappingProfile : Profile
{
    public MonthlyPointMappingProfile()
    {
        // MonthlyPointRule -> MonthlyPointRuleDto
        CreateMap<MonthlyPointRule, MonthlyPointRuleDto>()
            .ForMember(dest => dest.RoleName, opt => opt.MapFrom(src => src.Role.Name))
            .ForMember(dest => dest.IsActive, opt => opt.MapFrom(src => src.IsActive ?? false));

        // MonthlyPointAllocationHistory -> MonthlyPointAllocationHistoryDto
        CreateMap<MonthlyPointAllocationHistory, MonthlyPointAllocationHistoryDto>()
            .ForMember(dest => dest.TotalEmployeesProcessed, 
                opt => opt.MapFrom(src => src.TotalEmployeesProcessed ?? 0))
            .ForMember(dest => dest.TotalPointsAllocated, 
                opt => opt.MapFrom(src => src.TotalPointsAllocated ?? 0))
            .ForMember(dest => dest.StatusDisplay, opt => opt.MapFrom(src => GetStatusDisplay(src.Status)));
    }

    private static string GetStatusDisplay(string? status)
    {
        return status?.ToLower() switch
        {
            "completed" => "Hoàn thành",
            "failed" => "Thất bại",
            "partial" => "Một phần",
            _ => status ?? "Không xác định"
        };
    }
}