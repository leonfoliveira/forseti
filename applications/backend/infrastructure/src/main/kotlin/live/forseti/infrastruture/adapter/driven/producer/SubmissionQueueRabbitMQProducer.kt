package live.forseti.infrastruture.adapter.driven.producer

import live.forseti.core.domain.entity.Submission
import live.forseti.core.port.driven.SubmissionQueueProducer
import live.forseti.infrastruture.adapter.rabbitmq.RabbitMQProducer
import live.forseti.infrastruture.adapter.rabbitmq.payload.SubmissionMessagePayload
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
