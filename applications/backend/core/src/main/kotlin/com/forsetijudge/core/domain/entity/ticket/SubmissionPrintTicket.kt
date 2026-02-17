package com.forsetijudge.core.domain.entity.ticket

import com.forsetijudge.core.domain.entity.Contest
import com.forsetijudge.core.domain.entity.Member
import com.forsetijudge.core.domain.entity.Ticket
import com.github.f4b6a3.uuid.UuidCreator
import jakarta.persistence.DiscriminatorValue
import jakarta.persistence.Entity
import java.io.Serializable
import java.time.OffsetDateTime
import java.util.UUID

@Entity
@DiscriminatorValue("SUBMISSION_PRINT")
class SubmissionPrintTicket(
    id: UUID = UuidCreator.getTimeOrderedEpoch(),
    createdAt: OffsetDateTime = OffsetDateTime.now(),
    updatedAt: OffsetDateTime = OffsetDateTime.now(),
    deletedAt: OffsetDateTime? = null,
    version: Long = 1L,
    contest: Contest,
    member: Member,
    staff: Member?,
    type: Type = Type.SUBMISSION_PRINT,
    status: Status = Status.OPEN,
    properties: Properties,
) : Ticket<SubmissionPrintTicket.Properties>(
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
     * The properties of a submission print ticket. It contains the information of the submission and the attachment to be printed.
     */
    data class Properties(
        val submissionId: UUID,
        val attachment: Attachment,
    ) : Serializable {
        data class Attachment(
            val id: UUID,
            val filename: String,
            val contentType: String,
            val version: Long,
        )
    }
}
