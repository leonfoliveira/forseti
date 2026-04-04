package com.forsetijudge.api.adapter.driving.rabbitmq.consumer

import com.forsetijudge.core.port.driving.usecase.external.attachment.CleanUncommitedAttachmentsUseCase
import com.forsetijudge.infrastructure.adapter.driving.consumer.RabbitMQConsumer
import com.forsetijudge.infrastructure.adapter.dto.rabbitmq.body.AttachmentBucketCleanerQueueMessageBody
import org.springframework.amqp.core.Message
import org.springframework.amqp.rabbit.annotation.RabbitListener
import org.springframework.stereotype.Component

@Component
class AttachmentBucketCleanerRabbitMQConsumer(
    private val cleanAttachmentBucketUseCase: CleanUncommitedAttachmentsUseCase,
) : RabbitMQConsumer<AttachmentBucketCleanerQueueMessageBody>() {
    @RabbitListener(queues = ["\${spring.rabbitmq.queue.attachment-bucket-cleaner-queue}"])
    override fun receiveMessage(message: Message) {
        super.receiveMessage(message)
    }

    override fun getBodyType(): Class<AttachmentBucketCleanerQueueMessageBody> = AttachmentBucketCleanerQueueMessageBody::class.java

    override fun handleBody(body: AttachmentBucketCleanerQueueMessageBody) {
        cleanAttachmentBucketUseCase.execute()
    }
}
