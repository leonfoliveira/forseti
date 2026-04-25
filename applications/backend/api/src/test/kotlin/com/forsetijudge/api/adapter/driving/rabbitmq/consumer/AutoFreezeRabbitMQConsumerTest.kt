package com.forsetijudge.api.adapter.driving.rabbitmq.consumer

import com.fasterxml.jackson.databind.ObjectMapper
import com.forsetijudge.core.application.helper.IdGenerator
import com.forsetijudge.core.config.JacksonConfig
import com.forsetijudge.core.port.driving.usecase.external.authentication.AuthenticateSystemUseCase
import com.forsetijudge.core.port.driving.usecase.external.leaderboard.FreezeLeaderboardUseCase
import com.forsetijudge.infrastructure.adapter.dto.rabbitmq.body.AutoFreezeQueueMessageBody
import com.ninjasquad.springmockk.MockkBean
import io.kotest.core.spec.style.FunSpec
import io.mockk.clearAllMocks
import io.mockk.every
import io.mockk.mockk
import io.mockk.verify
import org.springframework.amqp.core.Message
import org.springframework.boot.test.context.SpringBootTest

@SpringBootTest(classes = [AutoFreezeRabbitMQConsumer::class, JacksonConfig::class])
class AutoFreezeRabbitMQConsumerTest(
    @MockkBean(relaxed = true)
    private val authenticateSystemUseCase: AuthenticateSystemUseCase,
    @MockkBean(relaxed = true)
    private val freezeLeaderboardUseCase: FreezeLeaderboardUseCase,
    private val objectMapper: ObjectMapper,
    private val sut: AutoFreezeRabbitMQConsumer,
) : FunSpec({
        beforeEach {
            clearAllMocks()
        }

        test("should handle payload") {
            val body = AutoFreezeQueueMessageBody(contestId = IdGenerator.getUUID())
            val message = mockk<Message>(relaxed = true)
            every { message.messageProperties.headers } returns
                mapOf("id" to IdGenerator.getUUID().toString())
            every { message.body } returns objectMapper.writeValueAsBytes(body)

            sut.receiveMessage(message)

            verify {
                freezeLeaderboardUseCase.execute()
            }
        }
    })
