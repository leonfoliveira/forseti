package com.forsetijudge.core.domain.entity.ticket

import com.forsetijudge.core.application.util.IdGenerator
import com.forsetijudge.core.domain.entity.Contest
import com.forsetijudge.core.domain.entity.Member
import com.forsetijudge.core.domain.entity.Ticket
import com.forsetijudge.core.domain.model.ExecutionContext
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
    id: UUID = IdGenerator.getUUID(),
    createdAt: OffsetDateTime = ExecutionContext.get().startedAt,
    updatedAt: OffsetDateTime = ExecutionContext.get().startedAt,
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
