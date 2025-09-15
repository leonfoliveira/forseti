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
        val authorization = authenticationService.authenticateAutoJudge()
        val accessToken = authenticationService.encodeToken(authorization)
        template.header("Cookie", "access_token=$accessToken")

        val traceId = MDC.get("traceId")
        if (traceId != null) {
            template.header("X-Trace-Id", traceId)
        }
    }
}
