package io.github.leonfoliveira.judge.api.service

import io.kotest.core.spec.style.FunSpec
import io.kotest.matchers.shouldBe
import io.kotest.matchers.longs.shouldBeGreaterThan
import io.kotest.matchers.shouldNotBe

class RateLimitServiceTest : FunSpec({
    
    val rateLimitService = RateLimitService()
    
    test("should allow requests within rate limit") {
        val key = "test-key-1"
        
        // Should allow first request
        val result1 = rateLimitService.tryConsume(key, 10, 100, 5)
        result1 shouldBe true
        
        // Should allow second request
        val result2 = rateLimitService.tryConsume(key, 10, 100, 5)
        result2 shouldBe true
    }
    
    test("should block requests when burst capacity exceeded") {
        val key = "test-key-2"
        val burstCapacity = 2
        
        // Consume all burst capacity
        repeat(burstCapacity) {
            val result = rateLimitService.tryConsume(key, 60, 1000, burstCapacity)
            result shouldBe true
        }
        
        // Next request should be blocked
        val result = rateLimitService.tryConsume(key, 60, 1000, burstCapacity)
        result shouldBe false
    }
    
    test("should return available tokens correctly") {
        val key = "test-key-3"
        val burstCapacity = 5
        
        // Get initial tokens
        val initialTokens = rateLimitService.getAvailableTokens(key, 60, 1000, burstCapacity)
        initialTokens shouldBe burstCapacity.toLong()
        
        // Consume one token
        rateLimitService.tryConsume(key, 60, 1000, burstCapacity)
        
        // Available tokens should decrease
        val remainingTokens = rateLimitService.getAvailableTokens(key, 60, 1000, burstCapacity)
        remainingTokens shouldBe (burstCapacity - 1).toLong()
    }
    
    test("should provide cache statistics") {
        val key = "test-key-4"
        
        // Trigger some cache activity
        rateLimitService.tryConsume(key, 60, 1000, 5)
        
        val stats = rateLimitService.getCacheStats()
        stats shouldNotBe null
        stats.requestCount() shouldBeGreaterThan 0L
    }
    
    test("should handle different keys independently") {
        val key1 = "test-key-5a"
        val key2 = "test-key-5b"
        val burstCapacity = 1
        
        // Exhaust capacity for key1
        rateLimitService.tryConsume(key1, 60, 1000, burstCapacity)
        val result1 = rateLimitService.tryConsume(key1, 60, 1000, burstCapacity)
        result1 shouldBe false
        
        // key2 should still have capacity
        val result2 = rateLimitService.tryConsume(key2, 60, 1000, burstCapacity)
        result2 shouldBe true
    }
})
