package com.forsetijudge.core.port.dto.response.announcement

import com.forsetijudge.core.domain.entity.Announcement
import com.forsetijudge.core.port.dto.response.contest.ContestResponseDTO
import com.forsetijudge.core.port.dto.response.contest.toResponseDTO
import com.forsetijudge.core.port.dto.response.member.MemberResponseDTO
import com.forsetijudge.core.port.dto.response.member.toResponseDTO
import java.io.Serializable
import java.time.OffsetDateTime
import java.util.UUID

data class AnnouncementResponseDTO(
    val id: UUID,
    val createdAt: OffsetDateTime,
    val updatedAt: OffsetDateTime,
    val contest: ContestResponseDTO,
    val member: MemberResponseDTO,
    val text: String,
    val version: Long,
) : Serializable

fun Announcement.toResponseDTO(): AnnouncementResponseDTO =
    AnnouncementResponseDTO(
        id = id,
        createdAt = createdAt,
        updatedAt = updatedAt,
        contest = contest.toResponseDTO(),
        member = member.toResponseDTO(),
        text = text,
        version = version,
    )
