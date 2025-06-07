package io.leonfoliveira.judge.api.util

import io.leonfoliveira.judge.api.security.JwtAuthentication
import io.leonfoliveira.judge.core.domain.entity.Member
import io.leonfoliveira.judge.core.domain.model.AuthorizationMember
import io.mockk.every
import io.mockk.mockk
import org.springframework.security.core.context.SecurityContext
import java.util.UUID

object SecurityContextMockFactory {
    fun buildRoot() = build(AuthorizationMember.ROOT)

    fun buildContestant(
        authorization: AuthorizationMember =
            AuthorizationMember(
                id = UUID.randomUUID(),
                name = "name",
                login = "login",
                type = Member.Type.CONTESTANT,
            ),
    ) = build(authorization)

    fun buildJudge(
        authorization: AuthorizationMember =
            AuthorizationMember(
                id = UUID.randomUUID(),
                name = "judge",
                login = "login",
                type = Member.Type.JUDGE,
            ),
    ) = build(authorization)

    fun build(authorization: AuthorizationMember? = null) =
        mockk<SecurityContext>().apply {
            every { authentication }
                .returns(JwtAuthentication(authorization))
            every { authentication = any() }
                .returns(Unit)
        }
}
