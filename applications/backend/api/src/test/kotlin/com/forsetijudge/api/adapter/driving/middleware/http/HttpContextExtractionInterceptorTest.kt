package com.forsetijudge.api.adapter.driving.middleware.http

import com.forsetijudge.core.domain.entity.SessionMockBuilder
import com.forsetijudge.core.domain.exception.ForbiddenException
import com.forsetijudge.core.domain.exception.UnauthorizedException
import com.forsetijudge.core.domain.model.RequestContext
import com.forsetijudge.core.port.driving.usecase.session.FindSessionUseCase
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
        val findSessionUseCase = mockk<FindSessionUseCase>(relaxed = true)

        val sut = HttpContextExtractionInterceptor(findSessionUseCase)

        beforeEach {
            RequestContext.clearContext()
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

            RequestContext.getContext().ip shouldBe "127.0.0.1"
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

            RequestContext.getContext().ip shouldBe "127.0.0.1"
        }

        test("should set traceId from span header") {
            val request = mockk<HttpServletRequest>(relaxed = true)
            val response = mockk<HttpServletResponse>(relaxed = true)
            val filterChain = mockk<FilterChain>(relaxed = true)
            every { request.method } returns "GET"
            every { request.cookies } returns null

            sut.preHandle(request, response, filterChain)

            RequestContext.getContext().traceId shouldBe Span.current().spanContext.traceId
        }

        test("should not set authorization when no session_id cookie is present") {
            val request = mockk<HttpServletRequest>(relaxed = true)
            val response = mockk<HttpServletResponse>(relaxed = true)
            val filterChain = mockk<FilterChain>(relaxed = true)
            every { request.method } returns "GET"
            every { request.cookies } returns null

            sut.preHandle(request, response, filterChain)

            RequestContext.getContext().session shouldBe null
        }

        test("should not set authorization when session_id cookie is blank") {
            val request = mockk<HttpServletRequest>(relaxed = true)
            val response = mockk<HttpServletResponse>(relaxed = true)
            val filterChain = mockk<FilterChain>(relaxed = true)
            every { request.method } returns "GET"
            every { request.cookies } returns arrayOf(Cookie("session_id", ""))

            sut.preHandle(request, response, filterChain)

            RequestContext.getContext().session shouldBe null
        }

        test("should not set authorization when session_id is invalid") {
            val request = mockk<HttpServletRequest>(relaxed = true)
            val response = mockk<HttpServletResponse>(relaxed = true)
            val filterChain = mockk<FilterChain>(relaxed = true)
            every { request.method } returns "GET"
            every { request.cookies } returns arrayOf(Cookie("session_id", "invalid-id"))

            sut.preHandle(request, response, filterChain)

            RequestContext.getContext().session shouldBe null
        }

        test("should throw UnauthorizedException when session is not found") {
            val request = mockk<HttpServletRequest>(relaxed = true)
            val response = mockk<HttpServletResponse>(relaxed = true)
            val filterChain = mockk<FilterChain>(relaxed = true)
            every { request.method } returns "GET"
            every { request.cookies } returns arrayOf(Cookie("session_id", "00000000-0000-0000-0000-000000000000"))
            every { findSessionUseCase.findByIdNullable(any()) } returns null

            shouldThrow<UnauthorizedException> {
                sut.preHandle(request, response, filterChain)
            }

            verify { findSessionUseCase.findByIdNullable(any()) }
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
            every { findSessionUseCase.findByIdNullable(expiredSession.id) } returns expiredSession

            shouldThrow<UnauthorizedException> {
                sut.preHandle(request, response, filterChain)
            }

            RequestContext.getContext().session shouldBe null
            verify { findSessionUseCase.findByIdNullable(expiredSession.id) }
        }

        test("should throw ForbiddenException with csrf token mismatch") {
            val request = mockk<HttpServletRequest>(relaxed = true)
            val response = mockk<HttpServletResponse>(relaxed = true)
            val filterChain = mockk<FilterChain>(relaxed = true)
            val expectedSession = SessionMockBuilder.build()
            every { request.method } returns "POST"
            every { request.cookies } returns arrayOf(Cookie("session_id", expectedSession.id.toString()))
            every { request.getHeader("X-CSRF-Token") } returns "invalid-csrf-token"
            every { findSessionUseCase.findByIdNullable(expectedSession.id) } returns expectedSession

            shouldThrow<ForbiddenException> {
                sut.preHandle(request, response, filterChain)
            }

            RequestContext.getContext().session shouldBe null
            verify { findSessionUseCase.findByIdNullable(expectedSession.id) }
        }

        test("should set authorization when access token is valid") {
            val request = mockk<HttpServletRequest>(relaxed = true)
            val response = mockk<HttpServletResponse>(relaxed = true)
            val filterChain = mockk<FilterChain>(relaxed = true)
            val expectedSession = SessionMockBuilder.build()
            every { request.method } returns "POST"
            every { request.cookies } returns arrayOf(Cookie("session_id", expectedSession.id.toString()))
            every { request.getHeader("X-CSRF-Token") } returns expectedSession.csrfToken.toString()
            every { findSessionUseCase.findByIdNullable(expectedSession.id) } returns expectedSession

            sut.preHandle(request, response, filterChain)

            RequestContext.getContext().session shouldBe expectedSession
        }
    })
