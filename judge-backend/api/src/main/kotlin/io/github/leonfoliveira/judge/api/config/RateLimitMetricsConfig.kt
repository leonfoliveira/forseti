package io.github.leonfoliveira.judge.api.config

import io.github.leonfoliveira.judge.api.service.RateLimitService
import org.springframework.context.annotation.Configuration
import org.springframework.scheduling.annotation.EnableScheduling
import org.springframework.scheduling.annotation.Scheduled
import org.springframework.stereotype.Component

@Configuration
@EnableScheduling
class RateLimitMetricsConfig

@Component
class RateLimitMetricsExporter(
    private val rateLimitService: RateLimitService
) {
    
    @Scheduled(fixedRate = 30000) // Every 30 seconds
    fun exportMetrics() {
        val stats = rateLimitService.getCacheStats()
        
        // Log cache statistics for monitoring
        if (stats.evictionCount() >= 0) {
            println("Rate limit cache stats - Hit rate: ${String.format("%.2f", stats.hitRate() * 100)}%, Evictions: ${stats.evictionCount()}")
        }
    }
}
