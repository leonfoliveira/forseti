package io.github.leonfoliveira.judge.api.adapter

import com.github.benmanes.caffeine.cache.Caffeine
import io.github.leonfoliveira.judge.api.port.CacheAdapter
import io.github.leonfoliveira.judge.api.util.ApiMetrics
import io.micrometer.core.instrument.MeterRegistry
import io.micrometer.core.instrument.Tag
import org.springframework.scheduling.annotation.Scheduled
import java.io.Serializable
import java.util.concurrent.TimeUnit

class CaffeineCacheAdapter<TValue : Serializable>(
    private val meterRegistry: MeterRegistry,
    private val name: String,
    maximumSize: Long,
    expireAfterWriteSeconds: Long,
) : CacheAdapter<TValue> {
    private val cache =
        Caffeine
            .newBuilder()
            .maximumSize(maximumSize)
            .expireAfterWrite(expireAfterWriteSeconds, TimeUnit.SECONDS)
            .recordStats()
            .build<String, TValue>()

    override fun get(key: String): TValue? = cache.getIfPresent(key)

    override fun put(
        key: String,
        value: TValue,
    ) {
        cache.put(key, value)
    }

    @Scheduled(fixedRate = 15000)
    fun exportMetrics() {
        val stats = cache.stats()

        meterRegistry.gauge(ApiMetrics.API_CACHE_HIT_RATE, listOf(Tag.of(ApiMetrics.Label.CACHE_NAME, name)), stats) { it.hitRate() }
        meterRegistry.gauge(ApiMetrics.API_CACHE_EVICTIONS, listOf(Tag.of(ApiMetrics.Label.CACHE_NAME, name)), stats) {
            it.evictionCount().toDouble()
        }
    }
}
