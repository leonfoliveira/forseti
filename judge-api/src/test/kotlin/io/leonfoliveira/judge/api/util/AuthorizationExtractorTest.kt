package io.leonfoliveira.judge.api.util

import io.kotest.core.spec.style.FunSpec
import io.kotest.matchers.shouldBe
import io.leonfoliveira.judge.core.domain.model.AuthorizationMemberMockFactory
import io.leonfoliveira.judge.core.port.JwtAdapter
import io.mockk.every
import io.mockk.mockk

class AuthorizationExtractorTest : FunSpec({
    val jwtAdapter = mockk<JwtAdapter>(relaxed = true)
    val sut = AuthorizationExtractor(jwtAdapter)

    context("extractMember") {
        test("returns authorization member when token is valid") {
            val authHeader = "Bearer validToken"
            val expectedMember = AuthorizationMemberMockFactory.build()
            every { jwtAdapter.decodeToken("validToken") } returns expectedMember

            val result = sut.extractMember(authHeader)

            result shouldBe expectedMember
        }

        test("returns null when auth header is null") {
            val result = sut.extractMember(null)

            result shouldBe null
        }

        test("returns null when auth header does not start with Bearer") {
            val authHeader = "InvalidHeader validToken"

            val result = sut.extractMember(authHeader)

            result shouldBe null
        }

        test("returns null when token is invalid") {
            val authHeader = "Bearer invalidToken"
            every { jwtAdapter.decodeToken("invalidToken") } throws RuntimeException("Invalid token")

            val result = sut.extractMember(authHeader)

            result shouldBe null
        }
    }
})
