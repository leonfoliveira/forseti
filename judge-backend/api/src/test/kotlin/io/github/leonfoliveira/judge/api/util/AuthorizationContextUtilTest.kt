package io.github.leonfoliveira.judge.api.util

import io.github.leonfoliveira.judge.api.security.JwtAuthentication
import io.github.leonfoliveira.judge.common.mock.entity.AuthorizationMockBuilder
import io.kotest.core.spec.style.FunSpec
import io.kotest.matchers.shouldBe
import io.mockk.every
import io.mockk.mockkStatic
import org.springframework.security.core.context.SecurityContextHolder

class AuthorizationContextUtilTest :
    FunSpec({
        beforeEach {
            mockkStatic(SecurityContextHolder::class)
        }

        test("should return Authorization") {
            val expectedAuthorization = AuthorizationMockBuilder.build()
            every { SecurityContextHolder.getContext().authentication } returns JwtAuthentication(expectedAuthorization)

            val result = AuthorizationContextUtil.get()

            result shouldBe expectedAuthorization
        }
    })
