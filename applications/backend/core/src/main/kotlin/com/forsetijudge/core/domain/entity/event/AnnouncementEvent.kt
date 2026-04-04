package com.forsetijudge.core.domain.entity.event

import com.forsetijudge.core.application.util.IdGenerator
import com.forsetijudge.core.domain.entity.BusinessEvent
import com.forsetijudge.core.domain.model.ExecutionContext
import jakarta.persistence.DiscriminatorValue
import jakarta.persistence.Entity
import java.io.Serializable
import java.time.OffsetDateTime
import java.util.UUID

object AnnouncementEvent {
    @Entity
    @DiscriminatorValue("ANNOUNCEMENT_CREATED")
    class Created(
        id: UUID = IdGenerator.getUUID(),
        createdAt: OffsetDateTime = ExecutionContext.get().startedAt,
        updatedAt: OffsetDateTime = ExecutionContext.get().startedAt,
        status: Status = Status.PENDING,
        payload: Map<String, Any>,
    ) : BusinessEvent<Created.Payload>(id, createdAt, updatedAt, status, Created::class.java.simpleName, payload) {
        data class Payload(
            val announcementId: UUID,
        ) : Serializable

        constructor(payload: Payload) : this(
            payload = getRawPayload(payload),
        )
    }
}
