package com.forsetijudge.api.adapter.driving.consumer

import com.forsetijudge.core.port.driven.producer.payload.WebSocketFanoutPayload
import com.forsetijudge.infrastructure.adapter.driving.consumer.RabbitMQConsumer
import org.springframework.amqp.rabbit.annotation.Exchange
import org.springframework.amqp.rabbit.annotation.Queue
import org.springframework.amqp.rabbit.annotation.QueueBinding
import org.springframework.amqp.rabbit.annotation.RabbitListener
import org.springframework.messaging.simp.SimpMessagingTemplate
import org.springframework.stereotype.Component
import java.io.Serializable

@Component
class StompWebSocketFanoutRabbitMQConsumer(
    private val messagingTemplate: SimpMessagingTemplate,
) : RabbitMQConsumer<WebSocketFanoutPayload>() {
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

    override fun getPayloadType(): Class<WebSocketFanoutPayload> = WebSocketFanoutPayload::class.java

    /**
     * Handles the payload by sending the message to the specified WebSocket destination.
     *
     * @param payload The payload containing the destination and message.
     */
    override fun handlePayload(payload: WebSocketFanoutPayload) {
        logger.info("Forwarding message to WebSocket destination: {}", payload.destination)

        if (payload.body != null) {
            messagingTemplate.convertAndSend(
                payload.destination,
                payload.body as Serializable,
            )
        } else {
            messagingTemplate.convertAndSend(
                payload.destination,
            )
        }
    }
}
