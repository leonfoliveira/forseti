package com.forsetijudge.api.adapter.driving.rabbitmq.consumer

import com.forsetijudge.api.adapter.driven.socketio.SocketIOBroadcastEmitter
import com.forsetijudge.core.port.driven.broadcast.BroadcastEvent
import com.forsetijudge.infrastructure.adapter.driving.consumer.RabbitMQConsumer
import com.forsetijudge.infrastructure.adapter.dto.rabbitmq.body.BroadcastEventFanoutQueueMessageBody
import org.springframework.amqp.core.Message
import org.springframework.amqp.rabbit.annotation.Exchange
import org.springframework.amqp.rabbit.annotation.Queue
import org.springframework.amqp.rabbit.annotation.QueueBinding
import org.springframework.amqp.rabbit.annotation.RabbitListener
import org.springframework.stereotype.Component

@Component
class SocketIOFanoutRabbitMQConsumer(
    private val socketIOBroadcastEmitter: SocketIOBroadcastEmitter,
) : RabbitMQConsumer<BroadcastEventFanoutQueueMessageBody>() {
    @RabbitListener(
        bindings = [
            QueueBinding(
                value =
                    Queue(
                        // Empty name will generate a unique temporary queue name
                        value = "",
                        durable = "false",
                        exclusive = "true",
                        autoDelete = "true",
                    ),
                exchange =
                    Exchange(
                        value = "\${spring.rabbitmq.exchange.websocket-exchange}",
                        type = "fanout",
                    ),
            ),
        ],
    )
    override fun receiveMessage(message: Message) {
        super.receiveMessage(message)
    }

    override fun getBodyType(): Class<BroadcastEventFanoutQueueMessageBody> = BroadcastEventFanoutQueueMessageBody::class.java

    override fun handleBody(body: BroadcastEventFanoutQueueMessageBody) {
        socketIOBroadcastEmitter.emit(
            BroadcastEvent(
                room = body.room,
                name = body.name,
                data = body.data,
            ),
        )
    }
}
