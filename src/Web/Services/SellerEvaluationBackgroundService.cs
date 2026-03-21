using EbayClone.Application.Sellers.Commands.EvaluateSellerLevels;
using MediatR;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace EbayClone.Web.Services;

public class SellerEvaluationBackgroundService : BackgroundService
{
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<SellerEvaluationBackgroundService> _logger;

    public SellerEvaluationBackgroundService(IServiceProvider serviceProvider, ILogger<SellerEvaluationBackgroundService> logger)
    {
        _serviceProvider = serviceProvider;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("SellerEvaluationBackgroundService is starting.");

        while (!stoppingToken.IsCancellationRequested)
        {
            // Evaluate on the 20th of each month. 
            // For testing/development, we might run this more frequently, but we'll sleep for 24 hours.
            if (DateTime.UtcNow.Day == 20 || bool.TryParse(Environment.GetEnvironmentVariable("FORCE_EVALUATION"), out bool f) && f)
            {
                try
                {
                    using var scope = _serviceProvider.CreateScope();
                    var mediator = scope.ServiceProvider.GetRequiredService<ISender>();
                    
                    var updated = await mediator.Send(new EvaluateSellerLevelsCommand(), stoppingToken);
                    
                    _logger.LogInformation("Evaluated seller levels. Updated {Count} sellers.", updated);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error occurred executing EvaluateSellerLevelsCommand.");
                }
            }

            // Wait 24 hours before checking again
            await Task.Delay(TimeSpan.FromHours(24), stoppingToken);
        }
    }
}
