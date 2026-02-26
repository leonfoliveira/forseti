package com.forsetijudge.core.port.dto.response.announcement

import com.forsetijudge.core.domain.entity.Announcement
import com.forsetijudge.core.port.dto.response.member.MemberResponseBodyDTO
import com.forsetijudge.core.port.dto.response.member.toResponseBodyDTO
import java.io.Serializable
import java.time.OffsetDateTime
import java.util.UUID

data class AnnouncementResponseBodyDTO(
    val id: UUID,
    val createdAt: OffsetDateTime,
    val updatedAt: OffsetDateTime,
    val member: MemberResponseBodyDTO,
    val text: String,
    val version: Long,
) : Serializable

fun Announcement.toResponseBodyDTO(): AnnouncementResponseBodyDTO =
    AnnouncementResponseBodyDTO(
        id = this.id,
        createdAt = this.createdAt,
        updatedAt = this.updatedAt,
        member = this.member.toResponseBodyDTO(),
        text = this.text,
        version = this.version,
    )
