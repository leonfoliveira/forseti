package com.forsetijudge.core.config

import java.time.OffsetDateTime
import java.time.ZoneOffset
import java.time.format.DateTimeFormatter
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.context.annotation.Primary
import tools.jackson.core.JsonGenerator
import tools.jackson.databind.DeserializationFeature
import tools.jackson.databind.ObjectMapper
import tools.jackson.databind.SerializationContext
import tools.jackson.databind.ValueSerializer
import tools.jackson.databind.module.SimpleModule
import tools.jackson.module.kotlin.jacksonMapperBuilder

@Configuration
class JacksonConfig {
    class OffsetDateTimeSerializer : ValueSerializer<OffsetDateTime>() {
        private val formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss.SSSXXX")

        /**
         * Serializes an OffsetDateTime object to a JSON string using the ISO-8601 specification.
         */
        override fun serialize(
            value: OffsetDateTime?,
            gen: JsonGenerator?,
            ctxt: SerializationContext?,
        ) {
            if (value != null) {
                val utc = value.withOffsetSameInstant(ZoneOffset.UTC)
                gen?.writeString(formatter.format(utc))
            }
        }
    }

    /**
     * Configures and provides a customized Jackson ObjectMapper bean.
     * - Registers a module to handle OffsetDateTime serialization.
     * - Disables failure on unknown properties during deserialization.
     *
     * Note: Jackson 3's ObjectMapper is immutable once built, so all configuration
     * (modules, features) must be applied through its builder before calling build().
     * java.time (JSR-310) support is now built directly into jackson-databind core in
     * Jackson 3, so no separate jackson-datatype-jsr310 module is needed; we only
     * register a small module to override the default OffsetDateTime serializer.
     * Dates are written as ISO-8601 strings by default in Jackson 3, so the old
     * WRITE_DATES_AS_TIMESTAMPS feature toggle no longer exists/is needed.
     */
    @Bean
    @Primary
    fun objectMapper(): ObjectMapper {
        val offsetDateTimeModule = SimpleModule()
        offsetDateTimeModule.addSerializer(OffsetDateTime::class.java, OffsetDateTimeSerializer())

        return jacksonMapperBuilder()
            .addModule(offsetDateTimeModule)
            .disable(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES)
            .build()
    }
}
