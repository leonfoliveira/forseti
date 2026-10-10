package com.forsetijudge.core.port.dto.response.announcement

import com.forsetijudge.core.domain.entity.Announcement
import com.forsetijudge.core.port.dto.response.contest.ContestResponseBodyDTO
import com.forsetijudge.core.port.dto.response.contest.toResponseBodyDTO
import com.forsetijudge.core.port.dto.response.member.MemberResponseBodyDTO
import com.forsetijudge.core.port.dto.response.member.toResponseBodyDTO
import java.io.Serializable
import java.time.OffsetDateTime

data class AnnouncementResponseDTO(
    val id: String,
    val createdAt: OffsetDateTime,
    val updatedAt: OffsetDateTime,
    val contest: ContestResponseBodyDTO,
    val member: MemberResponseBodyDTO,
    val text: String,
    val version: Long,
) : Serializable

fun Announcement.toResponseBodyDTO(): AnnouncementResponseDTO =
    AnnouncementResponseDTO(
        id = id.toString(),
        createdAt = createdAt,
        updatedAt = updatedAt,
        contest = contest.toResponseBodyDTO(),
        member = member.toResponseBodyDTO(),
        text = text,
        version = version,
    )
