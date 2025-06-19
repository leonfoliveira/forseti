package io.github.leonfoliveira.judge.core.port

import io.github.leonfoliveira.judge.core.domain.entity.Member
import io.github.leonfoliveira.judge.core.domain.model.Authorization
import io.github.leonfoliveira.judge.core.domain.model.AuthorizationMember

interface JwtAdapter {
    fun generateAuthorization(member: Member): Authorization

    fun decodeToken(token: String): AuthorizationMember
}
