package com.forsetijudge.infrastructure.config

import org.redisson.Redisson
import org.redisson.api.RedissonClient
import org.redisson.config.Config
import org.springframework.beans.factory.annotation.Value
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration

@Configuration
class RedissonConfig(
    @Value("\${redis.url}")
    private val url: String,
    @Value("\${redis.password}")
    private val password: String,
) {
    @Bean
    fun redissonClient(): RedissonClient {
        val config = Config()
        config.setPassword(password).useSingleServer().setAddress(url)
        return Redisson.create(config)
    }
}
