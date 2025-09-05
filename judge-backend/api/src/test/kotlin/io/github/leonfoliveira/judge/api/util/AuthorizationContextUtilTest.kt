package io.github.leonfoliveira.judge.api.util

import io.github.leonfoliveira.judge.api.security.JwtAuthentication
import io.github.leonfoliveira.judge.common.domain.entity.Member
import io.github.leonfoliveira.judge.common.domain.model.AuthorizationMember
import io.github.leonfoliveira.judge.common.mock.entity.AuthorizationMockBuilder
import io.kotest.core.spec.style.FunSpec
import io.kotest.matchers.shouldBe
import org.springframework.security.core.context.SecurityContextHolder
import java.util.UUID

class AuthorizationContextUtilTest : FunSpec({
    test("should return Authorization") {
        val expectedAuthorization = AuthorizationMockBuilder.build()
        SecurityContextHolder.getContext().authentication =
            JwtAuthentication(expectedAuthorization)

        val result = AuthorizationContextUtil.get()

        result shouldBe expectedAuthorization
    }

    test("should return AuthorizationMember") {
        val expectedAuthorizationMember =
            AuthorizationMember(
                id = UUID.randomUUID(),
                type = Member.Type.ROOT,
                name = "Test User",
            )
        SecurityContextHolder.getContext().authentication =
            JwtAuthentication(AuthorizationMockBuilder.build(member = expectedAuthorizationMember))

        val result = AuthorizationContextUtil.getMember()

        result shouldBe expectedAuthorizationMember
    }
})
