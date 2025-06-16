package io.github.leonfoliveira.judge.core.domain.model

import io.github.leonfoliveira.judge.core.domain.entity.Member
import java.util.UUID

data class AuthorizationMember(
    val id: UUID,
    val contestId: UUID?,
    val name: String,
    val type: Member.Type,
)
