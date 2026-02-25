package com.forsetijudge.api.adapter.driving.rabbitmq.consumer

import com.corundumstudio.socketio.SocketIOServer
import com.forsetijudge.core.port.driven.broadcast.BroadcastEvent
import com.forsetijudge.infrastructure.adapter.driving.consumer.RabbitMQConsumer
import org.springframework.amqp.rabbit.annotation.Exchange
import org.springframework.amqp.rabbit.annotation.Queue
import org.springframework.amqp.rabbit.annotation.QueueBinding
import org.springframework.amqp.rabbit.annotation.RabbitListener
import org.springframework.stereotype.Component

@Component
class SocketIOFanoutRabbitMQConsumer(
    private val socketIOServer: SocketIOServer,
) : RabbitMQConsumer<BroadcastEvent>() {
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

    override fun getPayloadType(): Class<BroadcastEvent> = BroadcastEvent::class.java

    /**
     * Handles the payload by sending the message to the specified socket.io room.
     *
     * @param payload The payload containing the topic and message.
     */
    override fun handlePayload(payload: BroadcastEvent) {
        logger.info("Broadcasting event ${payload.name} to room: ${payload.room}")

        socketIOServer.getRoomOperations(payload.room).sendEvent(payload.name, payload.data)
    }
}
