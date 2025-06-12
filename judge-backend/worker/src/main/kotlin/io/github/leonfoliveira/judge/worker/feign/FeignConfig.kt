package io.github.leonfoliveira.judge.worker.feign

import feign.RequestInterceptor
import feign.RequestTemplate
import io.github.leonfoliveira.judge.core.service.authorization.AuthorizationService
import io.github.leonfoliveira.judge.core.service.dto.input.authorization.AuthenticateInputDTO
import org.springframework.beans.factory.annotation.Value
import org.springframework.context.annotation.Configuration

@Configuration
class FeignConfig(
    @Value("\${security.auto-judge.password}")
    val autoJudgePassword: String,
    val authorizationService: AuthorizationService,
) : RequestInterceptor {
    override fun apply(template: RequestTemplate) {
        val authorization =
            authorizationService.authenticate(
                AuthenticateInputDTO(
                    login = "auto-judge",
                    password = autoJudgePassword,
                ),
            )
        template.header("Authorization", "Bearer ${authorization.accessToken}")
    }
}
