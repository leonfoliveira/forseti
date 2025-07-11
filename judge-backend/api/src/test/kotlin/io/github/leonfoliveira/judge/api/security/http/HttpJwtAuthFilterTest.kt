package io.github.leonfoliveira.judge.api.security.http

import io.github.leonfoliveira.judge.api.util.AuthorizationExtractor
import io.kotest.core.spec.style.FunSpec
import io.kotest.matchers.shouldBe
import io.mockk.clearAllMocks
import io.mockk.every
import io.mockk.mockk
import io.mockk.verify
import jakarta.servlet.FilterChain
import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletResponse

class HttpJwtAuthFilterTest : FunSpec({
    val authorizationExtractor = mockk<AuthorizationExtractor>(relaxed = true)

    val sut = HttpJwtAuthFilter(authorizationExtractor)

    beforeEach {
        clearAllMocks()
    }

    test("should call AuthorizationExtractor with the Authorization header") {
        val request = mockk<HttpServletRequest>(relaxed = true)
        val response = mockk<HttpServletResponse>(relaxed = true)
        val filterChain = mockk<FilterChain>(relaxed = true)
        every { request.getHeader("Authorization") } returns "Bearer token"

        sut.doFilterInternal(request, response, filterChain)

        verify { authorizationExtractor.extractMember("Bearer token") }
    }
})
