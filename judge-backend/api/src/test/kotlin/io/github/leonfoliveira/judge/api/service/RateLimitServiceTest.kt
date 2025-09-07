package io.github.leonfoliveira.judge.api.service

import io.github.leonfoliveira.judge.api.port.CacheAdapter
import io.kotest.core.spec.style.FunSpec
import io.kotest.matchers.shouldBe
import io.mockk.every
import io.mockk.mockk
import io.mockk.slot

class RateLimitServiceTest : FunSpec({
    val cacheAdapter = mockk<CacheAdapter<RateLimitService.TokenBucket>>()

    val sut = RateLimitService(cacheAdapter)

    test("should allow requests within rate limit") {
        val key = "test-key-1"
        val bucketSlot = slot<RateLimitService.TokenBucket>()

        every { cacheAdapter.get(key) } returns null
        every { cacheAdapter.put(key, capture(bucketSlot)) } returns Unit

        // Should allow first request
        val result1 = sut.tryConsume(key, 10, 100, 5)
        result1 shouldBe true

        every { cacheAdapter.get(key) } returns bucketSlot.captured

        // Should allow second request
        val result2 = sut.tryConsume(key, 10, 100, 5)
        result2 shouldBe true
    }

    test("should block requests when burst capacity exceeded") {
        val key = "test-key-2"
        val burstCapacity = 2
        val bucketSlot = slot<RateLimitService.TokenBucket>()

        every { cacheAdapter.get(key) } returns null
        every { cacheAdapter.put(key, capture(bucketSlot)) } returns Unit

        // Consume all burst capacity
        repeat(burstCapacity) {
            val result = sut.tryConsume(key, 60, 1000, burstCapacity)
            result shouldBe true
            every { cacheAdapter.get(key) } returns bucketSlot.captured
        }

        // Next request should be blocked
        val result = sut.tryConsume(key, 60, 1000, burstCapacity)
        result shouldBe false
    }

    test("should return available tokens correctly") {
        val key = "test-key-3"
        val burstCapacity = 5
        val bucketSlot = slot<RateLimitService.TokenBucket>()

        every { cacheAdapter.get(key) } returns null
        every { cacheAdapter.put(key, capture(bucketSlot)) } returns Unit

        // Get initial tokens
        val initialTokens = sut.getAvailableTokens(key, 60, 1000, burstCapacity)
        initialTokens shouldBe burstCapacity.toLong()

        every { cacheAdapter.get(key) } returns bucketSlot.captured

        // Consume one token
        sut.tryConsume(key, 60, 1000, burstCapacity)

        // Available tokens should decrease
        val remainingTokens = sut.getAvailableTokens(key, 60, 1000, burstCapacity)
        remainingTokens shouldBe (burstCapacity - 1).toLong()
    }

    test("tokens should regenerate over time") {
        val key = "test-key-4"
        val burstCapacity = 5
        val refillRate = 60
        val refillTime = 1000
        val bucketSlot = slot<RateLimitService.TokenBucket>()

        every { cacheAdapter.get(key) } returns null
        every { cacheAdapter.put(key, capture(bucketSlot)) } returns Unit

        // Consume all tokens
        repeat(burstCapacity) {
            sut.tryConsume(key, refillRate, refillTime, burstCapacity) shouldBe true
            every { cacheAdapter.get(key) } returns bucketSlot.captured
        }

        // Next request should be blocked
        sut.tryConsume(key, refillRate, refillTime, burstCapacity) shouldBe false

        // Wait for tokens to regenerate
        val regeneratedBucket =
            RateLimitService.TokenBucket(
                requestsPerMinute = refillRate,
                requestsPerHour = refillTime,
                burstCapacity = burstCapacity,
            )
        every { cacheAdapter.get(key) } returns regeneratedBucket

        // Now request should be allowed
        sut.tryConsume(key, refillRate, refillTime, burstCapacity) shouldBe true
    }

    test("should handle different keys independently") {
        val key1 = "test-key-5a"
        val key2 = "test-key-5b"
        val burstCapacity = 1
        val bucketSlot1 = slot<RateLimitService.TokenBucket>()
        val bucketSlot2 = slot<RateLimitService.TokenBucket>()

        every { cacheAdapter.get(key1) } returns null
        every { cacheAdapter.put(key1, capture(bucketSlot1)) } returns Unit
        every { cacheAdapter.get(key2) } returns null
        every { cacheAdapter.put(key2, capture(bucketSlot2)) } returns Unit

        // Exhaust capacity for key1
        sut.tryConsume(key1, 60, 1000, burstCapacity)
        every { cacheAdapter.get(key1) } returns bucketSlot1.captured
        val result1 = sut.tryConsume(key1, 60, 1000, burstCapacity)
        result1 shouldBe false

        // key2 should still have capacity
        val result2 = sut.tryConsume(key2, 60, 1000, burstCapacity)
        result2 shouldBe true
    }
})
