package com.forsetijudge.core.port.dto.response.session

import com.forsetijudge.core.domain.entity.Session
import com.forsetijudge.core.port.dto.response.member.MemberWithContestAndLoginResponseDTO
import com.forsetijudge.core.port.dto.response.member.toWithContestAndLoginResponseDTO
import java.io.Serializable
import java.time.OffsetDateTime
import java.util.UUID

data class SessionResponseBodyDTO(
    val id: UUID,
    val createdAt: OffsetDateTime,
    val updatedAt: OffsetDateTime,
    val member: MemberWithContestAndLoginResponseDTO,
    val csrfToken: UUID,
    val expiresAt: OffsetDateTime,
    val version: Long,
) : Serializable

fun Session.toResponseBodyDTO() =
    SessionResponseBodyDTO(
        id = id,
        createdAt = createdAt,
        updatedAt = updatedAt,
        member = member.toWithContestAndLoginResponseDTO(),
        csrfToken = csrfToken,
        expiresAt = expiresAt,
        version = version,
    )
