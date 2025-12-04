package com.forsetijudge.api.adapter.dto.response.session

import com.forsetijudge.api.adapter.dto.response.member.MemberPublicResponseDTO
import com.forsetijudge.api.adapter.dto.response.member.toPublicResponseDTO
import com.forsetijudge.core.domain.entity.Session
import java.io.Serializable
import java.time.OffsetDateTime
import java.util.UUID

data class SessionResponseDTO(
    val id: UUID,
    val member: MemberPublicResponseDTO,
    val expiresAt: OffsetDateTime,
) : Serializable

fun Session.toResponseDTO() =
    SessionResponseDTO(
        id = id,
        member = member.toPublicResponseDTO(),
        expiresAt = expiresAt,
    )
