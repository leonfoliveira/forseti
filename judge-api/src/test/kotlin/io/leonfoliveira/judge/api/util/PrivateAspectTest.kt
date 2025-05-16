package io.leonfoliveira.judge.api.util

import io.kotest.assertions.throwables.shouldThrow
import io.kotest.core.spec.style.FunSpec
import io.leonfoliveira.judge.core.domain.entity.Member
import io.leonfoliveira.judge.core.domain.exception.ForbiddenException
import io.leonfoliveira.judge.core.domain.exception.UnauthorizedException
import io.mockk.every
import io.mockk.mockkStatic
import org.springframework.security.core.context.SecurityContextHolder

class PrivateAspectTest : FunSpec({
    beforeEach {
        mockkStatic(SecurityContextHolder::class)
    }

    test("should throw UnauthorizedException when user is not authenticated") {
        every { SecurityContextHolder.getContext() }
            .returns(SecurityContextMockFactory.build())

        shouldThrow<UnauthorizedException> {
            PrivateAspect().checkAuthorization(Private())
        }
    }

    test("should throw ForbiddenException when user is authenticated but not authorized") {
        every { SecurityContextHolder.getContext() }
            .returns(SecurityContextMockFactory.buildContestant())

        shouldThrow<ForbiddenException> {
            PrivateAspect().checkAuthorization(Private(Member.Type.ROOT))
        }
    }
})
