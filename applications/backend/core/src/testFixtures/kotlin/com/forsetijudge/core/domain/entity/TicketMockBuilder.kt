package com.forsetijudge.core.domain.entity

import com.github.f4b6a3.uuid.UuidCreator
import java.io.Serializable
import java.time.OffsetDateTime
import java.util.UUID

object TicketMockBuilder {
    fun <TProperties : Serializable> build(
        id: UUID = UuidCreator.getTimeOrderedEpoch(),
        createdAt: OffsetDateTime = OffsetDateTime.now(),
        updatedAt: OffsetDateTime = OffsetDateTime.now(),
        deletedAt: OffsetDateTime? = null,
        contest: Contest = ContestMockBuilder.build(),
        member: Member = MemberMockBuilder.build(),
        staff: Member? = null,
        type: Ticket.Type = Ticket.Type.SUBMISSION_PRINT,
        status: Ticket.Status = Ticket.Status.OPEN,
        properties: Map<String, Any> = emptyMap(),
    ) = Ticket<TProperties>(
        id = id,
        createdAt = createdAt,
        updatedAt = updatedAt,
        deletedAt = deletedAt,
        contest = contest,
        member = member,
        staff = staff,
        type = type,
        status = status,
        properties = properties,
    )
}
