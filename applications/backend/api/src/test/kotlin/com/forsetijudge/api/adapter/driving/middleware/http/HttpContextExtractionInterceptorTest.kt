package com.forsetijudge.api.adapter.driving.middleware.http

import com.forsetijudge.core.application.util.SessionCache
import com.forsetijudge.core.domain.entity.SessionMockBuilder
import com.forsetijudge.core.domain.exception.ForbiddenException
import com.forsetijudge.core.domain.exception.NotFoundException
import com.forsetijudge.core.domain.exception.UnauthorizedException
import com.forsetijudge.core.domain.model.ExecutionContext
import com.forsetijudge.core.port.driving.usecase.external.session.FindSessionByIdUseCase
import com.forsetijudge.core.port.dto.response.session.toResponseBodyDTO
import io.kotest.assertions.throwables.shouldThrow
import io.kotest.core.spec.style.FunSpec
import io.kotest.matchers.shouldBe
import io.mockk.clearAllMocks
import io.mockk.every
import io.mockk.mockk
import io.mockk.verify
import io.opentelemetry.api.trace.Span
import jakarta.servlet.FilterChain
import jakarta.servlet.http.Cookie
import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletResponse
import java.time.OffsetDateTime

class HttpContextExtractionInterceptorTest :
    FunSpec({
        val sessionCache = mockk<SessionCache>(relaxed = true)
        val findSessionByIdUseCase = mockk<FindSessionByIdUseCase>(relaxed = true)

        val sut = HttpContextExtractionInterceptor(sessionCache, findSessionByIdUseCase)

        beforeEach {
            clearAllMocks()
        }

        test("should set ip from X-Forwarded-For header") {
            val request = mockk<HttpServletRequest>(relaxed = true)
            val response = mockk<HttpServletResponse>(relaxed = true)
            val filterChain = mockk<FilterChain>(relaxed = true)
            every { request.method } returns "GET"
            every { request.getHeader("X-Forwarded-For") } returns "127.0.0.1"
            every { request.cookies } returns null

            sut.preHandle(request, response, filterChain)

            ExecutionContext.get().ip shouldBe "127.0.0.1"
        }

        test("should set ip from remote address when X-Forwarded-For header is not present") {
            val request = mockk<HttpServletRequest>(relaxed = true)
            val response = mockk<HttpServletResponse>(relaxed = true)
            val filterChain = mockk<FilterChain>(relaxed = true)
            every { request.method } returns "GET"
            every { request.getHeader("X-Forwarded-For") } returns null
            every { request.remoteAddr } returns "127.0.0.1"
            every { request.cookies } returns null

            sut.preHandle(request, response, filterChain)

            ExecutionContext.get().ip shouldBe "127.0.0.1"
        }

        test("should set traceId from span header") {
            val request = mockk<HttpServletRequest>(relaxed = true)
            val response = mockk<HttpServletResponse>(relaxed = true)
            val filterChain = mockk<FilterChain>(relaxed = true)
            every { request.method } returns "GET"
            every { request.cookies } returns null

            sut.preHandle(request, response, filterChain)

            ExecutionContext.get().traceId shouldBe Span.current().spanContext.traceId
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

        test("should throw UnauthorizedException when session is not found") {
            val request = mockk<HttpServletRequest>(relaxed = true)
            val response = mockk<HttpServletResponse>(relaxed = true)
            val filterChain = mockk<FilterChain>(relaxed = true)
            every { request.method } returns "GET"
            every { request.cookies } returns arrayOf(Cookie("session_id", "00000000-0000-0000-0000-000000000000"))
            every { findSessionByIdUseCase.execute(any()) } throws NotFoundException()

            shouldThrow<UnauthorizedException> {
                sut.preHandle(request, response, filterChain)
            }

            verify { findSessionByIdUseCase.execute(any()) }
        }

        test("should throw UnauthorizedException when session is expired") {
            val request = mockk<HttpServletRequest>(relaxed = true)
            val response = mockk<HttpServletResponse>(relaxed = true)
            val filterChain = mockk<FilterChain>(relaxed = true)
            val expiredSession =
                SessionMockBuilder.build(
                    expiresAt = OffsetDateTime.now().minusHours(1),
                )
            every { request.method } returns "GET"
            every { request.cookies } returns arrayOf(Cookie("session_id", expiredSession.id.toString()))
            every { request.getHeader("X-CSRF-Token") } returns expiredSession.csrfToken.toString()
            val command = FindSessionByIdUseCase.Command(expiredSession.id)
            every { findSessionByIdUseCase.execute(command) } returns expiredSession

            shouldThrow<UnauthorizedException> {
                sut.preHandle(request, response, filterChain)
            }

            verify { findSessionByIdUseCase.execute(command) }
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

        test("should not set authorization when route contestId is different from session contestId") {
            val request = mockk<HttpServletRequest>(relaxed = true)
            val response = mockk<HttpServletResponse>(relaxed = true)
            val filterChain = mockk<FilterChain>(relaxed = true)
            val expectedSession = SessionMockBuilder.build()
            every { request.method } returns "GET"
            every { request.requestURI } returns "/api/v1/contests/11111111-1111-1111-1111-111111111111"
            every { request.cookies } returns arrayOf(Cookie("session_id", expectedSession.id.toString()))
            val command = FindSessionByIdUseCase.Command(expectedSession.id)
            every { findSessionByIdUseCase.execute(command) } returns expectedSession

            sut.preHandle(request, response, filterChain)

            ExecutionContext.get().session shouldBe null
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

            ExecutionContext.get().session shouldBe expectedSession.toResponseBodyDTO()
        }
    })
