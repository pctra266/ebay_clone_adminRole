using EbayClone.Infrastructure.Data;
using System;
using EbayClone.Application.Common.Interfaces;
using EbayClone.Infrastructure.Services;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);


// Add services to the container.
builder.AddKeyVaultIfConfigured();
builder.AddApplicationServices();
builder.AddInfrastructureServices();
builder.AddWebServices();

var app = builder.Build();

// Run DB migration + seeder on startup (idempotent — safe to run every time)
await app.InitialiseDatabaseAsync();

// ── Environment-specific middleware ──────────────────────────
if (app.Environment.IsDevelopment())
{
    // Dev: nothing extra needed, seeder already ran above
}
else
{
    app.UseHsts();
}

// ── Core middleware (ORDER MATTERS) ──────────────────────────
app.UseHealthChecks("/health");
app.UseHttpsRedirection();
app.UseStaticFiles();          // serve React build from wwwroot
app.UseExceptionHandler(options => { });
app.UseCors("FrontendPolicy");
app.UseRateLimiter();          // Rate Limiting — TRƯỚC authentication
app.UseAuthentication();
app.UseAuthorization();

// ── API endpoints ────────────────────────────────────────────
app.MapRazorPages();

// Register your endpoint groups
app.MapEndpoints();

// ── OpenAPI / Swagger UI ─────────────────────────────────────
app.UseOpenApi();
app.UseSwaggerUi(settings =>
{
    settings.Path = "/api";
});

// ── SPA fallback (MUST be last — catches all unmatched routes)
app.MapFallbackToFile("index.html");
string hash = BCrypt.Net.BCrypt.HashPassword("Admin123!");
Console.WriteLine(hash);
app.Run();
public partial class Program { }
