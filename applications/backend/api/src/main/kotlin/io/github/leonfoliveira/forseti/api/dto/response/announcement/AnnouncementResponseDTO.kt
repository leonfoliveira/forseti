package io.github.leonfoliveira.forseti.api.dto.response.announcement

import io.github.leonfoliveira.forseti.api.dto.response.member.MemberPublicResponseDTO
import io.github.leonfoliveira.forseti.api.dto.response.member.toPublicResponseDTO
import io.github.leonfoliveira.forseti.common.domain.entity.Announcement
import java.time.OffsetDateTime
import java.util.UUID

data class AnnouncementResponseDTO(
    val id: UUID,
    val createdAt: OffsetDateTime,
    val member: MemberPublicResponseDTO,
    val text: String,
)

fun Announcement.toResponseDTO(): AnnouncementResponseDTO =
    AnnouncementResponseDTO(
        id = this.id,
        createdAt = this.createdAt,
        member = this.member.toPublicResponseDTO(),
        text = this.text,
    )
