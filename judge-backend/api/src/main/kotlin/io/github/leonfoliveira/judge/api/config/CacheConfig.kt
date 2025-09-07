package io.github.leonfoliveira.judge.api.config

import io.github.leonfoliveira.judge.api.adapter.CaffeineCacheAdapter
import io.github.leonfoliveira.judge.api.port.CacheAdapter
import io.github.leonfoliveira.judge.api.service.RateLimitService
import io.micrometer.core.instrument.MeterRegistry
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration

@Configuration
class CacheConfig {
    @Bean
    fun rateLimitCacheAdapter(meterRegistry: MeterRegistry): CacheAdapter<RateLimitService.TokenBucket> {
        return CaffeineCacheAdapter(meterRegistry, "rate_limit", maximumSize = 100_000, expireAfterWriteSeconds = 3600)
    }
}
