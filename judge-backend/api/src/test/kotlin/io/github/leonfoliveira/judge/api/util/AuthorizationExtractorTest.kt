package io.github.leonfoliveira.judge.api.util

import io.github.leonfoliveira.judge.common.domain.entity.Member
import io.github.leonfoliveira.judge.common.domain.model.AuthorizationMember
import io.github.leonfoliveira.judge.common.mock.entity.AuthorizationMockBuilder
import io.github.leonfoliveira.judge.common.port.JwtAdapter
import io.kotest.core.spec.style.FunSpec
import io.kotest.matchers.shouldBe
import io.mockk.every
import io.mockk.mockk
import org.springframework.security.core.context.SecurityContextHolder
import java.util.UUID

class AuthorizationExtractorTest : FunSpec({
    val jwtAdapter = mockk<JwtAdapter>(relaxed = true)

    val sut = AuthorizationExtractor(jwtAdapter)

    beforeEach {
        SecurityContextHolder.clearContext()
    }

    test("should return null when access token is null") {
        val result = sut.extract(null)

        result shouldBe null
        SecurityContextHolder.getContext().authentication.isAuthenticated shouldBe false
    }

    test("should return null when access token is empty") {
        val result = sut.extract("")

        result shouldBe null
        SecurityContextHolder.getContext().authentication.isAuthenticated shouldBe false
    }

    test("should not authenticate when access token is valid but token is invalid") {
        every { jwtAdapter.decodeToken("invalid-token") } throws RuntimeException("Invalid token")

        val result = sut.extract("invalid-token")

        result shouldBe null
        SecurityContextHolder.getContext().authentication.isAuthenticated shouldBe false
    }

    test("should return AuthorizationMember when token is valid") {
        val expectedAuthorization =
            AuthorizationMockBuilder.build(
                member =
                    AuthorizationMember(
                        id = UUID.randomUUID(),
                        type = Member.Type.ROOT,
                        name = "Test User",
                    ),
            )
        every { jwtAdapter.decodeToken("valid-token") } returns expectedAuthorization

        val result = sut.extract("valid-token")

        result shouldBe expectedAuthorization
        SecurityContextHolder.getContext().authentication.isAuthenticated shouldBe true
        SecurityContextHolder.getContext().authentication.principal shouldBe expectedAuthorization
    }
})
