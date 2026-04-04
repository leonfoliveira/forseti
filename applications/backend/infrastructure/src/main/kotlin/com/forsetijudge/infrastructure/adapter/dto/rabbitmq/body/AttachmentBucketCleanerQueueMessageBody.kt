package com.forsetijudge.infrastructure.adapter.dto.rabbitmq.body

import com.fasterxml.jackson.annotation.JsonIgnoreProperties
import java.io.Serializable

@JsonIgnoreProperties(ignoreUnknown = true)
class AttachmentBucketCleanerQueueMessageBody : Serializable
