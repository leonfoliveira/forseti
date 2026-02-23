package com.forsetijudge.api.adapter.driving.middleware.http

import com.forsetijudge.core.domain.entity.SessionMockBuilder
import com.forsetijudge.core.domain.exception.ForbiddenException
import com.forsetijudge.core.domain.model.ExecutionContext
import com.forsetijudge.core.port.driving.usecase.external.session.FindSessionByIdUseCase
import io.kotest.assertions.throwables.shouldThrow
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

class HttpAuthenticationInterceptorTest :
    FunSpec({
        val findSessionByIdUseCase = mockk<FindSessionByIdUseCase>(relaxed = true)

        val sut = HttpAuthenticationInterceptor(findSessionByIdUseCase)

        beforeEach {
            clearAllMocks()
            ExecutionContext.start()
        }

        test("should not set authorization when no session_id cookie is present") {
            val request = mockk<HttpServletRequest>(relaxed = true)
            val response = mockk<HttpServletResponse>(relaxed = true)
            val filterChain = mockk<FilterChain>(relaxed = true)
            every { request.method } returns "GET"
            every { request.cookies } returns null

            sut.preHandle(request, response, filterChain)

            ExecutionContext.get().session shouldBe null
        }

        test("should not set authorization when session_id cookie is blank") {
            val request = mockk<HttpServletRequest>(relaxed = true)
            val response = mockk<HttpServletResponse>(relaxed = true)
            val filterChain = mockk<FilterChain>(relaxed = true)
            every { request.method } returns "GET"
            every { request.cookies } returns arrayOf(Cookie("session_id", ""))

            sut.preHandle(request, response, filterChain)

            ExecutionContext.get().session shouldBe null
        }

        test("should not set authorization when session_id is invalid") {
            val request = mockk<HttpServletRequest>(relaxed = true)
            val response = mockk<HttpServletResponse>(relaxed = true)
            val filterChain = mockk<FilterChain>(relaxed = true)
            every { request.method } returns "GET"
            every { request.cookies } returns arrayOf(Cookie("session_id", "invalid-id"))

            sut.preHandle(request, response, filterChain)

            ExecutionContext.get().session shouldBe null
        }

        test("should throw ForbiddenException with csrf token mismatch") {
            val request = mockk<HttpServletRequest>(relaxed = true)
            val response = mockk<HttpServletResponse>(relaxed = true)
            val filterChain = mockk<FilterChain>(relaxed = true)
            val expectedSession = SessionMockBuilder.build()
            every { request.method } returns "POST"
            every { request.cookies } returns arrayOf(Cookie("session_id", expectedSession.id.toString()))
            every { request.getHeader("X-CSRF-Token") } returns "invalid-csrf-token"
            val command = FindSessionByIdUseCase.Command(expectedSession.id)
            every { findSessionByIdUseCase.execute(command) } returns expectedSession

            shouldThrow<ForbiddenException> {
                sut.preHandle(request, response, filterChain)
            }

            verify { findSessionByIdUseCase.execute(command) }
        }

        test("should set authorization when access token is valid") {
            val request = mockk<HttpServletRequest>(relaxed = true)
            val response = mockk<HttpServletResponse>(relaxed = true)
            val filterChain = mockk<FilterChain>(relaxed = true)
            val expectedSession = SessionMockBuilder.build()
            every { request.method } returns "POST"
            every { request.cookies } returns arrayOf(Cookie("session_id", expectedSession.id.toString()))
            every { request.getHeader("X-CSRF-Token") } returns expectedSession.csrfToken.toString()
            val command = FindSessionByIdUseCase.Command(expectedSession.id)
            every { findSessionByIdUseCase.execute(command) } returns expectedSession

            sut.preHandle(request, response, filterChain)

            ExecutionContext.get().session shouldBe expectedSession
        }
    })
