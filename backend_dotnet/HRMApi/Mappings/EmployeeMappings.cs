using AutoMapper;
using HRMApi.DTOs;
using HRMApi.Models;

namespace HRMApi.Mappings;

public class EmployeeMappingProfile : Profile
{
    public EmployeeMappingProfile()
    {
        // Employee -> EmployeeListDto
        CreateMap<Employee, EmployeeListDto>()
            .ForMember(dest => dest.RoleName, opt => opt.MapFrom(src => src.Role.Name))
            .ForMember(dest => dest.DepartmentName, opt => opt.MapFrom(src => src.Department != null ? src.Department.Name : null));

        // Employee -> EmployeeDetailDto
        CreateMap<Employee, EmployeeDetailDto>()
            .ForMember(dest => dest.RoleName, opt => opt.MapFrom(src => src.Role.Name))
            .ForMember(dest => dest.DepartmentName, opt => opt.MapFrom(src => src.Department != null ? src.Department.Name : null));

        // CreateEmployeeDto -> Employee
        CreateMap<CreateEmployeeDto, Employee>()
            .ForMember(dest => dest.Id, opt => opt.Ignore())
            .ForMember(dest => dest.Status, opt => opt.MapFrom(src => "active"))
            .ForMember(dest => dest.CreatedAt, opt => opt.MapFrom(src => DateTime.UtcNow))
            .ForMember(dest => dest.UpdatedAt, opt => opt.MapFrom(src => DateTime.UtcNow))
            .ForMember(dest => dest.Role, opt => opt.Ignore())
            .ForMember(dest => dest.Department, opt => opt.Ignore())
            .ForMember(dest => dest.Activities, opt => opt.Ignore())
            .ForMember(dest => dest.ApprovalHistories, opt => opt.Ignore())
            .ForMember(dest => dest.Attendances, opt => opt.Ignore())
            .ForMember(dest => dest.Departments, opt => opt.Ignore())
            .ForMember(dest => dest.Participations, opt => opt.Ignore())
            .ForMember(dest => dest.Point, opt => opt.Ignore())
            .ForMember(dest => dest.PointConversionRules, opt => opt.Ignore())
            .ForMember(dest => dest.PointToMoneyHistories, opt => opt.Ignore())
            .ForMember(dest => dest.PointTransactionHistoryActors, opt => opt.Ignore())
            .ForMember(dest => dest.PointTransactionHistoryEmployees, opt => opt.Ignore())
            .ForMember(dest => dest.Requests, opt => opt.Ignore())
            .ForMember(dest => dest.UserAccount, opt => opt.Ignore());

        // UpdateEmployeeDto -> Employee
        CreateMap<UpdateEmployeeDto, Employee>()
            .ForMember(dest => dest.Id, opt => opt.Ignore())
            .ForMember(dest => dest.Cccd, opt => opt.Ignore())
            .ForMember(dest => dest.TaxCode, opt => opt.Ignore())
            .ForMember(dest => dest.Email, opt => opt.Ignore())
            .ForMember(dest => dest.RoleId, opt => opt.Ignore())
            .ForMember(dest => dest.JoinDate, opt => opt.Ignore())
            .ForMember(dest => dest.CreatedAt, opt => opt.MapFrom(src => DateTime.UtcNow))
            .ForMember(dest => dest.UpdatedAt, opt => opt.MapFrom(src => DateTime.UtcNow))
            .ForMember(dest => dest.Role, opt => opt.Ignore())
            .ForMember(dest => dest.Department, opt => opt.Ignore())
            .ForMember(dest => dest.Activities, opt => opt.Ignore())
            .ForMember(dest => dest.ApprovalHistories, opt => opt.Ignore())
            .ForMember(dest => dest.Attendances, opt => opt.Ignore())
            .ForMember(dest => dest.Departments, opt => opt.Ignore())
            .ForMember(dest => dest.Participations, opt => opt.Ignore())
            .ForMember(dest => dest.Point, opt => opt.Ignore())
            .ForMember(dest => dest.PointConversionRules, opt => opt.Ignore())
            .ForMember(dest => dest.PointToMoneyHistories, opt => opt.Ignore())
            .ForMember(dest => dest.PointTransactionHistoryActors, opt => opt.Ignore())
            .ForMember(dest => dest.PointTransactionHistoryEmployees, opt => opt.Ignore())
            .ForMember(dest => dest.Requests, opt => opt.Ignore())
            .ForMember(dest => dest.UserAccount, opt => opt.Ignore())
            .ForAllMembers(opts => opts.Condition((src, dest, srcMember) => srcMember != null));
    }
}