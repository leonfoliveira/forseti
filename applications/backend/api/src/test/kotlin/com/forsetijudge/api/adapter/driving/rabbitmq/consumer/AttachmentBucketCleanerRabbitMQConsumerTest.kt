package com.forsetijudge.api.adapter.driving.rabbitmq.consumer

import com.fasterxml.jackson.databind.ObjectMapper
import com.forsetijudge.core.application.helper.IdGenerator
import com.forsetijudge.core.config.JacksonConfig
import com.forsetijudge.core.port.driving.usecase.external.attachment.CleanUncommitedAttachmentsUseCase
import com.forsetijudge.core.port.driving.usecase.external.authentication.AuthenticateSystemUseCase
import com.forsetijudge.infrastructure.adapter.dto.rabbitmq.body.AttachmentBucketCleanerQueueMessageBody
import com.ninjasquad.springmockk.MockkBean
import io.kotest.core.spec.style.FunSpec
import io.mockk.clearAllMocks
import io.mockk.every
import io.mockk.mockk
import io.mockk.verify
import org.springframework.amqp.core.Message
import org.springframework.boot.test.context.SpringBootTest

@SpringBootTest(classes = [AttachmentBucketCleanerRabbitMQConsumer::class, JacksonConfig::class])
class AttachmentBucketCleanerRabbitMQConsumerTest(
    @MockkBean(relaxed = true)
    private val authenticateSystemUseCase: AuthenticateSystemUseCase,
    @MockkBean(relaxed = true)
    private val cleanAttachmentBucketUseCase: CleanUncommitedAttachmentsUseCase,
    private val objectMapper: ObjectMapper,
    private val sut: AttachmentBucketCleanerRabbitMQConsumer,
) : FunSpec({
        beforeEach {
            clearAllMocks()
        }

        test("should handle payload") {
            val body = AttachmentBucketCleanerQueueMessageBody()
            val message = mockk<Message>(relaxed = true)
            every { message.messageProperties.headers } returns
                mapOf("id" to IdGenerator.getUUID().toString())
            every { message.body } returns objectMapper.writeValueAsBytes(body)

            sut.receiveMessage(message)

            verify {
                cleanAttachmentBucketUseCase.execute()
            }
        }
    })
