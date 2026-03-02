package com.forsetijudge.core.port.dto.response.ticket

import com.forsetijudge.core.domain.entity.Ticket
import com.forsetijudge.core.port.dto.response.member.MemberResponseBodyDTO
import com.forsetijudge.core.port.dto.response.member.toResponseBodyDTO
import java.io.Serializable
import java.time.OffsetDateTime
import java.util.UUID

data class TicketResponseBodyDTO(
    val id: UUID,
    val createdAt: OffsetDateTime,
    val updatedAt: OffsetDateTime,
    val version: Long,
    val member: MemberResponseBodyDTO,
    val staff: MemberResponseBodyDTO? = null,
    val type: Ticket.Type,
    val status: Ticket.Status,
    val properties: Map<String, Any>,
) : Serializable

fun Ticket<*>.toResponseBodyDTO() =
    TicketResponseBodyDTO(
        id = id,
        createdAt = createdAt,
        updatedAt = updatedAt,
        version = version,
        member = member.toResponseBodyDTO(),
        staff = staff?.toResponseBodyDTO(),
        type = type,
        status = status,
        properties = properties,
    )
