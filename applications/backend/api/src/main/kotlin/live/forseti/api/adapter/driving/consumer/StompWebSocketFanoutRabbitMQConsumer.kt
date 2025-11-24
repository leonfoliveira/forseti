package live.forseti.api.adapter.driving.consumer

import live.forseti.core.domain.entity.Member
import live.forseti.infrastructure.adapter.driving.consumer.RabbitMQConsumer
import live.forseti.infrastructure.adapter.dto.message.payload.WebSocketFanoutMessagePayload
import org.springframework.amqp.rabbit.annotation.Exchange
import org.springframework.amqp.rabbit.annotation.Queue
import org.springframework.amqp.rabbit.annotation.QueueBinding
import org.springframework.amqp.rabbit.annotation.RabbitListener
import org.springframework.messaging.simp.SimpMessagingTemplate
import org.springframework.stereotype.Component

@Component
class StompWebSocketFanoutRabbitMQConsumer(
    private val messagingTemplate: SimpMessagingTemplate,
) : RabbitMQConsumer<WebSocketFanoutMessagePayload>(Member.API_ID) {
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

    override fun getPayloadType(): Class<WebSocketFanoutMessagePayload> = WebSocketFanoutMessagePayload::class.java

    /**
     * Handles the payload by sending the message to the specified WebSocket destination.
     *
     * @param payload The payload containing the destination and message.
     */
    override fun handlePayload(payload: WebSocketFanoutMessagePayload) {
        logger.info("Forwarding message to WebSocket destination: {}", payload.destination)
        messagingTemplate.convertAndSend(
            payload.destination,
            payload.payload,
        )
    }
}
