package live.forseti.infrastructure.adapter.driven.producer

import io.kotest.core.spec.style.FunSpec
import io.kotest.matchers.shouldNotBe
import io.kotest.matchers.string.shouldContain
import live.forseti.core.testcontainer.TestContainers
import org.springframework.amqp.core.Binding
import org.springframework.amqp.core.BindingBuilder
import org.springframework.amqp.core.FanoutExchange
import org.springframework.amqp.core.Queue
import org.springframework.amqp.rabbit.core.RabbitAdmin
import org.springframework.amqp.rabbit.core.RabbitTemplate
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.context.annotation.Import
import org.springframework.test.context.ActiveProfiles
import java.io.Serializable
import java.util.UUID

@ActiveProfiles("test")
@SpringBootTest
@Import(TestContainers::class)
class WebSocketRabbitMQFanoutProducerTest(
    val sut: WebSocketRabbitMQFanoutProducer,
    val rabbitTemplate: RabbitTemplate,
    val rabbitAdmin: RabbitAdmin,
) : FunSpec({
        test("should send message to rabbitmq") {
            val destination = "/topic/test"
            val payload = mapOf("key" to "value") as Serializable
            val tempQueueName = "temp-queue-${UUID.randomUUID()}"

            // Create the websocket-exchange and temporary queue using Spring AMQP
            val exchange = FanoutExchange("websocket-exchange", false, false)
            val queue = Queue(tempQueueName, false, false, true)
            val binding: Binding = BindingBuilder.bind(queue).to(exchange)

            // Declare the exchange, queue, and binding
            rabbitAdmin.declareExchange(exchange)
            rabbitAdmin.declareQueue(queue)
            rabbitAdmin.declareBinding(binding)

            // Produce the message
            sut.produce(destination, payload)

            // Receive the message from the temporary queue
            val receivedMessage = rabbitTemplate.receiveAndConvert(tempQueueName) as String?

            // Verify the message was received and contains the expected content
            receivedMessage shouldNotBe null
            receivedMessage!! shouldContain destination
            receivedMessage shouldContain "key"
            receivedMessage shouldContain "value"

            // Clean up: delete the temporary queue and binding
            // rabbitAdmin.deleteBinding(binding)
            rabbitAdmin.deleteQueue(tempQueueName)
        }
    })
