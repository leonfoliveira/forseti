package com.forsetijudge.infrastructure.adapter.driven.rabbitmq

import com.forsetijudge.core.domain.entity.Member
import com.forsetijudge.core.domain.entity.Submission
import com.forsetijudge.core.port.driven.queue.SubmissionQueueProducer
import com.forsetijudge.infrastructure.adapter.dto.rabbitmq.RabbitMQMessage
import com.forsetijudge.infrastructure.adapter.dto.rabbitmq.body.SubmissionQueueMessageBody
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Component

@Component
class SubmissionQueueRabbitMQProducer(
    private val rabbitMQProducer: RabbitMQProducer,
    @Value("\${spring.rabbitmq.exchange.submission-exchange}")
    private val exchange: String,
    @Value("\${spring.rabbitmq.routing-key.submission-routing-key}")
    private val routingKey: String,
) : SubmissionQueueProducer {
    override fun produce(submission: Submission) {
        val message =
            RabbitMQMessage(
                exchange = exchange,
                routingKey = routingKey,
                body =
                    SubmissionQueueMessageBody(
                        submissionId = submission.id,
                    ),
                // Official contestant's submission has higher priority than unofficial contestant's submission
                priority = if (submission.member.type == Member.Type.CONTESTANT) 10 else 1,
            )
        rabbitMQProducer.produce(message)
    }
}
