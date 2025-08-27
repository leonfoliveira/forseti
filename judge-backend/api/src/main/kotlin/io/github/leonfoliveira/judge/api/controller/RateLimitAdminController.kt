package io.github.leonfoliveira.judge.api.controller

import io.github.leonfoliveira.judge.api.service.RateLimitService
import io.github.leonfoliveira.judge.api.util.Private
import io.github.leonfoliveira.judge.api.util.RateLimit
import io.github.leonfoliveira.judge.api.util.KeyType
import io.github.leonfoliveira.judge.common.domain.entity.Member
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.responses.ApiResponse
import io.swagger.v3.oas.annotations.responses.ApiResponses
import org.slf4j.LoggerFactory
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/v1/admin/rate-limit")
class RateLimitAdminController(
    private val rateLimitService: RateLimitService
) {
    private val logger = LoggerFactory.getLogger(this::class.java)

    @GetMapping("/stats")
    @Private(Member.Type.ROOT)
    @RateLimit(
        requestsPerMinute = 10,
        requestsPerHour = 50,
        burstCapacity = 3,
        keyType = KeyType.USER_ID
    )
    @Operation(
        summary = "Get rate limiting statistics",
        description = "Returns cache statistics and performance metrics for rate limiting system."
    )
    @ApiResponses(
        value = [
            ApiResponse(responseCode = "200", description = "Statistics retrieved successfully"),
            ApiResponse(responseCode = "401", description = "Unauthorized"),
            ApiResponse(responseCode = "403", description = "Forbidden")
        ]
    )
    fun getRateLimitStats(): ResponseEntity<Map<String, Any>> {
        logger.info("[GET] /v1/admin/rate-limit/stats")
        
        val stats = rateLimitService.getCacheStats()
        
        val response = mapOf(
            "cache" to mapOf(
                "hitRate" to String.format("%.2f%%", stats.hitRate() * 100),
                "hitCount" to stats.hitCount(),
                "missCount" to stats.missCount(),
                "requestCount" to stats.requestCount(),
                "evictionCount" to stats.evictionCount(),
                "loadCount" to stats.loadCount(),
                "averageLoadPenalty" to String.format("%.2f ms", stats.averageLoadPenalty() / 1_000_000.0)
            ),
            "health" to mapOf(
                "status" to if (stats.hitRate() > 0.95) "healthy" else "warning",
                "recommendation" to when {
                    stats.hitRate() < 0.80 -> "Consider increasing cache size or TTL"
                    stats.evictionCount() > stats.hitCount() / 10 -> "High eviction rate - consider increasing cache size"
                    else -> "Rate limiting system operating normally"
                }
            ),
            "timestamp" to System.currentTimeMillis()
        )
        
        return ResponseEntity.ok(response)
    }
}
