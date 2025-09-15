package io.github.leonfoliveira.judge.api.security.http

import io.github.leonfoliveira.judge.api.security.SessionAuthentication
import io.github.leonfoliveira.judge.api.service.RateLimitService
import io.github.leonfoliveira.judge.api.util.RateLimit
import io.github.leonfoliveira.judge.common.domain.entity.Member
import io.github.leonfoliveira.judge.common.domain.exception.TooManyRequestsException
import io.github.leonfoliveira.judge.common.mock.entity.MemberMockBuilder
import io.github.leonfoliveira.judge.common.mock.entity.SessionMockBuilder
import io.kotest.assertions.throwables.shouldThrow
import io.kotest.core.spec.style.FunSpec
import io.kotest.matchers.shouldBe
import io.mockk.clearAllMocks
import io.mockk.every
import io.mockk.mockk
import io.mockk.verify
import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletResponse
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.web.method.HandlerMethod
import java.util.UUID

class HttpRateLimitInterceptorTest :
    FunSpec({
        val rateLimitService = mockk<RateLimitService>(relaxed = true)

        val sut = HttpRateLimitInterceptor(rateLimitService)

        beforeEach {
            clearAllMocks()
        }

        test("should return true when handler is not a HandlerMethod") {
            val request = mockk<HttpServletRequest>(relaxed = true)
            val response = mockk<HttpServletResponse>(relaxed = true)
            val handler = Any()

            sut.preHandle(request, response, handler) shouldBe true
        }

        test("should return true when user type is ROOT") {
            val request = mockk<HttpServletRequest>(relaxed = true)
            val response = mockk<HttpServletResponse>(relaxed = true)
            val handler = mockk<HandlerMethod>(relaxed = true)
            SecurityContextHolder.getContext().authentication =
                SessionAuthentication(
                    SessionMockBuilder.build(
                        member = MemberMockBuilder.build(type = Member.Type.ROOT),
                    ),
                )
            sut.preHandle(request, response, handler) shouldBe true
        }

        test("should return true when no RateLimit annotation is found") {
            val request = mockk<HttpServletRequest>(relaxed = true)
            val response = mockk<HttpServletResponse>(relaxed = true)
            val handler = mockk<HandlerMethod>(relaxed = true)
            every { handler.getMethodAnnotation(RateLimit::class.java) } returns null
            every { handler.beanType.getAnnotation(RateLimit::class.java) } returns null

            sut.preHandle(request, response, handler) shouldBe true
        }

        test("should extract key correctly for authenticated user") {
            val request = mockk<HttpServletRequest>(relaxed = true)
            val response = mockk<HttpServletResponse>(relaxed = true)
            val handler = mockk<HandlerMethod>(relaxed = true)
            val rateLimitAnnotation =
                RateLimit(
                    perMinute = 10,
                    perHour = 100,
                    burst = 5,
                )
            every { handler.getMethodAnnotation(RateLimit::class.java) } returns rateLimitAnnotation
            val ip = "192.0.0.1"
            every { request.getHeader("X-Forwarded-For") } returns ip
            val memberId = UUID.randomUUID()
            SecurityContextHolder.getContext().authentication =
                SessionAuthentication(
                    SessionMockBuilder.build(
                        member = MemberMockBuilder.build(id = memberId, type = Member.Type.CONTESTANT),
                    ),
                )
            every { rateLimitService.tryConsume(any(), any(), any(), any()) } returns true

            sut.preHandle(request, response, handler) shouldBe true

            verify {
                rateLimitService.tryConsume(
                    key = "${memberId}_$ip",
                    requestsPerMinute = 10,
                    requestsPerHour = 100,
                    burstCapacity = 5,
                )
            }
        }

        test("should extract key correctly for unauthenticated user") {
            val request = mockk<HttpServletRequest>(relaxed = true)
            val response = mockk<HttpServletResponse>(relaxed = true)
            val handler = mockk<HandlerMethod>(relaxed = true)
            val rateLimitAnnotation =
                RateLimit(
                    perMinute = 10,
                    perHour = 100,
                    burst = 5,
                )
            every { handler.getMethodAnnotation(RateLimit::class.java) } returns rateLimitAnnotation
            val ip = "192.0.0.1"
            every { request.getHeader("X-Forwarded-For") } returns null
            every { request.remoteAddr } returns ip
            SecurityContextHolder.clearContext()
            every { rateLimitService.tryConsume(any(), any(), any(), any()) } returns true

            sut.preHandle(request, response, handler) shouldBe true

            verify {
                rateLimitService.tryConsume(
                    key = ip,
                    requestsPerMinute = 10,
                    requestsPerHour = 100,
                    burstCapacity = 5,
                )
            }
        }

        test("should throw TooManyRequestsException when rate limit is exceeded") {
            val request = mockk<HttpServletRequest>(relaxed = true)
            val response = mockk<HttpServletResponse>(relaxed = true)
            val handler = mockk<HandlerMethod>(relaxed = true)
            val rateLimitAnnotation =
                RateLimit(
                    perMinute = 10,
                    perHour = 100,
                    burst = 5,
                )
            every { handler.getMethodAnnotation(RateLimit::class.java) } returns rateLimitAnnotation
            every { request.getHeader("X-Forwarded-For") } returns null
            every { request.remoteAddr } returns null
            SecurityContextHolder.clearContext()
            every { rateLimitService.tryConsume(any(), any(), any(), any()) } returns false

            shouldThrow<TooManyRequestsException> {
                sut.preHandle(request, response, handler)
            }

            verify {
                rateLimitService.tryConsume(
                    key = "unknown",
                    requestsPerMinute = 10,
                    requestsPerHour = 100,
                    burstCapacity = 5,
                )
            }
        }
    })
