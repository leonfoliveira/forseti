package io.github.leonfoliveira.judge.api.security.websocket

import io.github.leonfoliveira.judge.api.security.JwtAuthentication
import io.github.leonfoliveira.judge.common.domain.entity.Member
import io.github.leonfoliveira.judge.common.domain.exception.ForbiddenException
import io.github.leonfoliveira.judge.common.domain.exception.UnauthorizedException
import io.github.leonfoliveira.judge.common.domain.model.AuthorizationMember
import io.kotest.assertions.throwables.shouldThrow
import io.kotest.core.spec.style.FunSpec
import io.kotest.matchers.shouldBe
import io.mockk.clearAllMocks
import io.mockk.every
import io.mockk.mockk
import io.mockk.mockkStatic
import org.springframework.messaging.Message
import org.springframework.messaging.MessageChannel
import org.springframework.messaging.simp.stomp.StompHeaderAccessor
import org.springframework.messaging.support.MessageHeaderAccessor
import java.util.UUID

class WebSocketPrivateInterceptorTest : FunSpec({
    val sut = WebSocketPrivateInterceptor()

    beforeEach {
        clearAllMocks()
        mockkStatic(MessageHeaderAccessor::class)
    }

    test("should return message without modification if there is no accessor") {
        val message = mockk<Message<*>>()
        val channel = mockk<MessageChannel>()
        every { MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor::class.java) } returns null

        val result = sut.preSend(message, channel)

        result shouldBe message
    }

    test("should return message without modification if destination is null") {
        val message = mockk<Message<*>>()
        val channel = mockk<MessageChannel>()
        val accessor = mockk<StompHeaderAccessor>(relaxed = true)
        every { MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor::class.java) } returns accessor
        every { accessor.destination } returns null

        val result = sut.preSend(message, channel)

        result shouldBe message
    }

    test("should return message without modification if no private configuration found for destination") {
        val message = mockk<Message<*>>()
        val channel = mockk<MessageChannel>()
        val accessor = mockk<StompHeaderAccessor>(relaxed = true)
        every { MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor::class.java) } returns accessor
        every { accessor.destination } returns "/topic/contests/1/submissions/invalid"

        val result = sut.preSend(message, channel)

        result shouldBe message
    }

    test("should throw UnauthorizedException if authentication is null") {
        val message = mockk<Message<*>>()
        val channel = mockk<MessageChannel>()
        val accessor = mockk<StompHeaderAccessor>(relaxed = true)
        every { MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor::class.java) } returns accessor
        every { accessor.destination } returns "/topic/contests/1/submissions/full"
        every { message.headers.get("simpUser") } returns null

        shouldThrow<UnauthorizedException> {
            sut.preSend(message, channel)
        }
    }

    test("should throw UnauthorizedException if user is not authenticated") {
        val message = mockk<Message<*>>()
        val channel = mockk<MessageChannel>()
        val accessor = mockk<StompHeaderAccessor>(relaxed = true)
        every { MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor::class.java) } returns accessor
        every { accessor.destination } returns "/topic/contests/1/submissions/full"
        every { message.headers.get("simpUser") } returns JwtAuthentication()

        shouldThrow<UnauthorizedException> {
            sut.preSend(message, channel)
        }
    }

    test("should throw ForbiddenException if user type is not allowed") {
        val message = mockk<Message<*>>()
        val channel = mockk<MessageChannel>()
        val accessor = mockk<StompHeaderAccessor>(relaxed = true)
        every { MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor::class.java) } returns accessor
        every { accessor.destination } returns "/topic/contests/1/submissions/full"
        every { message.headers.get("simpUser") } returns
            JwtAuthentication(
                AuthorizationMember(
                    id = UUID.randomUUID(),
                    type = Member.Type.CONTESTANT,
                    name = "Test User",
                ),
            )

        shouldThrow<ForbiddenException> {
            sut.preSend(message, channel)
        }
    }

    test("should return message without modification if user type is allowed") {
        val message = mockk<Message<*>>()
        val channel = mockk<MessageChannel>()
        val accessor = mockk<StompHeaderAccessor>(relaxed = true)
        every { MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor::class.java) } returns accessor
        every { accessor.destination } returns "/topic/contests/1/submissions/full"
        every { message.headers.get("simpUser") } returns
            JwtAuthentication(
                AuthorizationMember(
                    id = UUID.randomUUID(),
                    type = Member.Type.JUDGE,
                    name = "Test User",
                ),
            )

        val result = sut.preSend(message, channel)

        result shouldBe message
    }
})
