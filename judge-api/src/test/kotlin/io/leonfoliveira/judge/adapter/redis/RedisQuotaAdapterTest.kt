package io.leonfoliveira.judge.adapter.redis

import io.kotest.assertions.any
import io.kotest.core.spec.style.FunSpec
import io.kotest.matchers.shouldBe
import io.leonfoliveira.judge.core.domain.model.AuthorizationMemberMockFactory
import io.leonfoliveira.judge.core.util.TimeUtils
import io.mockk.clearMocks
import io.mockk.every
import io.mockk.mockk
import io.mockk.mockkObject
import io.mockk.verify
import org.springframework.data.redis.core.StringRedisTemplate
import java.time.Duration
import java.time.LocalDateTime
import java.time.format.DateTimeFormatter

class RedisQuotaAdapterTest : FunSpec({
    val redisTemplate = mockk<StringRedisTemplate>()

    val sut =
        RedisQuotaAdapter(
            redisTemplate,
        )

    val now = LocalDateTime.now()
    val timestamp = now.format(DateTimeFormatter.ofPattern("yyyyMMddHHmm"))
    val member = AuthorizationMemberMockFactory.build()
    val operation = "operation"
    val quota = 5
    val key = "$operation:${member.id}:$timestamp"

    beforeEach {
        mockkObject(TimeUtils)
        every { TimeUtils.now() }
            .returns(now)
        clearMocks(redisTemplate)
    }

    context("hasQuota") {
        test("should return false when the quota is exceeded after removing expired entries") {
            every { redisTemplate.opsForZSet().removeRangeByScore(key, 0.0, any()) } returns 1L
            every { redisTemplate.opsForZSet().zCard(key) } returns quota.toLong()

            val result = sut.hasQuota(member, operation, quota, Duration.ofMinutes(1))

            result shouldBe false
        }

        test("should true when the quota is not exceeded after removing expired entries") {
            every { redisTemplate.opsForZSet().removeRangeByScore(key, 0.0, any()) } returns 1L
            every { redisTemplate.opsForZSet().zCard(key) } returns (quota - 1).toLong()

            val result = sut.hasQuota(member, operation, quota, Duration.ofMinutes(1))

            result shouldBe true
        }
    }

    context("consumeQuota") {
        test("should set expiration correctly when consuming") {
            every { redisTemplate.opsForZSet().add(key, any(), any()) } returns true
            every { redisTemplate.expire(key, any()) } returns true

            sut.consume(member, operation, quota, Duration.ofMinutes(1))

            verify { redisTemplate.opsForZSet().add(key, any(), any()) }
            verify { redisTemplate.expire(key, any()) }
        }
    }
})
