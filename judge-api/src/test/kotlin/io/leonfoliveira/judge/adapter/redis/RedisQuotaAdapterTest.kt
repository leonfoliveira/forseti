package io.leonfoliveira.judge.adapter.redis

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
import java.time.temporal.ChronoUnit

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
    val per = ChronoUnit.MINUTES
    val key = "$operation:${member.id}:$timestamp"

    beforeEach {
        mockkObject(TimeUtils)
        every { TimeUtils.now() }
            .returns(now)
    }

    context("hasQuota") {
        test("should return true when the quota is not found") {
            every { redisTemplate.opsForValue().get(key) } returns null

            val result = sut.hasQuota(member, operation, quota)

            result shouldBe true
        }

        test("should return true when the quota is not exceeded") {
            every { redisTemplate.opsForValue().get(key) } returns "0"

            val result = sut.hasQuota(member, operation, quota)

            result shouldBe true
        }

        test("should return false when the quota is exceeded") {
            every { redisTemplate.opsForValue().get(key) } returns "1"

            val result = sut.hasQuota(member, operation, quota)

            result shouldBe false
        }
    }

    context("consumeQuota") {
        test("increment the quota count and set expiration when first consumed") {
            every { redisTemplate.opsForValue().increment(key, 1) } returns 1L
            every { redisTemplate.expire(key, any()) } returns true

            sut.consume(member, operation, quota, per)

            verify { redisTemplate.opsForValue().increment(key, 1) }
            verify { redisTemplate.expire(key, Duration.of(1, per)) }
        }

        test("increment the quota count without setting expiration when not first consumed") {
            clearMocks(redisTemplate)
            every { redisTemplate.opsForValue().increment(key, 1) } returns 2L

            sut.consume(member, operation, quota, per)

            verify { redisTemplate.opsForValue().increment(key, 1) }
            verify(exactly = 0) { redisTemplate.expire(key, any()) }
        }
    }
})
