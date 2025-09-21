package io.github.leonfoliveira.judge.common.adapter.rabbitmq.producer

import io.github.leonfoliveira.judge.common.adapter.rabbitmq.RabbitMQProducer
import io.github.leonfoliveira.judge.common.adapter.rabbitmq.message.SubmissionMessagePayload
import io.github.leonfoliveira.judge.common.domain.entity.Submission
import io.github.leonfoliveira.judge.common.port.SubmissionQueueProducer
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Service

@Service
class SubmissionQueueRabbitMQProducer(
    @Value("\${spring.rabbitmq.queue.submission-exchange}")
    exchange: String,
    @Value("\${spring.rabbitmq.queue.submission-routing-key}")
    routingKey: String,
) : RabbitMQProducer<SubmissionMessagePayload>(exchange, routingKey),
    SubmissionQueueProducer {
    override fun produce(submission: Submission) {
        produce(
            SubmissionMessagePayload(
                contestId = submission.contest.id,
                submissionId = submission.id,
            ),
        )
    }
}
