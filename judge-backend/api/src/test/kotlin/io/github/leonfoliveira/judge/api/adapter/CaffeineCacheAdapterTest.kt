package io.github.leonfoliveira.judge.api.adapter

import com.github.benmanes.caffeine.cache.stats.CacheStats
import io.github.leonfoliveira.judge.api.util.ApiMetrics
import io.kotest.core.spec.style.FunSpec
import io.kotest.matchers.shouldBe
import io.micrometer.core.instrument.MeterRegistry
import io.micrometer.core.instrument.Tag
import io.mockk.mockk
import io.mockk.verify
import java.util.function.ToDoubleFunction

class CaffeineCacheAdapterTest : FunSpec({
    val meterRegistry = mockk<MeterRegistry>(relaxed = true)
    val sut =
        CaffeineCacheAdapter<String>(
            meterRegistry = meterRegistry,
            name = "test_cache",
            maximumSize = 100,
            expireAfterWriteSeconds = 60,
        )

    test("should put and get a value from the cache") {
        val key = "testKey"
        val value = "testValue"

        sut.put(key, value)
        val cachedValue = sut.get(key)

        cachedValue shouldBe value
    }

    test("should return null for a non-existent key") {
        val cachedValue = sut.get("nonExistentKey")
        cachedValue shouldBe null
    }

    test("should export metrics") {
        sut.exportMetrics()

        verify {
            meterRegistry.gauge(
                ApiMetrics.API_CACHE_HIT_RATE,
                listOf(Tag.of(ApiMetrics.Label.CACHE_NAME, "test_cache")),
                any<CacheStats>(),
                any<ToDoubleFunction<CacheStats>>(),
            )
        }

        verify {
            meterRegistry.gauge(
                ApiMetrics.API_CACHE_EVICTIONS,
                listOf(Tag.of(ApiMetrics.Label.CACHE_NAME, "test_cache")),
                any<CacheStats>(),
                any<ToDoubleFunction<CacheStats>>(),
            )
        }
    }
})
