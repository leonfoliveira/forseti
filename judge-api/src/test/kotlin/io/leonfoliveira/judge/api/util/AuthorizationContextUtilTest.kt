package io.leonfoliveira.judge.api.util

import io.kotest.assertions.throwables.shouldThrow
import io.kotest.core.spec.style.FunSpec
import io.kotest.matchers.shouldBe
import io.leonfoliveira.judge.core.domain.exception.UnauthorizedException
import io.leonfoliveira.judge.core.domain.model.AuthorizationMember
import io.mockk.every
import io.mockk.mockkStatic
import org.springframework.security.core.context.SecurityContextHolder

class AuthorizationContextUtilTest : FunSpec({
    beforeEach {
        mockkStatic(SecurityContextHolder::class)
    }

    test("should throw UnauthorizedException when authorization is null") {
        every { SecurityContextHolder.getContext() }
            .returns(SecurityContextMockFactory.build())

        shouldThrow<UnauthorizedException> {
            AuthorizationContextUtil.getAuthorization()
        }
    }

    test("should return authorization when authorization is not null") {
        val expectedAuthorization = AuthorizationMember.ROOT
        every { SecurityContextHolder.getContext() }
            .returns(SecurityContextMockFactory.build(expectedAuthorization))

        val authorization = AuthorizationContextUtil.getAuthorization()

        authorization shouldBe expectedAuthorization
    }
})
