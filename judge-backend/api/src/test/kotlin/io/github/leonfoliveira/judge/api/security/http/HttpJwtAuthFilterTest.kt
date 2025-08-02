package io.github.leonfoliveira.judge.api.security.http

import io.github.leonfoliveira.judge.api.util.AuthorizationExtractor
import io.kotest.core.spec.style.FunSpec
import io.mockk.clearAllMocks
import io.mockk.every
import io.mockk.mockk
import io.mockk.verify
import jakarta.servlet.FilterChain
import jakarta.servlet.http.Cookie
import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletResponse

class HttpJwtAuthFilterTest : FunSpec({
    val authorizationExtractor = mockk<AuthorizationExtractor>(relaxed = true)

    val sut = HttpJwtAuthFilter(authorizationExtractor)

    beforeEach {
        clearAllMocks()
    }

    test("should call AuthorizationExtractor with the access token") {
        val request = mockk<HttpServletRequest>(relaxed = true)
        val response = mockk<HttpServletResponse>(relaxed = true)
        val filterChain = mockk<FilterChain>(relaxed = true)
        every { request.cookies } returns arrayOf(Cookie("access_token", "token"))

        sut.doFilterInternal(request, response, filterChain)

        verify { authorizationExtractor.extractMember("token") }
    }

    test("should call AuthorizationExtractor with null when no access token cookie is present") {
        val request = mockk<HttpServletRequest>(relaxed = true)
        val response = mockk<HttpServletResponse>(relaxed = true)
        val filterChain = mockk<FilterChain>(relaxed = true)
        every { request.cookies } returns null

        sut.doFilterInternal(request, response, filterChain)

        verify { authorizationExtractor.extractMember(null) }
    }

    test("should call AuthorizationExtractor without access token when no cookies are present") {
        val request = mockk<HttpServletRequest>(relaxed = true)
        val response = mockk<HttpServletResponse>(relaxed = true)
        val filterChain = mockk<FilterChain>(relaxed = true)
        every { request.cookies } returns arrayOf()

        sut.doFilterInternal(request, response, filterChain)

        verify { authorizationExtractor.extractMember(null) }
    }
})
