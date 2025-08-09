package io.github.leonfoliveira.judge.common.port

import io.github.leonfoliveira.judge.common.domain.entity.Member
import io.github.leonfoliveira.judge.common.domain.model.Authorization

interface JwtAdapter {
    fun buildAuthorization(member: Member): Authorization

    fun encodeToken(authorization: Authorization): String

    fun decodeToken(token: String): Authorization
}
