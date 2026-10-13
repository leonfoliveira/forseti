package com.forsetijudge.core.port.dto.response.member

import com.forsetijudge.core.domain.entity.Member
import java.io.Serializable
import java.time.OffsetDateTime
import java.util.UUID

data class MemberWithLoginResponseDTO(
    val id: UUID,
    val createdAt: OffsetDateTime,
    val updatedAt: OffsetDateTime,
    val type: Member.Type,
    val name: String,
    val login: String,
    val version: Long,
) : Serializable

fun Member.toWithLoginResponseDTO(): MemberWithLoginResponseDTO =
    MemberWithLoginResponseDTO(
        id = id,
        createdAt = createdAt,
        updatedAt = updatedAt,
        type = type,
        name = name,
        login = login,
        version = version,
    )
