package io.github.leonfoliveira.judge.autojudge.feign

import feign.RequestInterceptor
import feign.RequestTemplate
import io.github.leonfoliveira.judge.common.service.authorization.AuthorizationService
import org.slf4j.MDC
import org.springframework.context.annotation.Configuration

@Configuration
class FeignConfig(
    val authorizationService: AuthorizationService,
) : RequestInterceptor {
    override fun apply(template: RequestTemplate) {
        val authorization = authorizationService.authenticateAutoJudge()
        val accessToken = authorizationService.encodeToken(authorization)
        template.header("Cookie", "access_token=$accessToken")

        val traceId = MDC.get("traceId")
        if (traceId != null) {
            template.header("X-Trace-Id", traceId)
        }
    }
}
