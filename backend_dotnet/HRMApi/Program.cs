using HRMApi.Data;
using HRMApi.Repositories;
using Microsoft.EntityFrameworkCore;
using HRMApi.Services;
using DotNetEnv;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using HRMApi.BackgroundServices;

var builder = WebApplication.CreateBuilder(args);

// Load .env
Env.Load();

// ========== Fix JWT Claim Mapping ==========
JwtSecurityTokenHandler.DefaultInboundClaimTypeMap.Clear();
JwtSecurityTokenHandler.DefaultOutboundClaimTypeMap.Clear();

// ========== Add Controllers ==========
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.ReferenceHandler = System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles;
        options.JsonSerializerOptions.DefaultIgnoreCondition = System.Text.Json.Serialization.JsonIgnoreCondition.WhenWritingNull;
    });

// ========== Database ==========
builder.Services.AddDbContext<HrmDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

// ========== Repository & Service ==========
builder.Services.AddScoped<IEmployeeRepository, EmployeeRepository>();
builder.Services.AddScoped<IPointRepository, PointRepository>();
builder.Services.AddScoped<IEmployeeService, EmployeeService>();
builder.Services.AddScoped<IPointService, PointService>();
builder.Services.AddScoped<IMonthlyPointRepository, MonthlyPointRepository>();
builder.Services.AddScoped<IMonthlyPointService, MonthlyPointService>();
builder.Services.AddAutoMapper(typeof(Program).Assembly);

// Register Background Services
builder.Services.AddHostedService<MonthlyPointAllocationWorker>();
// ========== CORS ==========
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

// ========== JWT Authentication ==========
var jwtSecret = builder.Configuration["Jwt:Secret"] 
                ?? "mysecret_nguyenchidanh_mysecret_nguyenchidanh";

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = false,
        ValidateAudience = false,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSecret)),
        ClockSkew = TimeSpan.FromMinutes(5),
        RoleClaimType = "role"
    };

    // LOG HẾT CLAIM ĐỂ DEBUG
    options.Events = new JwtBearerEvents
    {
        OnTokenValidated = context =>
        {
            Console.WriteLine("================ TOKEN CLAIMS ================");
            foreach (var claim in context.Principal.Claims)
            {
                Console.WriteLine($"{claim.Type} = {claim.Value}");
            }
            Console.WriteLine("==============================================");

            return Task.CompletedTask;
        }
    };
});


// var builder = WebApplication.CreateBuilder(args);

builder.Services.AddAuthorization(options =>
{
    // Danh sách permission bạn muốn hỗ trợ
    var permissions = new[]
    {
        "employee:create",
        "employee:update",
        "employee:delete",
        "employee:list",
        "employee:view",
        "employee:statistics",

        "department:create",
        "department:update",
        "department:view",
        
        "point:view",
        "point:update",
        "point:list"
    };

    foreach (var permission in permissions)
    {
        options.AddPolicy(permission, policy =>
            policy.RequireClaim("permissions", permission));
    }
});

// Swagger
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// ========== Swagger ==========
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseCors("AllowAll");

// ========== Authentication & Authorization ==========
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

// ========== Optional: Ensure DB created ==========
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    try
    {
        var context = services.GetRequiredService<HrmDbContext>();
        context.Database.EnsureCreated();
    }
    catch (Exception ex)
    {
        var logger = services.GetRequiredService<ILogger<Program>>();
        logger.LogError(ex, "Error ensuring DB is created.");
    }
}

app.Run();
