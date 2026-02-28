package com.forsetijudge.infrastructure.adapter.driven.rabbitmq

import com.forsetijudge.core.domain.entity.Member
import com.forsetijudge.core.domain.entity.MemberMockBuilder
import com.forsetijudge.core.domain.entity.SubmissionMockBuilder
import com.forsetijudge.infrastructure.adapter.dto.rabbitmq.RabbitMQMessage
import com.forsetijudge.infrastructure.adapter.dto.rabbitmq.body.SubmissionQueueMessageBody
import io.kotest.core.spec.style.FunSpec
import io.kotest.matchers.shouldBe
import io.mockk.clearAllMocks
import io.mockk.mockk
import io.mockk.slot
import io.mockk.verify

class SubmissionQueueRabbitMQProducerTest :
    FunSpec({
        val rabbitMQProducer = mockk<RabbitMQProducer>(relaxed = true)
        val exchange = "test-exchange"
        val routingKey = "test-routing-key"

        val sut = SubmissionQueueRabbitMQProducer(rabbitMQProducer, exchange, routingKey)

        beforeEach {
            clearAllMocks()
        }

        test("should produce message to RabbitMQ for contestant") {
            val submission = SubmissionMockBuilder.build()

            sut.produce(submission)

            val messageSlot = slot<RabbitMQMessage<SubmissionQueueMessageBody>>()
            verify {
                rabbitMQProducer.produce(capture(messageSlot))
            }
            messageSlot.captured.exchange shouldBe exchange
            messageSlot.captured.routingKey shouldBe routingKey
            messageSlot.captured.body.submissionId shouldBe submission.id
            messageSlot.captured.priority shouldBe 10
        }

        test("should produce message to RabbitMQ for unofficial contestant") {
            val submission =
                SubmissionMockBuilder.build(
                    member = MemberMockBuilder.build(type = Member.Type.UNOFFICIAL_CONTESTANT),
                )

            sut.produce(submission)

            val messageSlot = slot<RabbitMQMessage<SubmissionQueueMessageBody>>()
            verify {
                rabbitMQProducer.produce(capture(messageSlot))
            }
            messageSlot.captured.exchange shouldBe exchange
            messageSlot.captured.routingKey shouldBe routingKey
            messageSlot.captured.body.submissionId shouldBe submission.id
            messageSlot.captured.priority shouldBe 1
        }
    })
