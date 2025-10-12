package io.github.leonfoliveira.forseti.api.middleware.http

import io.github.leonfoliveira.forseti.common.domain.model.RequestContext
import io.github.leonfoliveira.forseti.common.mock.entity.SessionMockBuilder
import io.github.leonfoliveira.forseti.common.repository.SessionRepository
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
import org.slf4j.MDC
import java.time.OffsetDateTime
import java.util.Optional

class HttpContextExtractionFilterTest :
    FunSpec({
        val sessionRepository = mockk<SessionRepository>(relaxed = true)

        val sut = HttpContextExtractionFilter(sessionRepository)

        beforeEach {
            RequestContext.clearContext()
            clearAllMocks()
        }

        test("should set ip from X-Forwarded-For header") {
            val request = mockk<HttpServletRequest>(relaxed = true)
            val response = mockk<HttpServletResponse>(relaxed = true)
            val filterChain = mockk<FilterChain>(relaxed = true)
            every { request.getHeader("X-Forwarded-For") } returns "127.0.0.1"
            every { request.cookies } returns null

            sut.doFilterInternal(request, response, filterChain)

            RequestContext.getContext().ip shouldBe "127.0.0.1"
        }

        test("should set ip from remote address when X-Forwarded-For header is not present") {
            val request = mockk<HttpServletRequest>(relaxed = true)
            val response = mockk<HttpServletResponse>(relaxed = true)
            val filterChain = mockk<FilterChain>(relaxed = true)
            every { request.getHeader("X-Forwarded-For") } returns null
            every { request.remoteAddr } returns "127.0.0.1"
            every { request.cookies } returns null

            sut.doFilterInternal(request, response, filterChain)

            RequestContext.getContext().ip shouldBe "127.0.0.1"
        }

        test("should set traceId from MDC") {
            val request = mockk<HttpServletRequest>(relaxed = true)
            val response = mockk<HttpServletResponse>(relaxed = true)
            val filterChain = mockk<FilterChain>(relaxed = true)
            every { request.cookies } returns null
            val traceId = "trace-id"
            MDC.put("traceId", traceId)

            sut.doFilterInternal(request, response, filterChain)

            RequestContext.getContext().traceId shouldBe traceId
            MDC.clear()
        }

        test("should not set authorization when no session_id cookie is present") {
            val request = mockk<HttpServletRequest>(relaxed = true)
            val response = mockk<HttpServletResponse>(relaxed = true)
            val filterChain = mockk<FilterChain>(relaxed = true)
            every { request.cookies } returns null

            sut.doFilterInternal(request, response, filterChain)

            RequestContext.getContext().session shouldBe null
        }

        test("should not set authorization when session_id cookie is blank") {
            val request = mockk<HttpServletRequest>(relaxed = true)
            val response = mockk<HttpServletResponse>(relaxed = true)
            val filterChain = mockk<FilterChain>(relaxed = true)
            every { request.cookies } returns arrayOf(Cookie("session_id", ""))

            sut.doFilterInternal(request, response, filterChain)

            RequestContext.getContext().session shouldBe null
        }

        test("should not set authorization when session_id is invalid") {
            val request = mockk<HttpServletRequest>(relaxed = true)
            val response = mockk<HttpServletResponse>(relaxed = true)
            val filterChain = mockk<FilterChain>(relaxed = true)
            every { request.cookies } returns arrayOf(Cookie("session_id", "invalid-id"))

            sut.doFilterInternal(request, response, filterChain)

            RequestContext.getContext().session shouldBe null
        }

        test("should not set authorization when session is not found") {
            val request = mockk<HttpServletRequest>(relaxed = true)
            val response = mockk<HttpServletResponse>(relaxed = true)
            val filterChain = mockk<FilterChain>(relaxed = true)
            every { request.cookies } returns arrayOf(Cookie("session_id", "00000000-0000-0000-0000-000000000000"))
            every { sessionRepository.findById(any()) } returns Optional.empty()

            sut.doFilterInternal(request, response, filterChain)

            RequestContext.getContext().session shouldBe null
            verify { sessionRepository.findById(any()) }
        }

        test("should not set authorization when session is expired") {
            val request = mockk<HttpServletRequest>(relaxed = true)
            val response = mockk<HttpServletResponse>(relaxed = true)
            val filterChain = mockk<FilterChain>(relaxed = true)
            val expiredSession =
                SessionMockBuilder.build(
                    expiresAt = OffsetDateTime.now().minusHours(1),
                )
            every { request.cookies } returns arrayOf(Cookie("session_id", expiredSession.id.toString()))
            every { sessionRepository.findById(expiredSession.id) } returns Optional.of(expiredSession)

            sut.doFilterInternal(request, response, filterChain)

            RequestContext.getContext().session shouldBe null
            verify { sessionRepository.findById(expiredSession.id) }
        }

        test("should set authorization when access token is valid") {
            val request = mockk<HttpServletRequest>(relaxed = true)
            val response = mockk<HttpServletResponse>(relaxed = true)
            val filterChain = mockk<FilterChain>(relaxed = true)
            val expectedSession = SessionMockBuilder.build()
            every { request.cookies } returns arrayOf(Cookie("session_id", expectedSession.id.toString()))
            every { sessionRepository.findById(expectedSession.id) } returns Optional.of(expectedSession)

            sut.doFilterInternal(request, response, filterChain)

            RequestContext.getContext().session shouldBe expectedSession
        }
    })
