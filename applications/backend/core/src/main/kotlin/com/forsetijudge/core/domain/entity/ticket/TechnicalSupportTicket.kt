package com.forsetijudge.core.domain.entity.ticket

import com.forsetijudge.core.domain.entity.Contest
import com.forsetijudge.core.domain.entity.Member
import com.forsetijudge.core.domain.entity.Ticket
import com.github.f4b6a3.uuid.UuidCreator
import jakarta.persistence.DiscriminatorValue
import jakarta.persistence.Entity
import org.hibernate.envers.Audited
import java.io.Serializable
import java.time.OffsetDateTime
import java.util.UUID

@Entity
@Audited
@DiscriminatorValue("TECHNICAL_SUPPORT")
class TechnicalSupportTicket(
    id: UUID = UuidCreator.getTimeOrderedEpoch(),
    createdAt: OffsetDateTime = OffsetDateTime.now(),
    updatedAt: OffsetDateTime = OffsetDateTime.now(),
    deletedAt: OffsetDateTime? = null,
    version: Long = 1L,
    contest: Contest,
    member: Member,
    staff: Member? = null,
    type: Type = Type.TECHNICAL_SUPPORT,
    status: Status = Status.OPEN,
    properties: Map<String, Any>,
) : Ticket<TechnicalSupportTicket.Properties>(
        id,
        createdAt,
        updatedAt,
        deletedAt,
        version,
        contest,
        member,
        staff,
        type,
        status,
        properties,
    ) {
    /**
     * The properties of a technical support ticket. It contains the description of the issue that the member is facing.
     */
    data class Properties(
        val description: String,
    ) : Serializable
}
