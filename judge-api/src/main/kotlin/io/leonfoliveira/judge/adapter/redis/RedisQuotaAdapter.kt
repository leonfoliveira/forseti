package io.leonfoliveira.judge.adapter.redis

import io.leonfoliveira.judge.core.domain.model.AuthorizationMember
import io.leonfoliveira.judge.core.port.QuotaAdapter
import io.leonfoliveira.judge.core.util.TimeUtils
import org.springframework.data.redis.core.StringRedisTemplate
import org.springframework.stereotype.Service
import java.time.Duration
import java.time.format.DateTimeFormatter
import java.time.temporal.ChronoUnit
import java.time.temporal.Temporal
import java.time.temporal.TemporalUnit

@Service
class RedisQuotaAdapter(
    private val redisTemplate: StringRedisTemplate,
) : QuotaAdapter {
    override fun hasQuota(
        member: AuthorizationMember,
        operation: String,
        quota: Int,
    ): Boolean {
        val key = getKey(operation, member)

        val count = redisTemplate.opsForValue().get(key)?.toIntOrNull() ?: 0
        return count < quota
    }

    override fun consume(
        member: AuthorizationMember,
        operation: String,
        quota: Int,
        per: TemporalUnit,
    ) {
        val key = getKey(operation, member)

        val count = redisTemplate.opsForValue().increment(key, 1)
        if (count == 1L) {
            redisTemplate.expire(key, Duration.of(1, per))
        }
    }

    private fun getKey(
        operation: String,
        member: AuthorizationMember,
    ): String {
        val timestamp = TimeUtils.now().format(DateTimeFormatter.ofPattern("yyyyMMddHHmm"))
        val key = "$operation:${member.id}:$timestamp"
        return key
    }
}
