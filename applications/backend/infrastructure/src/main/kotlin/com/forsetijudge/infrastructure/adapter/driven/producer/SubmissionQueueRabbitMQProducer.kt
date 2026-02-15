package com.forsetijudge.infrastructure.adapter.driven.producer

import com.forsetijudge.core.domain.entity.Submission
import com.forsetijudge.core.port.driven.producer.SubmissionQueueProducer
import com.forsetijudge.infrastructure.adapter.dto.message.payload.SubmissionMessagePayload
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Service

@Service
class SubmissionQueueRabbitMQProducer(
    @Value("\${spring.rabbitmq.exchange.submission-exchange}")
    exchange: String,
    @Value("\${spring.rabbitmq.routing-key.submission-routing-key}")
    routingKey: String,
) : RabbitMQProducer<SubmissionMessagePayload>(exchange, routingKey),
    SubmissionQueueProducer {
    /**
     * Enqueue a submission to be judged by the autojudge service
     *
     * @param submission The submission to be judged
     */
    override fun produce(submission: Submission) {
        produce(
            SubmissionMessagePayload(
                contestId = submission.contest.id,
                submissionId = submission.id,
            ),
        )
    }
}
