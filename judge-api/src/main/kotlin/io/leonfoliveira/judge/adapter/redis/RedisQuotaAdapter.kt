package io.leonfoliveira.judge.adapter.redis

import io.leonfoliveira.judge.core.domain.model.AuthorizationMember
import io.leonfoliveira.judge.core.port.QuotaAdapter
import io.leonfoliveira.judge.core.util.TimeUtils
import org.springframework.data.redis.core.StringRedisTemplate
import org.springframework.stereotype.Service
import java.time.Duration
import java.time.format.DateTimeFormatter

@Service
class RedisQuotaAdapter(
    private val redisTemplate: StringRedisTemplate,
) : QuotaAdapter {
    override fun hasQuota(
        member: AuthorizationMember,
        operation: String,
        quota: Int,
        window: Duration,
    ): Boolean {
        val key = getKey(member, operation)
        val now = TimeUtils.epochSecond()
        val windowSeconds = now - window.seconds

        val ops = redisTemplate.opsForZSet()
        ops.removeRangeByScore(key, 0.0, windowSeconds.toDouble())

        val count = ops.zCard(key) ?: 0
        return count < quota
    }

    override fun consume(
        member: AuthorizationMember,
        operation: String,
        quota: Int,
        window: Duration,
    ) {
        val key = getKey(member, operation)
        val now = TimeUtils.epochSecond()
        val windowSeconds = now - window.seconds

        val ops = redisTemplate.opsForZSet()
        ops.add(key, now.toString(), now.toDouble())
        redisTemplate.expire(key, Duration.ofSeconds(windowSeconds))
    }

    private fun getKey(
        member: AuthorizationMember,
        operation: String,
    ): String {
        val timestamp = TimeUtils.now().format(DateTimeFormatter.ofPattern("yyyyMMddHHmm"))
        val key = "$operation:${member.id}:$timestamp"
        return key
    }
}
