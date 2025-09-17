package io.github.leonfoliveira.judge.api.security.websocket

import io.github.leonfoliveira.judge.api.util.ContestAuthFilter
import io.github.leonfoliveira.judge.common.domain.model.SessionAuthentication
import io.github.leonfoliveira.judge.common.mock.entity.SessionMockBuilder
import io.kotest.core.spec.style.FunSpec
import io.kotest.matchers.shouldBe
import io.kotest.matchers.shouldNotBe
import io.mockk.every
import io.mockk.mockk
import org.springframework.messaging.Message
import org.springframework.messaging.MessageChannel
import org.springframework.messaging.MessageHeaders
import org.springframework.security.core.context.SecurityContextHolder

class WebSocketAuthExtractionInterceptorTest :
    FunSpec({
        val contestAuthFilter = mockk<ContestAuthFilter>(relaxed = true)
        val sut = WebSocketAuthExtractionInterceptor(contestAuthFilter)

        beforeEach {
            SecurityContextHolder.clearContext()
        }

        test("should extract JWT authentication from message headers and set in security context") {
            val session = SessionMockBuilder.build()
            val sessionAuthentication = SessionAuthentication(session)

            val messageHeaders =
                mapOf<String, Any>(
                    "simpUser" to sessionAuthentication,
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
            SecurityContextHolder.getContext().authentication shouldBe sessionAuthentication
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
