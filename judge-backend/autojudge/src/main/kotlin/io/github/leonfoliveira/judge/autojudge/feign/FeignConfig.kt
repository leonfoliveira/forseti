package io.github.leonfoliveira.judge.autojudge.feign

import feign.RequestInterceptor
import feign.RequestTemplate
import io.github.leonfoliveira.judge.common.service.authentication.AuthenticationService
import org.slf4j.MDC
import org.springframework.context.annotation.Configuration

@Configuration
class FeignConfig(
    val authenticationService: AuthenticationService,
) : RequestInterceptor {
    override fun apply(template: RequestTemplate) {
        val session = authenticationService.authenticateAutoJudge()
        template.header("Cookie", "session_id=${session.id}")

        val traceId = MDC.get("traceId")
        if (traceId != null) {
            template.header("X-Trace-Id", traceId)
        }
    }
}
