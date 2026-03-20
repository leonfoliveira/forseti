package com.forsetijudge.infrastructure.config

import org.springframework.beans.factory.annotation.Value
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import xyz.capybara.clamav.ClamavClient

@Configuration
class ClamAVConfig {
    @Bean
    fun clamavClient(
        @Value("\${clamav.host}")
        host: String,
        @Value("\${clamav.port}")
        port: Int,
    ): ClamavClient = ClamavClient(host, port)
}
