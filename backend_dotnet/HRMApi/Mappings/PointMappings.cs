using AutoMapper;
using HRMApi.DTOs;
using HRMApi.Models;

namespace HRMApi.Mappings;

public class PointMappingProfile : Profile
{
    public PointMappingProfile()
    {
        // Point -> EmployeePointDto
        CreateMap<Point, EmployeePointDto>()
            .ForMember(dest => dest.EmployeeName, opt => opt.MapFrom(src => src.Employee.Fullname))
            .ForMember(dest => dest.Email, opt => opt.MapFrom(src => src.Employee.Email));

        // PointTransactionHistory -> PointTransactionDto
        CreateMap<PointTransactionHistory, PointTransactionDto>()
            .ForMember(dest => dest.EmployeeName, opt => opt.MapFrom(src => src.Employee.Fullname))
            .ForMember(dest => dest.ActorName, opt => opt.MapFrom(src => src.Actor != null ? src.Actor.Fullname : null))
            .ForMember(dest => dest.TypeDisplay, opt => opt.MapFrom(src => GetTypeDisplay(src.Type)));

        // PointConversionRule -> PointConversionRuleDto
        CreateMap<PointConversionRule, PointConversionRuleDto>()
            .ForMember(dest => dest.UpdatedByName, opt => opt.MapFrom(src =>
                src.UpdatedByNavigation != null ? src.UpdatedByNavigation.Fullname : null))
            .ForMember(dest => dest.IsActive, opt => opt.MapFrom(src => src.IsActive ?? false));

        // PointToMoneyHistory -> PointToMoneyHistoryDto
        CreateMap<PointToMoneyHistory, PointToMoneyHistoryDto>()
            .ForMember(dest => dest.EmployeeName, opt => opt.MapFrom(src => src.Employee.Fullname))
            .ForMember(dest => dest.Email, opt => opt.MapFrom(src => src.Employee.Email))
            .ForMember(dest => dest.StatusDisplay, opt => opt.MapFrom(src => GetStatusDisplay(src.Status)));
    }

    private static string GetTypeDisplay(string type)
    {
        return type?.ToLower() switch
        {
            "earn" => "Thêm điểm",
            "redeem" => "Dùng điểm",
            "transfer" => "Chuyển điểm",
            "adjustment" => "Điều chỉnh",
            _ => type ?? "Không xác định"
        };
    }

    private static string GetStatusDisplay(string? status)
    {
        return status?.ToLower() switch
        {
            "pending" => "Đang chờ",
            "approved" => "Đã duyệt",
            "rejected" => "Đã từ chối",
            _ => status ?? "Không xác định"
        };
    }
}