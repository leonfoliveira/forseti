package com.forsetijudge.infrastructure.adapter.dto.quartz.body

import java.io.Serializable

/**
 * A data class representing the body of a message that can be queued for processing by a Quartz job.
 *
 * @property exchange The name of the RabbitMQ exchange to which the message should be published.
 * @property routingKey The routing key to use when publishing the message to RabbitMQ.
 * @property body A map containing the actual payload of the message, which can include any relevant data needed for processing.
 */
data class QueueableJobMessageBody(
    val exchange: String,
    val routingKey: String,
    val body: Serializable,
) : Serializable
