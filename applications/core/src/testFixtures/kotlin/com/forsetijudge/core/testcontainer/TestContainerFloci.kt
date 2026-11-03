package com.forsetijudge.core.testcontainer

import com.forsetijudge.core.config.JacksonConfig
import io.floci.testcontainers.FlociContainer
import org.springframework.data.redis.connection.RedisStandaloneConfiguration
import org.springframework.data.redis.connection.lettuce.LettuceConnectionFactory
import org.springframework.data.redis.core.StringRedisTemplate
import org.testcontainers.utility.MountableFile
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider
import software.amazon.awssdk.regions.Region
import software.amazon.awssdk.services.s3.S3Client
import software.amazon.awssdk.services.s3.S3Configuration
import software.amazon.awssdk.services.s3.presigner.S3Presigner
import software.amazon.awssdk.services.secretsmanager.SecretsManagerClient
import software.amazon.awssdk.services.sqs.SqsAsyncClient
import software.amazon.awssdk.services.sqs.SqsClient
import tools.jackson.databind.DeserializationFeature
import tools.jackson.databind.ObjectMapper
import tools.jackson.databind.json.JsonMapper
import tools.jackson.databind.module.SimpleModule
import tools.jackson.module.kotlin.KotlinModule
import java.net.Socket
import java.net.URI
import java.time.OffsetDateTime

abstract class TestContainerFloci {
    companion object {
        @JvmStatic
        val floci: FlociContainer =
            FlociContainer("floci/floci:2.4.0-compat")
                .withSecretsManagerConfig { it.enabled(true) }
                .withS3Config { it.enabled(true) }
                .withElastiCacheConfig { it.enabled(true) }
                .withRdsConfig { it.enabled(true) }
                .withSqsConfig { it.enabled(true) }
                .withEventBridgeConfig { it.enabled(true) }
                .withDockerSocket(true)
                .withCreateContainerCmdModifier { it.withUser("root") }
                .withExposedPorts(4566, *(6379..6399).toList().toTypedArray(), *(7001..7099).toList().toTypedArray())
                .withCopyToContainer(
                    MountableFile.forClasspathResource("floci/"),
                    "/etc/floci",
                ).also {
                    it.start()
                    awaitRedis(it)
                }

        private fun awaitRedis(container: FlociContainer) {
            val deadline = System.currentTimeMillis() + 60_000
            while (System.currentTimeMillis() < deadline) {
                try {
                    Socket(container.host, container.getMappedPort(6379)).use { socket ->
                        socket.soTimeout = 2_000
                        socket.getOutputStream().write("*1\r\n\$4\r\nPING\r\n".toByteArray())
                        if (socket.getInputStream().read() == '+'.code) return
                    }
                } catch (_: Exception) {
                }
                Thread.sleep(500)
            }
            error("Redis did not become available in Floci:\n${container.logs}")
        }
    }

    private val credentials =
        StaticCredentialsProvider.create(
            AwsBasicCredentials.create(
                floci.accessKey,
                floci.secretKey,
            ),
        )

    val s3Client: S3Client =
        S3Client
            .builder()
            .endpointOverride(URI.create(floci.endpoint))
            .region(Region.of(floci.region))
            .credentialsProvider(credentials)
            .forcePathStyle(true)
            .build()

    val s3Presigner: S3Presigner =
        S3Presigner
            .builder()
            .endpointOverride(URI.create(floci.endpoint))
            .credentialsProvider(credentials)
            .region(Region.of(floci.region))
            .serviceConfiguration(S3Configuration.builder().pathStyleAccessEnabled(true).build())
            .build()

    val secretsManagerClient: SecretsManagerClient =
        SecretsManagerClient
            .builder()
            .endpointOverride(URI.create(floci.endpoint))
            .credentialsProvider(credentials)
            .region(Region.of(floci.region))
            .build()

    val sqsClient: SqsClient =
        SqsClient
            .builder()
            .endpointOverride(URI.create(floci.endpoint))
            .credentialsProvider(credentials)
            .region(Region.of(floci.region))
            .build()

    val sqsAsyncClient: SqsAsyncClient =
        SqsAsyncClient
            .builder()
            .endpointOverride(URI.create(floci.endpoint))
            .credentialsProvider(credentials)
            .region(Region.of(floci.region))
            .build()

    val redisConnectionFactory: LettuceConnectionFactory =
        LettuceConnectionFactory(
            RedisStandaloneConfiguration(
                floci.host,
                floci.getMappedPort(6379),
            ),
        ).also { it.afterPropertiesSet() }

    val redisTemplate = StringRedisTemplate(redisConnectionFactory).also { it.afterPropertiesSet() }

    val objectMapper: ObjectMapper =
        JsonMapper
            .builder()
            .addModules(
                KotlinModule.Builder().build(),
                SimpleModule().addSerializer(OffsetDateTime::class.java, JacksonConfig.OffsetDateTimeSerializer()),
            ).disable(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES)
            .build()
}
