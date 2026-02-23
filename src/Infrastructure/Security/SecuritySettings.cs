using System;
using System.Collections.Generic;
using System.Text;

namespace EbayClone.Infrastructure.Security;
public class SecuritySettings
{
    public List<string> AllowedIps { get; set; } = new();
}
