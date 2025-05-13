package io.leonfoliveira.judge.core.service.dto.output

import io.leonfoliveira.judge.core.entity.model.Authorization

data class AuthorizationOutputDTO(
    val authorization: Authorization,
    val token: String,
)
