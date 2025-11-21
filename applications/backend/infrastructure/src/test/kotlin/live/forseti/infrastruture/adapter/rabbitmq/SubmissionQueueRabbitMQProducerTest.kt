package live.forseti.infrastruture.adapter.rabbitmq

import io.kotest.core.spec.style.FunSpec
import live.forseti.core.domain.entity.SubmissionMockBuilder
import live.forseti.core.testcontainer.TestContainers
import live.forseti.infrastruture.adapter.driven.producer.SubmissionQueueRabbitMQProducer
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.context.annotation.Import
import org.springframework.test.context.ActiveProfiles
import org.testcontainers.containers.RabbitMQContainer

@ActiveProfiles("test")
@SpringBootTest
@Import(TestContainers::class)
class SubmissionQueueRabbitMQProducerTest(
    val rabbitMQContainer: RabbitMQContainer,
    val sut: SubmissionQueueRabbitMQProducer,
) : FunSpec({
        test("should send message to rabbitmq") {
            val submission = SubmissionMockBuilder.build()
            sut.produce(submission)

            val receivedMessage =
                rabbitMQContainer
                    .execInContainer(
                        "rabbitmqadmin",
                        "get",
                        "queue=submission-queue",
                        "requeue=false",
                        "count=1",
                        "encoding=auto",
                    ).stdout
            receivedMessage.contains(submission.id.toString())
        }
    })
