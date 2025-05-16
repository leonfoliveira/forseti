package io.leonfoliveira.judge.api.util

import io.leonfoliveira.judge.api.config.JwtAuthentication
import io.leonfoliveira.judge.core.domain.entity.Member
import io.leonfoliveira.judge.core.domain.model.Authorization
import io.mockk.every
import io.mockk.mockk
import org.springframework.security.core.context.SecurityContext

object SecurityContextMockFactory {
    fun buildRoot() = build(Authorization.ROOT)

    fun buildContestant(
        authorization: Authorization =
            Authorization(
                id = 1,
                name = "name",
                login = "login",
                type = Member.Type.CONTESTANT,
            ),
    ) = build(authorization)

    fun build(authorization: Authorization? = null) =
        mockk<SecurityContext>().apply {
            every { authentication }
                .returns(JwtAuthentication(authorization))
            every { authentication = any() }
                .returns(Unit)
        }
}
