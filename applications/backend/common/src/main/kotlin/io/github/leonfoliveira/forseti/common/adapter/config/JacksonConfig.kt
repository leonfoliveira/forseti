package io.github.leonfoliveira.forseti.common.adapter.config

import com.fasterxml.jackson.core.JsonGenerator
import com.fasterxml.jackson.databind.DeserializationFeature
import com.fasterxml.jackson.databind.JsonSerializer
import com.fasterxml.jackson.databind.ObjectMapper
import com.fasterxml.jackson.databind.SerializationFeature
import com.fasterxml.jackson.databind.SerializerProvider
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule
import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import io.github.leonfoliveira.forseti.common.application.util.SkipCoverage
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.context.annotation.Primary
import java.time.OffsetDateTime
import java.time.format.DateTimeFormatter

@Configuration
@SkipCoverage
class JacksonConfig {
    class OffsetDateTimeSerializer : JsonSerializer<OffsetDateTime>() {
        private val formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss.SSSSSSXXX")

        /**
         * Serializes an OffsetDateTime object to a JSON string using the ISO-8601 specification.
         */
        override fun serialize(
            value: OffsetDateTime?,
            gen: JsonGenerator?,
            serializers: SerializerProvider?,
        ) {
            if (value != null) {
                gen?.writeString(formatter.format(value))
            }
        }
    }

    /**
     * Configures and provides a customized Jackson ObjectMapper bean.
     * - Registers a module to handle OffsetDateTime serialization.
     * - Disables writing dates as timestamps.
     * - Disables failure on unknown properties during deserialization.
     */
    @Bean
    @Primary
    fun objectMapper(): ObjectMapper {
        val objectMapper = jacksonObjectMapper()
        val javaTimeModule = JavaTimeModule()
        javaTimeModule.addSerializer(OffsetDateTime::class.java, OffsetDateTimeSerializer())
        objectMapper.registerModule(javaTimeModule)
        objectMapper.disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS)
        objectMapper.disable(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES)
        return objectMapper
    }
}
