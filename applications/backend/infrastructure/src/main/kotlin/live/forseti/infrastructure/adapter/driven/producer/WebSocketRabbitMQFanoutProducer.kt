package live.forseti.infrastructure.adapter.driven.producer

import live.forseti.core.port.driven.WebSocketFanoutProducer
import live.forseti.infrastructure.adapter.dto.message.payload.WebSocketFanoutMessagePayload
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Service
import java.io.Serializable

@Service
class WebSocketRabbitMQFanoutProducer(
    @Value("\${spring.rabbitmq.exchange.websocket-exchange}")
    exchange: String,
) : RabbitMQProducer<WebSocketFanoutMessagePayload>(exchange),
    WebSocketFanoutProducer {
    /**
     * Produces a message to be sent to all instances for websocket fanout.
     *
     * @param destination The destination to broadcast the message to
     * @param payload The payload of the message
     */
    override fun <T : Serializable> produce(
        destination: String,
        payload: T,
    ) {
        produce(
            WebSocketFanoutMessagePayload(
                destination = destination,
                payload = payload,
            ),
        )
    }
}
