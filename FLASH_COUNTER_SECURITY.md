# Flash Counter Security Implementation

## Overview
The flash counter API endpoint has been secured with multiple layers of protection to prevent unauthorized tampering.

## Security Measures

### 1. Token-Based Authentication
- **One-time tokens**: Each flash operation requires a fresh token
- **Token validity**: Tokens expire after 5 minutes
- **Single-use**: Tokens can only be used once and are immediately invalidated
- **IP binding**: Tokens are bound to the requesting IP address to prevent token theft

### 2. Origin Validation
- Validates that requests come from the same origin (same domain)
- Checks both `Origin` and `Referer` headers
- Prevents cross-site request forgery (CSRF) attacks

### 3. Rate Limiting
- **Per-IP limiting**: Maximum 10 increments per minute per IP address
- **Automatic cleanup**: Old rate limit entries are automatically cleaned up
- **DoS protection**: Prevents spam and denial-of-service attacks

### 4. Request Flow

**Legitimate Flash Operation:**
```
Client (browser)
  1. Performs actual device flash using Web Serial API
  2. Requests token: GET /api/flash-counter?action=token
  3. Receives one-time token from server
  4. Increments counter: POST /api/flash-counter with token
  5. Server validates token (checks: origin, IP match, not used, not expired)
  6. Counter incremented, token invalidated
```

**Blocked Attack Attempts:**
```
Attacker attempts to increment without flash:
  ❌ Direct POST without token → 401 Unauthorized
  ❌ Reused token → 401 Unauthorized (token already used)
  ❌ Expired token → 401 Unauthorized (token expired)
  ❌ Stolen token from different IP → 401 Unauthorized (IP mismatch)
  ❌ Request from different domain → 403 Forbidden (origin check)
  ❌ Too many requests → 429 Too Many Requests (rate limited)
```

## Environment Variables

### FLASH_COUNTER_SECRET (Optional)
- **Purpose**: Additional API secret key for enhanced security
- **Default**: Auto-generated random 32-byte hex string
- **Recommendation**: Set this in production for consistent secret across server restarts
- **Example**:
  ```bash
  FLASH_COUNTER_SECRET=your_secure_random_string_here
  ```

## Security Features Summary

| Feature | Protection Against | Implementation |
|---------|-------------------|----------------|
| Token-based auth | Unauthorized increments | One-time use tokens with 5min TTL |
| Origin validation | CSRF attacks | Header validation (Origin/Referer) |
| Rate limiting | DoS/spam attacks | 10 requests/min per IP |
| IP binding | Token theft | Token locked to requesting IP |
| Token expiration | Replay attacks | 5-minute validity window |
| Single-use tokens | Token reuse | Immediate invalidation after use |

## Code Changes

### API Route (`app/api/flash-counter/route.ts`)
- Added token generation and validation
- Implemented origin checking
- Added rate limiting
- Enhanced error logging for security events

### Client Component (`components/deviceTool.tsx`)
- Modified to request token before incrementing
- Two-step increment process (token request → increment)
- Better error handling

## Testing Security

To verify the security implementation:

1. **Test legitimate use**: Flash a device and verify counter increments
2. **Test token expiration**: Request token, wait 5+ minutes, try to use it
3. **Test token reuse**: Try to use the same token twice
4. **Test rate limiting**: Make 11+ requests within a minute
5. **Test origin validation**: Make request from different domain (should fail)

## Monitoring

The server logs warnings for suspicious activity:
- Invalid token attempts
- Origin validation failures
- Rate limit violations
- IP mismatches

Review server logs regularly for security monitoring.
