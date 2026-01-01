// ============================================
// Mappings/ParticipationMappings.cs
// ============================================
using AutoMapper;
using HRMApi.DTOs;
using HRMApi.Models;
using System.Text.Json;

namespace HRMApi.Mappings;

public class ParticipationMappingProfile : Profile
{
    public ParticipationMappingProfile()
    {
        CreateMap<Participation, ParticipationDto>()
            .ForMember(dest => dest.ActivityName, opt => opt.MapFrom(src => src.Activity.Name))
            .ForMember(dest => dest.EmployeeName, opt => opt.MapFrom(src => src.Employee.Fullname))
            .ForMember(dest => dest.Description, opt => opt.MapFrom(src => src.Activity.Description))
            .ForMember(dest => dest.Result, opt => opt.MapFrom(src => 
                src.Result != null ? JsonToDictionary(src.Result) : null));
    }

    private static Dictionary<string, object?>? JsonToDictionary(JsonDocument jsonDoc)
    {
        if (jsonDoc == null || jsonDoc.RootElement.ValueKind != JsonValueKind.Object)
            return null;

        var dictionary = new Dictionary<string, object?>();
        
        foreach (var property in jsonDoc.RootElement.EnumerateObject())
        {
            dictionary[property.Name] = GetValue(property.Value);
        }
        
        return dictionary;
    }

    private static object? GetValue(JsonElement element)
    {
        return element.ValueKind switch
        {
            JsonValueKind.String => element.GetString(),
            JsonValueKind.Number => element.TryGetInt64(out var l) ? l : element.GetDouble(),
            JsonValueKind.True => true,
            JsonValueKind.False => false,
            JsonValueKind.Null => null,
            JsonValueKind.Array => element.EnumerateArray().Select(GetValue).ToList(),
            JsonValueKind.Object => JsonToDictionary(JsonDocument.Parse(element.GetRawText())),
            _ => element.GetRawText()
        };
    }
}