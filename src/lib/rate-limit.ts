/**
 * Rate Limiting for API Protection
 *
 * Simple in-memory rate limiter for Edge Runtime
 * Limits requests per IP address per time window
 */

interface RateLimitStore {
    count: number
    resetTime: number
}

// In-memory store (resets on deployment)
const rateLimitStore = new Map<string, RateLimitStore>()

// Cleanup expired entries every minute
setInterval(() => {
    const now = Date.now()
    for (const [key, value] of rateLimitStore.entries()) {
        if (now > value.resetTime) {
            rateLimitStore.delete(key)
        }
    }
}, 60000)

/**
 * Check if request is rate limited
 * @param identifier Unique identifier (IP address, API key, etc.)
 * @param limit Max requests allowed
 * @param windowMs Time window in milliseconds
 * @returns Object with { allowed: boolean, remaining: number, resetTime: number }
 */
export function checkRateLimit(
    identifier: string,
    limit: number = 10,
    windowMs: number = 60000 // 1 minute default
): { allowed: boolean; remaining: number; resetTime: number } {
    const now = Date.now()
    const record = rateLimitStore.get(identifier)

    // No previous record or window expired
    if (!record || now > record.resetTime) {
        const resetTime = now + windowMs
        rateLimitStore.set(identifier, { count: 1, resetTime })
        return {
            allowed: true,
            remaining: limit - 1,
            resetTime
        }
    }

    // Within window, check limit
    if (record.count >= limit) {
        return {
            allowed: false,
            remaining: 0,
            resetTime: record.resetTime
        }
    }

    // Increment counter
    record.count++
    return {
        allowed: true,
        remaining: limit - record.count,
        resetTime: record.resetTime
    }
}

/**
 * Extract client IP from request
 * Works with Cloudflare, Vercel, and standard proxies
 */
export function getClientIp(request: Request): string {
    // Try Cloudflare
    const cfIp = request.headers.get('cf-connecting-ip')
    if (cfIp) return cfIp

    // Try standard headers
    const forwardedFor = request.headers.get('x-forwarded-for')
    if (forwardedFor) {
        return forwardedFor.split(',')[0].trim()
    }

    const realIp = request.headers.get('x-real-ip')
    if (realIp) return realIp

    // Fallback
    return 'unknown'
}

/**
 * Rate limit middleware for Next.js API routes
 */
export function withRateLimit(
    handler: (req: Request) => Promise<Response>,
    options: {
        limit?: number
        windowMs?: number
        identifier?: (req: Request) => string
    } = {}
) {
    const {
        limit = 10,
        windowMs = 60000,
        identifier = getClientIp
    } = options

    return async (req: Request): Promise<Response> => {
        const clientId = identifier(req)
        const result = checkRateLimit(clientId, limit, windowMs)

        // Add rate limit headers to response
        const headers = {
            'X-RateLimit-Limit': limit.toString(),
            'X-RateLimit-Remaining': result.remaining.toString(),
            'X-RateLimit-Reset': new Date(result.resetTime).toISOString()
        }

        if (!result.allowed) {
            return new Response(
                JSON.stringify({
                    error: 'Too many requests',
                    message: `Rate limit exceeded. Try again in ${Math.ceil((result.resetTime - Date.now()) / 1000)} seconds.`,
                    retryAfter: Math.ceil((result.resetTime - Date.now()) / 1000)
                }),
                {
                    status: 429,
                    headers: {
                        'Content-Type': 'application/json',
                        'Retry-After': Math.ceil((result.resetTime - Date.now()) / 1000).toString(),
                        ...headers
                    }
                }
            )
        }

        // Proceed with handler and add headers to response
        const response = await handler(req)

        // Clone response to add headers
        const newResponse = new Response(response.body, response)
        Object.entries(headers).forEach(([key, value]) => {
            newResponse.headers.set(key, value)
        })

        return newResponse
    }
}
