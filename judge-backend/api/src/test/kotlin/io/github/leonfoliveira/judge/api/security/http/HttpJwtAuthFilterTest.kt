package io.github.leonfoliveira.judge.api.security.http

import io.github.leonfoliveira.judge.common.port.JwtAdapter
import io.kotest.core.spec.style.FunSpec
import io.kotest.matchers.shouldBe
import io.mockk.clearAllMocks
import io.mockk.every
import io.mockk.mockk
import io.mockk.verify
import jakarta.servlet.FilterChain
import jakarta.servlet.http.Cookie
import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletResponse
import org.springframework.security.core.context.SecurityContextHolder

class HttpJwtAuthFilterTest :
    FunSpec({
        val jwtAdapter = mockk<JwtAdapter>(relaxed = true)

        val sut = HttpAuthExtractionFilter(jwtAdapter)

        beforeEach {
            SecurityContextHolder.clearContext()
            clearAllMocks()
        }

        test("should not set authorization when no access token cookie is present") {
            val request = mockk<HttpServletRequest>(relaxed = true)
            val response = mockk<HttpServletResponse>(relaxed = true)
            val filterChain = mockk<FilterChain>(relaxed = true)
            every { request.cookies } returns null

            sut.doFilterInternal(request, response, filterChain)

            SecurityContextHolder.getContext().authentication.isAuthenticated shouldBe false
        }

        test("should not set authorization when no access token cookie is blank") {
            val request = mockk<HttpServletRequest>(relaxed = true)
            val response = mockk<HttpServletResponse>(relaxed = true)
            val filterChain = mockk<FilterChain>(relaxed = true)
            every { request.cookies } returns arrayOf(Cookie("access_token", ""))

            sut.doFilterInternal(request, response, filterChain)

            SecurityContextHolder.getContext().authentication.isAuthenticated shouldBe false
        }

        test("should not set authorization when access token is invalid") {
            val request = mockk<HttpServletRequest>(relaxed = true)
            val response = mockk<HttpServletResponse>(relaxed = true)
            val filterChain = mockk<FilterChain>(relaxed = true)
            every { request.cookies } returns arrayOf(Cookie("access_token", "invalid-token"))
            every { jwtAdapter.decodeToken("invalid-token") } throws RuntimeException("Invalid token")

            sut.doFilterInternal(request, response, filterChain)

            SecurityContextHolder.getContext().authentication.isAuthenticated shouldBe false
        }

        test("should set authorization when access token is valid") {
            val request = mockk<HttpServletRequest>(relaxed = true)
            val response = mockk<HttpServletResponse>(relaxed = true)
            val filterChain = mockk<FilterChain>(relaxed = true)
            val expectedAuthorization =
                io.github.leonfoliveira.judge.common.mock.entity.AuthorizationMockBuilder
                    .build()
            every { request.cookies } returns arrayOf(Cookie("access_token", "valid-token"))
            every { jwtAdapter.decodeToken("valid-token") } returns expectedAuthorization

            sut.doFilterInternal(request, response, filterChain)

            SecurityContextHolder.getContext().authentication.isAuthenticated shouldBe true
            SecurityContextHolder.getContext().authentication.principal shouldBe expectedAuthorization
            verify { jwtAdapter.decodeToken("valid-token") }
        }
    })
