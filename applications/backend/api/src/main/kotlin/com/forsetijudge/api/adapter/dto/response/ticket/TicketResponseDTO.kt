package com.forsetijudge.api.adapter.dto.response.ticket

import com.forsetijudge.api.adapter.dto.response.member.MemberPublicResponseDTO
import com.forsetijudge.api.adapter.dto.response.member.toPublicResponseDTO
import com.forsetijudge.core.domain.entity.Ticket
import java.io.Serializable
import java.time.OffsetDateTime
import java.util.UUID

data class TicketResponseDTO(
    val id: UUID,
    val createdAt: OffsetDateTime,
    val updatedAt: OffsetDateTime,
    val version: Long,
    val member: MemberPublicResponseDTO,
    val staff: MemberPublicResponseDTO? = null,
    val type: Ticket.Type,
    val status: Ticket.Status,
    val properties: Map<String, Any>,
) : Serializable

fun Ticket<*>.toResponseDTO() =
    TicketResponseDTO(
        id = id,
        createdAt = createdAt,
        updatedAt = updatedAt,
        version = version,
        member = member.toPublicResponseDTO(),
        staff = staff?.toPublicResponseDTO(),
        type = type,
        status = status,
        properties = properties,
    )
