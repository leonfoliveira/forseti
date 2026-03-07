package com.forsetijudge.core.port.dto.response.member

import com.forsetijudge.core.domain.entity.Member
import java.io.Serializable
import java.time.OffsetDateTime
import java.util.UUID

data class MemberWithContestAndLoginResponseDTO(
    val id: UUID,
    val createdAt: OffsetDateTime,
    val updatedAt: OffsetDateTime,
    val contestId: UUID?,
    val contestSlug: String?,
    val type: Member.Type,
    val name: String,
    val login: String,
    val version: Long,
) : Serializable

fun Member.toWithContestAndLoginResponseDTO(): MemberWithContestAndLoginResponseDTO =
    MemberWithContestAndLoginResponseDTO(
        id = id,
        createdAt = createdAt,
        updatedAt = updatedAt,
        contestId = contest?.id,
        contestSlug = contest?.slug,
        type = type,
        name = name,
        login = login,
        version = version,
    )
