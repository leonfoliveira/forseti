package com.forsetijudge.api.adapter.driving.rabbitmq.consumer

import com.forsetijudge.core.port.driving.usecase.external.outbox.ExecuteOutboxEventUseCase
import com.forsetijudge.infrastructure.adapter.driving.consumer.RabbitMQConsumer
import com.forsetijudge.infrastructure.adapter.dto.rabbitmq.body.BusinessEventQueueMessageBody
import org.springframework.amqp.core.Message
import org.springframework.amqp.rabbit.annotation.RabbitListener
import org.springframework.stereotype.Component

@Component
class OutboxEventRabbitMQConsumer(
    private val executeOutboxEventUseCase: ExecuteOutboxEventUseCase,
) : RabbitMQConsumer<BusinessEventQueueMessageBody>() {
    @RabbitListener(queues = ["\${spring.rabbitmq.queue.outbox-event}"])
    override fun receiveMessage(message: Message) {
        super.receiveMessage(message)
    }

    override fun getBodyType(): Class<BusinessEventQueueMessageBody> = BusinessEventQueueMessageBody::class.java

    override fun handleBody(body: BusinessEventQueueMessageBody) {
        executeOutboxEventUseCase.execute(
            ExecuteOutboxEventUseCase.Command(
                id = body.id,
            ),
        )
    }
}
