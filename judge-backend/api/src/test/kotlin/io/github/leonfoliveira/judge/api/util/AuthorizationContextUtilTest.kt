package io.github.leonfoliveira.judge.api.util

import io.github.leonfoliveira.judge.api.security.JwtAuthentication
import io.github.leonfoliveira.judge.common.domain.entity.Member
import io.github.leonfoliveira.judge.common.domain.exception.UnauthorizedException
import io.github.leonfoliveira.judge.common.domain.model.AuthorizationMember
import io.github.leonfoliveira.judge.common.mock.entity.AuthorizationMockBuilder
import io.kotest.assertions.throwables.shouldThrow
import io.kotest.core.spec.style.FunSpec
import io.kotest.matchers.shouldBe
import org.springframework.security.core.context.SecurityContextHolder
import java.util.UUID

class AuthorizationContextUtilTest : FunSpec({
    test("should throw UnauthorizedException when no authentication is present") {
        SecurityContextHolder.clearContext()

        shouldThrow<UnauthorizedException> {
            AuthorizationContextUtil.getMember()
        }
    }

    test("should return AuthorizationMember when authentication is present") {
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
