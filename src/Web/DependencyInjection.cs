using System.Text;
using Azure.Identity;
using EbayClone.Application.Common.Interfaces;
using EbayClone.Infrastructure.Data;
using EbayClone.Infrastructure.Services;
using EbayClone.Web.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;


namespace Microsoft.Extensions.DependencyInjection;

public static class DependencyInjection
{
    public static void AddWebServices(this IHostApplicationBuilder builder)
    {
        builder.Services.AddDatabaseDeveloperPageExceptionFilter();

        builder.Services.AddScoped<IUser, CurrentUser>();

        builder.Services.AddHttpContextAccessor();
        builder.Services.AddHealthChecks()
            .AddDbContextCheck<ApplicationDbContext>();

        builder.Services.AddExceptionHandler<CustomExceptionHandler>();

        builder.Services.AddRazorPages();

        // Customise default API behaviour
        builder.Services.Configure<ApiBehaviorOptions>(options =>
            options.SuppressModelStateInvalidFilter = true);

        builder.Services.AddEndpointsApiExplorer();
        builder.Services.AddScoped<IJwtService, JwtService>();
        builder.Services.AddScoped<IEmailService, EmailService>();

        // Configure NSwag to generate OpenAPI from Minimal API endpoints
        builder.Services.AddOpenApiDocument(configure =>
        {
            configure.Title = "EbayClone API";
            configure.Version = "v1";   
        });

        var jwtSettings = builder.Configuration.GetSection("Jwt");
        var key = Encoding.UTF8.GetBytes(jwtSettings["Key"]!);

        builder.Services.AddAuthentication(options =>
        {
            options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
            options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
        })
        .AddJwtBearer(options =>
        {
            options.TokenValidationParameters = new TokenValidationParameters
            {
                ValidateIssuer = true,
                ValidateAudience = true,
                ValidateLifetime = true,
                ValidateIssuerSigningKey = true,
                ValidIssuer = jwtSettings["Issuer"],
                ValidAudience = jwtSettings["Audience"],
                IssuerSigningKey = new SymmetricSecurityKey(key)
            };
            //đọc token từ cookie
            options.Events = new JwtBearerEvents
            {
                OnMessageReceived = ctx =>
                {
                    ctx.Token = ctx.Request.Cookies["auth_token"];
                    return Task.CompletedTask;
                }
            };
        });

        builder.Services.AddCors(options =>
        {
            options.AddPolicy("FrontendPolicy", policy =>
            {
                policy
                      // Dev: React chạy riêng ở localhost
                      .WithOrigins(
                          "http://localhost:3000",
                          "http://localhost:5000",
                          "http://localhost:5001",
                          "https://localhost:5001",
                          "https://localhost:44447"
                      )
                      .AllowAnyHeader()
                      .AllowAnyMethod()
                      .AllowCredentials(); // ✅ bắt buộc để cookie hoạt động
            });
        });
    }

    public static void AddKeyVaultIfConfigured(this IHostApplicationBuilder builder)
    {
        var keyVaultUri = builder.Configuration["AZURE_KEY_VAULT_ENDPOINT"];
        if (!string.IsNullOrWhiteSpace(keyVaultUri))
        {
            builder.Configuration.AddAzureKeyVault(
                new Uri(keyVaultUri),
                new DefaultAzureCredential());
        }
    }
}
