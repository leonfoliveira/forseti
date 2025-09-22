package io.github.leonfoliveira.judge.api.middleware.http

import io.github.leonfoliveira.judge.api.util.Private
import io.github.leonfoliveira.judge.common.domain.entity.Member
import io.github.leonfoliveira.judge.common.domain.exception.ForbiddenException
import io.github.leonfoliveira.judge.common.domain.exception.UnauthorizedException
import io.github.leonfoliveira.judge.common.domain.model.RequestContext
import io.github.leonfoliveira.judge.common.mock.entity.MemberMockBuilder
import io.github.leonfoliveira.judge.common.mock.entity.SessionMockBuilder
import io.kotest.assertions.throwables.shouldThrow
import io.kotest.core.spec.style.FunSpec
import io.kotest.matchers.shouldBe
import io.mockk.every
import io.mockk.mockk
import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletResponse
import org.springframework.web.method.HandlerMethod

class HttpPrivateInterceptorTest :
    FunSpec({
        val sut = HttpPrivateInterceptor()

        beforeEach {
            RequestContext.clearContext()
        }

        test("should return true when handler is not a HandlerMethod") {
            val request = mockk<HttpServletRequest>(relaxed = true)
            val response = mockk<HttpServletResponse>(relaxed = true)
            val handler = Any()

            sut.preHandle(request, response, handler) shouldBe true
        }

        test("should return true when no Private annotation is found in method") {
            val request = mockk<HttpServletRequest>(relaxed = true)
            val response = mockk<HttpServletResponse>(relaxed = true)
            val handler = mockk<HandlerMethod>(relaxed = true)
            every { handler.getMethodAnnotation(Private::class.java) } returns null

            sut.preHandle(request, response, handler) shouldBe true
        }

        test("should return true when user type is ROOT") {
            val request = mockk<HttpServletRequest>(relaxed = true)
            val response = mockk<HttpServletResponse>(relaxed = true)
            val handler = mockk<HandlerMethod>(relaxed = true)
            every { handler.getMethodAnnotation(Private::class.java) } returns Private(allowed = [Member.Type.CONTESTANT])
            RequestContext.getContext().session =
                SessionMockBuilder.build(
                    member = MemberMockBuilder.build(type = Member.Type.ROOT),
                )

            sut.preHandle(request, response, handler) shouldBe true
        }

        test("should return UnauthorizedException when no session is found and allowed is empty") {
            val request = mockk<HttpServletRequest>(relaxed = true)
            val response = mockk<HttpServletResponse>(relaxed = true)
            val handler = mockk<HandlerMethod>(relaxed = true)
            every { handler.getMethodAnnotation(Private::class.java) } returns Private()

            shouldThrow<UnauthorizedException> {
                sut.preHandle(request, response, handler)
            }
        }

        test("should return ForbiddenException when user type is not allowed") {
            val request = mockk<HttpServletRequest>(relaxed = true)
            val response = mockk<HttpServletResponse>(relaxed = true)
            val handler = mockk<HandlerMethod>(relaxed = true)
            every { handler.getMethodAnnotation(Private::class.java) } returns Private(allowed = [Member.Type.ROOT])
            RequestContext.getContext().session =
                SessionMockBuilder.build(
                    member = MemberMockBuilder.build(type = Member.Type.CONTESTANT),
                )

            shouldThrow<ForbiddenException> {
                sut.preHandle(request, response, handler)
            }
        }

        test("should return true when user is authenticated and allowed") {
            val request = mockk<HttpServletRequest>(relaxed = true)
            val response = mockk<HttpServletResponse>(relaxed = true)
            val handler = mockk<HandlerMethod>(relaxed = true)
            every { handler.getMethodAnnotation(Private::class.java) } returns Private(allowed = [Member.Type.ROOT, Member.Type.CONTESTANT])
            RequestContext.getContext().session =
                SessionMockBuilder.build(
                    member = MemberMockBuilder.build(type = Member.Type.CONTESTANT),
                )

            sut.preHandle(request, response, handler) shouldBe true
        }
    })
