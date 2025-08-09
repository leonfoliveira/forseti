package io.github.leonfoliveira.judge.api.security.http

import io.github.leonfoliveira.judge.api.security.JwtAuthentication
import io.github.leonfoliveira.judge.api.util.Private
import io.github.leonfoliveira.judge.common.domain.entity.Member
import io.github.leonfoliveira.judge.common.domain.exception.ForbiddenException
import io.github.leonfoliveira.judge.common.domain.exception.UnauthorizedException
import io.github.leonfoliveira.judge.common.domain.model.Authorization
import io.github.leonfoliveira.judge.common.domain.model.AuthorizationMember
import io.github.leonfoliveira.judge.common.mock.entity.AuthorizationMockBuilder
import io.kotest.assertions.throwables.shouldThrow
import io.kotest.core.spec.style.FunSpec
import io.kotest.matchers.shouldBe
import io.mockk.every
import io.mockk.mockk
import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletResponse
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.web.method.HandlerMethod
import java.util.UUID

class HttpPrivateInterceptorTest : FunSpec({
    val sut = HttpPrivateInterceptor()

    test("should return true when handler is not a HandlerMethod") {
        val request = mockk<HttpServletRequest>()
        val response = mockk<HttpServletResponse>()
        val handler = Any()

        sut.preHandle(request, response, handler) shouldBe true
    }

    test("should return true when no Private annotation is found") {
        val request = mockk<HttpServletRequest>()
        val response = mockk<HttpServletResponse>()
        val handler = mockk<HandlerMethod>(relaxed = true)
        every { handler.getMethodAnnotation(Private::class.java) } returns null

        sut.preHandle(request, response, handler) shouldBe true
    }

    test("should throw UnauthorizedException when auth is null") {
        val request = mockk<HttpServletRequest>()
        val response = mockk<HttpServletResponse>()
        val handler = mockk<HandlerMethod>(relaxed = true)
        every { handler.getMethodAnnotation(Private::class.java) } returns Private()
        SecurityContextHolder.clearContext()

        shouldThrow<UnauthorizedException> {
            sut.preHandle(request, response, handler)
        }
    }

    test("should throw UnauthorizedException when not authenticated") {
        val request = mockk<HttpServletRequest>()
        val response = mockk<HttpServletResponse>()
        val handler = mockk<HandlerMethod>(relaxed = true)
        every { handler.getMethodAnnotation(Private::class.java) } returns Private()
        SecurityContextHolder.getContext().authentication = JwtAuthentication()

        shouldThrow<UnauthorizedException> {
            sut.preHandle(request, response, handler)
        }
    }

    test("should return ForbiddenException when user type is not allowed") {
        val request = mockk<HttpServletRequest>()
        val response = mockk<HttpServletResponse>()
        val handler = mockk<HandlerMethod>(relaxed = true)
        every { handler.getMethodAnnotation(Private::class.java) } returns Private(allowed = [Member.Type.ROOT])
        SecurityContextHolder.getContext().authentication =
            JwtAuthentication(
                AuthorizationMockBuilder.build(
                    member = AuthorizationMember(
                        id = UUID.randomUUID(),
                        type = Member.Type.CONTESTANT,
                        name = "Test User",
                    ),
                )
            )

        shouldThrow<ForbiddenException> {
            sut.preHandle(request, response, handler)
        }
    }

    test("should return true when user is authenticated and allowed") {
        val request = mockk<HttpServletRequest>()
        val response = mockk<HttpServletResponse>()
        val handler = mockk<HandlerMethod>(relaxed = true)
        every { handler.getMethodAnnotation(Private::class.java) } returns Private(allowed = [Member.Type.ROOT, Member.Type.CONTESTANT])
        SecurityContextHolder.getContext().authentication =
            JwtAuthentication(
                AuthorizationMockBuilder.build(
                        member = AuthorizationMember(
                        id = UUID.randomUUID(),
                        type = Member.Type.CONTESTANT,
                        name = "Test User",
                    )
                )
            )

        sut.preHandle(request, response, handler) shouldBe true
    }
})
