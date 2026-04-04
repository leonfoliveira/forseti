package com.forsetijudge.infrastructure.adapter.dto.rabbitmq.body

import java.io.Serializable
import java.util.UUID

data class AutoFreezeQueueMessageBody(
    val contestId: UUID,
) : Serializable
