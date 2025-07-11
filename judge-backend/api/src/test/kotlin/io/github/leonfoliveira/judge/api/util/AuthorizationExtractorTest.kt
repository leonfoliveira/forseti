package io.github.leonfoliveira.judge.api.util

import io.github.leonfoliveira.judge.common.domain.entity.Member
import io.github.leonfoliveira.judge.common.domain.model.AuthorizationMember
import io.github.leonfoliveira.judge.common.port.JwtAdapter
import io.kotest.core.spec.style.FunSpec
import io.kotest.matchers.shouldBe
import io.mockk.every
import io.mockk.mockk
import java.util.UUID
import org.springframework.security.core.context.SecurityContextHolder

class AuthorizationExtractorTest : FunSpec({
    val jwtAdapter = mockk<JwtAdapter>(relaxed = true)

    val sut = AuthorizationExtractor(jwtAdapter)

    beforeEach {
        SecurityContextHolder.clearContext()
    }

    test("should return null when auth header is null") {
        val result = sut.extractMember(null)

        result shouldBe null
        SecurityContextHolder.getContext().authentication.isAuthenticated shouldBe false
    }

    test("should return null when auth header does not start with 'Bearer '") {
        val result = sut.extractMember("InvalidHeader")

        result shouldBe null
        SecurityContextHolder.getContext().authentication.isAuthenticated shouldBe false
    }

    test("should return null when auth header is empty") {
        val result = sut.extractMember("Bearer ")

        result shouldBe null
        SecurityContextHolder.getContext().authentication.isAuthenticated shouldBe false
    }

    test("should not authenticate when auth header is valid but token is invalid") {
        every { jwtAdapter.decodeToken("invalid-token") } throws RuntimeException("Invalid token")

        val result = sut.extractMember("Bearer invalid-token")

        result shouldBe null
        SecurityContextHolder.getContext().authentication.isAuthenticated shouldBe false
    }

    test("should return AuthorizationMember when token is valid") {
        val expectedMember = AuthorizationMember(
            id = UUID.randomUUID(),
            type = Member.Type.ROOT,
            name = "Test User",
        )
        every { jwtAdapter.decodeToken("valid-token") } returns expectedMember

        val result = sut.extractMember("Bearer valid-token")

        result shouldBe expectedMember
        SecurityContextHolder.getContext().authentication.isAuthenticated shouldBe true
        SecurityContextHolder.getContext().authentication.principal shouldBe expectedMember
    }
})
