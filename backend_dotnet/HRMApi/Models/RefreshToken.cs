using System;
using System.Collections.Generic;
using System.Net;

namespace HRMApi.Models;

public partial class RefreshToken
{
    public int Id { get; set; }

    public int UserId { get; set; }

    public string Token { get; set; } = null!;

    public DateTime ExpiresAt { get; set; }

    public DateTime? CreatedAt { get; set; }

    public bool? IsRevoked { get; set; }

    public DateTime? RevokedAt { get; set; }

    public string? DeviceInfo { get; set; }

    public IPAddress? IpAddress { get; set; }

    public virtual UserAccount User { get; set; } = null!;
}
