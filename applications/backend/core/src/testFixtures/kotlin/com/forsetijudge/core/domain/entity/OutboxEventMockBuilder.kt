package com.forsetijudge.core.domain.entity

import com.forsetijudge.core.application.util.IdGenerator
import com.forsetijudge.core.domain.event.AnnouncementEvent
import java.time.OffsetDateTime
import java.util.UUID

object OutboxEventMockBuilder {
    fun build(
        id: UUID = IdGenerator.getUUID(),
        createdAt: OffsetDateTime = OffsetDateTime.now(),
        updatedAt: OffsetDateTime = OffsetDateTime.now(),
        deletedAt: OffsetDateTime? = null,
        version: Long = 1L,
        status: OutboxEvent.Status = OutboxEvent.Status.PENDING,
        eventType: String = AnnouncementEvent.Created::class.java.name,
        payload: String = "{\"announcementId\": \"${IdGenerator.getUUID()}\"}",
    ) = OutboxEvent(
        id = id,
        createdAt = createdAt,
        updatedAt = updatedAt,
        deletedAt = deletedAt,
        version = version,
        status = status,
        eventType = eventType,
        payload = payload,
    )
}
