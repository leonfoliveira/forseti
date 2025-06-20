package io.github.leonfoliveira.judge.worker.feign

import feign.RequestInterceptor
import feign.RequestTemplate
import io.github.leonfoliveira.judge.common.service.authorization.AuthorizationService
import org.springframework.context.annotation.Configuration

@Configuration
class FeignConfig(
    val authorizationService: AuthorizationService,
) : RequestInterceptor {
    override fun apply(template: RequestTemplate) {
        val authorization = authorizationService.authenticateAutoJury()
        template.header("Authorization", "Bearer ${authorization.accessToken}")
    }
}
