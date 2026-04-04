package com.forsetijudge.api.adapter.driving.rabbitmq.consumer

import com.forsetijudge.core.port.driving.usecase.external.leaderboard.FreezeLeaderboardUseCase
import com.forsetijudge.infrastructure.adapter.driving.consumer.RabbitMQConsumer
import com.forsetijudge.infrastructure.adapter.dto.rabbitmq.body.AutoFreezeQueueMessageBody
import org.springframework.amqp.core.Message
import org.springframework.amqp.rabbit.annotation.RabbitListener
import org.springframework.stereotype.Component

@Component
class AutoFreezeRabbitMQConsumer(
    private val freezeLeaderboardUseCase: FreezeLeaderboardUseCase,
) : RabbitMQConsumer<AutoFreezeQueueMessageBody>() {
    @RabbitListener(queues = ["\${spring.rabbitmq.queue.auto-freeze-queue}"])
    override fun receiveMessage(message: Message) {
        super.receiveMessage(message)
    }

    override fun getBodyType(): Class<AutoFreezeQueueMessageBody> = AutoFreezeQueueMessageBody::class.java

    override fun handleBody(body: AutoFreezeQueueMessageBody) {
        freezeLeaderboardUseCase.execute()
    }
}
