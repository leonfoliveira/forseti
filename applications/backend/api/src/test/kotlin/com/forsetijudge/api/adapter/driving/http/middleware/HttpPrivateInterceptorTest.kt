package com.forsetijudge.api.adapter.driving.http.middleware

import com.forsetijudge.api.adapter.util.Private
import com.forsetijudge.core.domain.entity.Member
import com.forsetijudge.core.domain.entity.MemberMockBuilder
import com.forsetijudge.core.domain.entity.SessionMockBuilder
import com.forsetijudge.core.domain.exception.ForbiddenException
import com.forsetijudge.core.domain.model.ExecutionContext
import com.forsetijudge.core.port.dto.response.session.toResponseBodyDTO
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

        test("should return ForbiddenException when user type is not allowed") {
            val request = mockk<HttpServletRequest>(relaxed = true)
            val response = mockk<HttpServletResponse>(relaxed = true)
            val handler = mockk<HandlerMethod>(relaxed = true)
            every { handler.getMethodAnnotation(Private::class.java) } returns Private(allowed = [Member.Type.ROOT])
            ExecutionContext.start()
            ExecutionContext.setSession(
                SessionMockBuilder.build(member = MemberMockBuilder.build(type = Member.Type.CONTESTANT)).toResponseBodyDTO(),
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
            ExecutionContext.start()
            ExecutionContext.setSession(
                SessionMockBuilder.build(member = MemberMockBuilder.build(type = Member.Type.CONTESTANT)).toResponseBodyDTO(),
            )

            sut.preHandle(request, response, handler) shouldBe true
        }
    })
