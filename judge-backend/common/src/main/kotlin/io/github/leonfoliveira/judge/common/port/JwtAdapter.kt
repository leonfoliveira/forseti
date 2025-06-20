package io.github.leonfoliveira.judge.common.port

import io.github.leonfoliveira.judge.common.domain.entity.Member
import io.github.leonfoliveira.judge.common.domain.model.Authorization
import io.github.leonfoliveira.judge.common.domain.model.AuthorizationMember

interface JwtAdapter {
    fun generateAuthorization(member: Member): Authorization

    fun decodeToken(token: String): AuthorizationMember
}
