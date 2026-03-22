using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Linq;

namespace EbayClone.Web.Infrastructure;

public interface IActiveConnectionTracker
{
    void RecordActivity(string ipAddress);
    IEnumerable<ActiveConnection> GetActiveConnections(TimeSpan timeframe);
}

public class ActiveConnection
{
    public string IpAddress { get; set; } = string.Empty;
    public DateTime LastSeen { get; set; }
}

public class ActiveConnectionTracker : IActiveConnectionTracker
{
    // A thread-safe dictionary to maintain the IP addresses and latest timestamps
    private readonly ConcurrentDictionary<string, DateTime> _activeIps = new();

    public void RecordActivity(string ipAddress)
    {
        if (!string.IsNullOrWhiteSpace(ipAddress))
        {
            _activeIps.AddOrUpdate(ipAddress, DateTime.UtcNow, (key, oldValue) => DateTime.UtcNow);
            
            // Cleanup old records occasionally to avoid memory leaks
            if (_activeIps.Count % 100 == 0)
            {
                CleanupOldRecords();
            }
        }
    }

    public IEnumerable<ActiveConnection> GetActiveConnections(TimeSpan timeframe)
    {
        var cutoff = DateTime.UtcNow.Subtract(timeframe);
        return _activeIps
            .Where(x => x.Value >= cutoff)
            .Select(x => new ActiveConnection { IpAddress = x.Key, LastSeen = x.Value })
            .OrderByDescending(x => x.LastSeen);
    }
    
    private void CleanupOldRecords()
    {
        var cutoff = DateTime.UtcNow.AddHours(-1); // Keep connections from the last 1 hour max in memory.
        var keysToRemove = _activeIps.Where(x => x.Value < cutoff).Select(x => x.Key).ToList();
        
        foreach(var key in keysToRemove)
        {
            _activeIps.TryRemove(key, out _);
        }
    }
}
