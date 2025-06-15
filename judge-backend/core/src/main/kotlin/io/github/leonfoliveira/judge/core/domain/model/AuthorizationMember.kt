package io.github.leonfoliveira.judge.core.domain.model

import io.github.leonfoliveira.judge.core.domain.entity.Member
import java.util.UUID

data class AuthorizationMember(
    val id: UUID,
    val name: String,
    val login: String,
    val type: Member.Type,
)
