# Rate Limit Configuration

## Overview

This document describes the Traefik rate limiting configuration for the Forseti platform, optimized for approximately **100 simultaneous users**.

## Rate Limit Algorithm

Traefik uses a **token bucket algorithm** for rate limiting:
- **average**: Sustained request rate (requests per second) - tokens refill at this rate
- **burst**: Maximum requests allowed in a short burst - bucket capacity

## Current Configuration

### API and WebSocket (`api-ratelimit`)
- **Average:** 100 requests/second
- **Burst:** 300 requests/second
- **Applied to:** 
  - API endpoints (`api.forsetijudge.com`)
  - WebSocket endpoints (`ws.forsetijudge.com`)

**Rationale:**
- Supports 100 users with ~1 request per user per second sustained
- Burst capacity handles peak loads during:
  - Contest start (users loading problems simultaneously)
  - Contest end (final submission rush)
  - Leaderboard updates and clarification requests
- 3x burst multiplier provides headroom for legitimate traffic spikes

### WebApp (`webapp-ratelimit`)
- **Average:** 100 requests/second
- **Burst:** 300 requests/second
- **Applied to:** Main web application (`forsetijudge.com`)

**Rationale:**
- Handles static content and page loads
- Burst capacity for multiple simultaneous page loads
- Consistent with API rate limits

### Grafana (`grafana-ratelimit`)
- **Average:** 100 requests/second
- **Burst:** 200 requests/second
- **Applied to:** Monitoring dashboard (`grafana.forsetijudge.com`)

**Rationale:**
- Used by administrators only (limited users)
- Current limits are adequate for monitoring use case

### Alloy (`alloy-ratelimit`)
- **Average:** 100 requests/second
- **Burst:** 200 requests/second
- **Applied to:** Telemetry collection endpoint (`alloy.forsetijudge.com`)

**Rationale:**
- Used for telemetry data collection
- Current limits are adequate for observability infrastructure

## Usage Patterns

### Contest Start (First 5-10 minutes)
- All 100 users load contest page
- All users fetch problem list
- Users reading problem statements
- **Expected load:** 10-15 req/s with bursts up to 50 req/s

### Active Contest Period
- Users reading problems: ~1-2 req/s
- Code submissions: ~10-20 submissions/minute
- Leaderboard updates via WebSocket (minimal HTTP)
- Clarification requests: ~1-2/minute
- **Expected load:** 3-5 req/s sustained

### Contest End (Last 5 minutes)
- Rush of final submissions
- Multiple users checking leaderboard
- **Expected load:** 8-12 req/s with occasional bursts

## Monitoring

Monitor these metrics to validate rate limit effectiveness:

1. **Rate limit hits:** Traefik metrics show rejected requests
2. **API response times:** Should remain low under load
3. **User experience:** No legitimate requests should be rejected
4. **Security:** Should prevent DoS attacks while allowing normal traffic

## Adjusting Rate Limits

If you need to adjust rate limits:

1. Edit `deployment/production/stack.yaml`
2. Modify the relevant `traefik.http.middlewares.*-ratelimit.ratelimit.*` labels
3. Update the stack: `./forseti system update forseti_<service>`

### Recommended Adjustments

**For more users (200+):**
- API: average=200, burst=600
- WebApp: average=200, burst=600

**For fewer users (50):**
- API: average=50, burst=150
- WebApp: average=50, burst=150

**For high-burst scenarios (e.g., short contests):**
- Increase burst multiplier to 5x (e.g., average=100, burst=500)

## Security Considerations

- Rate limits protect against DoS attacks
- Limits are set per-service, not per-user (application-level rate limiting may be added separately)
- WebSocket connections count as one HTTP request for the initial handshake
- Sticky sessions ensure WebSocket connections maintain state
