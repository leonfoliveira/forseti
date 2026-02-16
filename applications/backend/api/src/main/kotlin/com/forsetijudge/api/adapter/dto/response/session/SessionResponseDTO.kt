package com.forsetijudge.api.adapter.dto.response.session

import com.forsetijudge.api.adapter.dto.response.contest.ContestMetadataResponseDTO
import com.forsetijudge.api.adapter.dto.response.contest.toMetadataDTO
import com.forsetijudge.api.adapter.dto.response.member.MemberPublicResponseDTO
import com.forsetijudge.api.adapter.dto.response.member.toPublicResponseDTO
import com.forsetijudge.core.domain.entity.Session
import java.io.Serializable
import java.time.OffsetDateTime
import java.util.UUID

data class SessionResponseDTO(
    val id: UUID,
    val contest: ContestMetadataResponseDTO?,
    val member: MemberPublicResponseDTO,
    val expiresAt: OffsetDateTime,
    val version: Long,
) : Serializable

fun Session.toResponseDTO() =
    SessionResponseDTO(
        id = id,
        contest = contest?.toMetadataDTO(),
        member = member.toPublicResponseDTO(),
        expiresAt = expiresAt,
        version = version,
    )
