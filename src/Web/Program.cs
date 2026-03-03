using System;
using EbayClone.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.AddKeyVaultIfConfigured();
builder.AddApplicationServices();
builder.AddInfrastructureServices();
builder.AddWebServices();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    await app.InitialiseDatabaseAsync();
}
else
{
    // The default HSTS value is 30 days. You may want to change this for production scenarios, see https://aka.ms/aspnetcore-hsts.
    app.UseHsts();
}

app.UseHealthChecks("/health");
app.UseHttpsRedirection();
app.UseStaticFiles();

<<<<<<< HEAD
app.UseExceptionHandler(options => { });
app.UseAuthentication();
app.UseAuthorization();

app.MapRazorPages();

// Register your endpoint groups
=======
app.UseOpenApi();

app.UseSwaggerUi(settings =>
{
    settings.Path = "/api";
});

app.MapRazorPages();

app.MapFallbackToFile("index.html");

app.UseExceptionHandler(options => { });

app.UseAuthentication();

app.UseAuthorization();

>>>>>>> main
app.MapEndpoints();

// NSwag OpenAPI and Swagger UI
app.UseOpenApi();
app.UseSwaggerUi(settings =>
{
    settings.Path = "/api";
});

// Keep fallback last so it doesn't catch API routes
app.MapFallbackToFile("index.html");

app.Run();
public partial class Program { }
