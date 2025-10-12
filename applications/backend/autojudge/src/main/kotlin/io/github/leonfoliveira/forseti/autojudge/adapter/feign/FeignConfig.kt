package io.github.leonfoliveira.forseti.autojudge.adapter.feign

import feign.RequestInterceptor
import feign.RequestTemplate
import feign.Retryer
import io.github.leonfoliveira.forseti.autojudge.config.AutoJudgeConfig
import org.slf4j.MDC
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration

@Configuration
class FeignConfig(
    private val autoJudgeConfig: AutoJudgeConfig,
) : RequestInterceptor {
    @Bean
    fun retryer(): Retryer = Retryer.Default(100, 1000, 3)

    override fun apply(template: RequestTemplate) {
        template.header("Cookie", "session_id=${autoJudgeConfig.currentSession.id}")

        val traceId = MDC.get("traceId")
        if (traceId != null) {
            template.header("X-Trace-Id", traceId)
        }
    }
}
