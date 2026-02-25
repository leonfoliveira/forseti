package com.forsetijudge.api.adapter.driving.rabbitmq.consumer

import com.corundumstudio.socketio.SocketIOServer
import com.forsetijudge.core.port.driven.broadcast.payload.BroadcastPayload
import com.forsetijudge.infrastructure.adapter.driving.consumer.RabbitMQConsumer
import org.springframework.amqp.rabbit.annotation.Exchange
import org.springframework.amqp.rabbit.annotation.Queue
import org.springframework.amqp.rabbit.annotation.QueueBinding
import org.springframework.amqp.rabbit.annotation.RabbitListener
import org.springframework.stereotype.Component

@Component
class SocketIOFanoutRabbitMQConsumer(
    private val socketIOServer: SocketIOServer,
) : RabbitMQConsumer<BroadcastPayload>() {
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
    override fun receiveMessage(jsonMessage: String) {
        super.receiveMessage(jsonMessage)
    }

    override fun getPayloadType(): Class<BroadcastPayload> = BroadcastPayload::class.java

    /**
     * Handles the payload by sending the message to the specified WebSocket topic.
     *
     * @param payload The payload containing the topic and message.
     */
    override fun handlePayload(payload: BroadcastPayload) {
        logger.info("Broadcasting message to WebSocket topic: ${payload.topic}")

        socketIOServer.getRoomOperations(payload.topic.name).sendEvent(payload.event.name, payload.body)
    }
}
