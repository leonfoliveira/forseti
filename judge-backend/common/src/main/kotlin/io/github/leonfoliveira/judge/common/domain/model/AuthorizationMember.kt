package io.github.leonfoliveira.judge.common.domain.model

import io.github.leonfoliveira.judge.common.domain.entity.Member
import java.util.UUID

data class AuthorizationMember(
    val id: UUID,
    val contestId: UUID? = null,
    val name: String,
    val type: Member.Type,
)
