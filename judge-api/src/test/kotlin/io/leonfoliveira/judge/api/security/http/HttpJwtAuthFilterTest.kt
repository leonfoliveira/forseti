package io.leonfoliveira.judge.api.security.http

import io.kotest.core.spec.style.FunSpec
import io.leonfoliveira.judge.api.util.AuthorizationExtractor
import io.mockk.every
import io.mockk.mockk
import io.mockk.verify
import jakarta.servlet.FilterChain
import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletResponse

class HttpJwtAuthFilterTest : FunSpec({

    val authorizationExtractor = mockk<AuthorizationExtractor>(relaxed = true)
    val sut = HttpJwtAuthFilter(authorizationExtractor)

    val request = mockk<HttpServletRequest>()
    val response = mockk<HttpServletResponse>()
    val filterChain = mockk<FilterChain>(relaxed = true)

    test("doFilterInternal should extract member from authorization header and continue filter chain") {
        val authHeader = "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." // Example JWT

        every { request.getHeader("Authorization") } returns authHeader

        sut.doFilterInternal(request, response, filterChain)

        verify(exactly = 1) { request.getHeader("Authorization") }
        verify(exactly = 1) { authorizationExtractor.extractMember(authHeader) }
        verify(exactly = 1) { filterChain.doFilter(request, response) }
    }
})
