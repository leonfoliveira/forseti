package io.github.leonfoliveira.judge.api.security.websocket

import io.github.leonfoliveira.judge.api.security.JwtAuthentication
import io.github.leonfoliveira.judge.api.util.ContestAuthFilter
import io.github.leonfoliveira.judge.common.domain.entity.Member
import io.github.leonfoliveira.judge.common.domain.model.AuthorizationMember
import io.github.leonfoliveira.judge.common.mock.entity.AuthorizationMockBuilder
import io.kotest.core.spec.style.FunSpec
import io.kotest.matchers.shouldBe
import io.kotest.matchers.shouldNotBe
import io.mockk.every
import io.mockk.mockk
import org.springframework.messaging.Message
import org.springframework.messaging.MessageChannel
import org.springframework.messaging.MessageHeaders
import org.springframework.security.core.context.SecurityContextHolder
import java.util.UUID

class WebSocketAuthExtractionInterceptorTest : FunSpec({
    val contestAuthFilter = mockk<ContestAuthFilter>(relaxed = true)
    val sut = WebSocketAuthExtractionInterceptor(contestAuthFilter)

    beforeEach {
        SecurityContextHolder.clearContext()
    }

    test("should extract JWT authentication from message headers and set in security context") {
        // Given
        val authorizationMember =
            AuthorizationMember(
                id = UUID.randomUUID(),
                contestId = UUID.randomUUID(),
                name = "Member Name",
                type = Member.Type.CONTESTANT,
            )
        val authorization = AuthorizationMockBuilder.build(member = authorizationMember)
        val jwtAuthentication = JwtAuthentication(authorization)

        val messageHeaders =
            mapOf<String, Any>(
                "simpUser" to jwtAuthentication,
            )
        val message =
            mockk<Message<*>> {
                every { headers } returns MessageHeaders(messageHeaders)
            }
        val channel = mockk<MessageChannel>()

        // When
        val result = sut.preSend(message, channel)

        // Then
        result shouldBe message
        SecurityContextHolder.getContext().authentication shouldBe jwtAuthentication
    }

    test("should handle null JWT authentication in message headers") {
        // Given
        val messageHeaders =
            mapOf<String, Any>(
                "simpUser" to "not-a-jwt-authentication",
            )
        val message =
            mockk<Message<*>> {
                every { headers } returns MessageHeaders(messageHeaders)
            }
        val channel = mockk<MessageChannel>()

        // When
        val result = sut.preSend(message, channel)

        // Then
        result shouldBe message
        SecurityContextHolder.getContext().authentication shouldBe null
    }

    test("should handle missing simpUser header") {
        // Given
        val messageHeaders =
            mapOf<String, Any>(
                "otherHeader" to "value",
            )
        val message =
            mockk<Message<*>> {
                every { headers } returns MessageHeaders(messageHeaders)
            }
        val channel = mockk<MessageChannel>()

        // When
        val result = sut.preSend(message, channel)

        // Then
        result shouldBe message
        SecurityContextHolder.getContext().authentication shouldBe null
    }

    test("should handle empty message headers") {
        // Given
        val messageHeaders = emptyMap<String, Any>()
        val message =
            mockk<Message<*>> {
                every { headers } returns MessageHeaders(messageHeaders)
            }
        val channel = mockk<MessageChannel>()

        // When
        val result = sut.preSend(message, channel)

        // Then
        result shouldBe message
        SecurityContextHolder.getContext().authentication shouldBe null
    }

    test("should return original message regardless of authentication result") {
        // Given
        val message =
            mockk<Message<*>> {
                every { headers } returns MessageHeaders(emptyMap())
            }
        val channel = mockk<MessageChannel>()

        // When
        val result = sut.preSend(message, channel)

        // Then
        result shouldBe message
        result shouldNotBe null
    }
})
