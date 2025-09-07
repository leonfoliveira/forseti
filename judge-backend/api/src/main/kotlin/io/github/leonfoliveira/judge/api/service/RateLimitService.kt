package io.github.leonfoliveira.judge.api.service

import io.github.leonfoliveira.judge.api.port.CacheAdapter
import org.springframework.stereotype.Service
import java.io.Serializable
import java.time.Instant
import java.util.concurrent.atomic.AtomicLong

/**
 * Rate limiting implementation using Token Bucket algorithm with Caffeine cache.
 * Provides protection against brute force attacks and ensures fair resource usage.
 */
@Service
class RateLimitService(
    private val cache: CacheAdapter<TokenBucket>,
) {
    /**
     * Tries to consume tokens from the rate limit bucket.
     * Returns true if request is allowed, false if rate limit exceeded.
     */
    fun tryConsume(
        key: String,
        requestsPerMinute: Int = 60,
        requestsPerHour: Int = 1000,
        burstCapacity: Int = 10,
        tokens: Long = 1,
    ): Boolean {
        val bucket = getBucket(key, requestsPerMinute, requestsPerHour, burstCapacity)
        return bucket.tryConsume(tokens)
    }

    /**
     * Gets the number of available tokens in the bucket.
     */
    fun getAvailableTokens(
        key: String,
        requestsPerMinute: Int = 60,
        requestsPerHour: Int = 1000,
        burstCapacity: Int = 10,
    ): Long {
        val bucket = getBucket(key, requestsPerMinute, requestsPerHour, burstCapacity)
        return bucket.availableTokens()
    }

    /**
     * Gets or creates a token bucket for the given key.
     */
    private fun getBucket(
        key: String,
        requestsPerMinute: Int,
        requestsPerHour: Int,
        burstCapacity: Int,
    ): TokenBucket =
        cache.get(key) ?: TokenBucket(requestsPerMinute, requestsPerHour, burstCapacity).also {
            cache.put(key, it)
        }

    /**
     * Token Bucket implementation for rate limiting.
     * Uses multiple rate limits: per minute, per hour, and burst capacity.
     */
    class TokenBucket(
        private val requestsPerMinute: Int,
        private val requestsPerHour: Int,
        private val burstCapacity: Int,
    ) : Serializable {
        private val minuteTokens = AtomicLong(requestsPerMinute.toLong())
        private val hourTokens = AtomicLong(requestsPerHour.toLong())
        private val burstTokens = AtomicLong(burstCapacity.toLong())

        private var lastMinuteRefill = Instant.now().epochSecond / 60
        private var lastHourRefill = Instant.now().epochSecond / 3600
        private var lastBurstRefill = Instant.now().epochSecond

        @Synchronized
        fun tryConsume(tokens: Long): Boolean {
            refillTokens()

            // Check all rate limits
            if (minuteTokens.get() < tokens ||
                hourTokens.get() < tokens ||
                burstTokens.get() < tokens
            ) {
                return false
            }

            // Consume tokens from all buckets
            minuteTokens.addAndGet(-tokens)
            hourTokens.addAndGet(-tokens)
            burstTokens.addAndGet(-tokens)

            return true
        }

        @Synchronized
        fun availableTokens(): Long {
            refillTokens()
            return minOf(minuteTokens.get(), hourTokens.get(), burstTokens.get())
        }

        private fun refillTokens() {
            val now = Instant.now()
            val currentMinute = now.epochSecond / 60
            val currentHour = now.epochSecond / 3600
            val currentSecond = now.epochSecond

            // Refill minute tokens
            if (currentMinute > lastMinuteRefill) {
                minuteTokens.set(requestsPerMinute.toLong())
                lastMinuteRefill = currentMinute
            }

            // Refill hour tokens
            if (currentHour > lastHourRefill) {
                hourTokens.set(requestsPerHour.toLong())
                lastHourRefill = currentHour
            }

            // Refill burst tokens (every second)
            if (currentSecond > lastBurstRefill) {
                val secondsElapsed = currentSecond - lastBurstRefill
                val tokensToAdd =
                    minOf(
                        // Refill rate based on requests per minute
                        secondsElapsed * requestsPerMinute / 60,
                        burstCapacity.toLong() - burstTokens.get(),
                    )
                burstTokens.addAndGet(tokensToAdd)
                lastBurstRefill = currentSecond
            }
        }
    }
}
