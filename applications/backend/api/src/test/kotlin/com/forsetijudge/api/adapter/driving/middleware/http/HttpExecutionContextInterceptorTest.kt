package com.forsetijudge.api.adapter.driving.middleware.http

import com.forsetijudge.core.application.util.IdGenerator
import com.forsetijudge.core.domain.model.ExecutionContext
import io.kotest.core.spec.style.FunSpec
import io.kotest.matchers.shouldBe
import io.mockk.clearAllMocks
import io.mockk.every
import io.mockk.mockk
import io.opentelemetry.api.trace.Span
import jakarta.servlet.FilterChain
import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletResponse

class HttpExecutionContextInterceptorTest :
    FunSpec({
        val sut = HttpExecutionContextInterceptor()

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

        test("should extract contestId from path and set it in ExecutionContext") {
            val request = mockk<HttpServletRequest>(relaxed = true)
            val response = mockk<HttpServletResponse>(relaxed = true)
            val filterChain = mockk<FilterChain>(relaxed = true)
            val contestId = IdGenerator.getUUID()
            every { request.method } returns "GET"
            every { request.requestURI } returns "/v1/contests/$contestId/some-endpoint"
            every { request.cookies } returns null

            sut.preHandle(request, response, filterChain)

            ExecutionContext.get().contestId shouldBe contestId
        }

        test("should not set contestId in ExecutionContext if path does not contain contestId") {
            val request = mockk<HttpServletRequest>(relaxed = true)
            val response = mockk<HttpServletResponse>(relaxed = true)
            val filterChain = mockk<FilterChain>(relaxed = true)
            every { request.method } returns "GET"
            every { request.requestURI } returns "/v1/some-endpoint"
            every { request.cookies } returns null

            sut.preHandle(request, response, filterChain)

            ExecutionContext.get().contestId shouldBe null
        }
    })
