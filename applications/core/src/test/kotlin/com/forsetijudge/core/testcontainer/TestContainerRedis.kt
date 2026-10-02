package com.forsetijudge.core.testcontainer

import com.forsetijudge.core.config.JacksonConfig
import com.redis.testcontainers.RedisContainer
import java.time.OffsetDateTime
import org.junit.jupiter.api.AfterEach
import org.springframework.data.redis.connection.RedisStandaloneConfiguration
import org.springframework.data.redis.connection.lettuce.LettuceConnectionFactory
import org.springframework.data.redis.core.StringRedisTemplate
import tools.jackson.databind.DeserializationFeature
import tools.jackson.databind.ObjectMapper
import tools.jackson.databind.json.JsonMapper
import tools.jackson.databind.module.SimpleModule
import tools.jackson.module.kotlin.KotlinModule

/**
 * Base class for tests that run against a real Redis started by Testcontainers.
 * The container is shared by all subclasses and started once per JVM.
 */
abstract class TestContainerRedis {
    companion object {
        private val redis: RedisContainer =
            RedisContainer(RedisContainer.DEFAULT_IMAGE_NAME.withTag("7-alpine")).also { it.start() }

        val connectionFactory: LettuceConnectionFactory =
            LettuceConnectionFactory(RedisStandaloneConfiguration(redis.host, redis.redisPort))
                .also { it.afterPropertiesSet() }

        val objectMapper: ObjectMapper =
            JsonMapper
                .builder()
                .addModules(
                    KotlinModule.Builder().build(),
                    SimpleModule().addSerializer(OffsetDateTime::class.java, JacksonConfig.OffsetDateTimeSerializer()),
                ).disable(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES)
                .build()
    }

    protected val redisTemplate = StringRedisTemplate(connectionFactory).also { it.afterPropertiesSet() }

    @AfterEach
    fun flushRedis() {
        connectionFactory.connection.use { it.serverCommands().flushAll() }
    }
}
